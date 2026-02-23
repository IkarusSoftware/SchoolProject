import type { FastifyInstance } from "fastify";
import { eq, and, desc, count, gte, lte } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { createMealMenuSchema, updateMealMenuSchema, mealMenuQuerySchema } from "@edusync/validators";
import { uuidParamSchema } from "@edusync/validators";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { NotFoundError, ForbiddenError } from "../../utils/errors";
import { UserRole } from "@edusync/shared";

export async function mealRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // ─── GET /meals ───
  app.get("/", { preHandler: [validate({ query: mealMenuQuerySchema })] }, async (request, reply) => {
    const query = (request as any).validatedQuery;
    const tenantId = request.user!.tenantId;
    const conditions: any[] = [];

    if (tenantId) conditions.push(eq(schema.mealMenus.tenantId, tenantId));
    if (query.startDate) conditions.push(gte(schema.mealMenus.date, query.startDate));
    if (query.endDate) conditions.push(lte(schema.mealMenus.date, query.endDate));
    if (query.mealType) conditions.push(eq(schema.mealMenus.mealType, query.mealType));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(schema.mealMenus).where(whereClause);
    const offset = (query.page - 1) * query.pageSize;

    const menus = await db.query.mealMenus.findMany({
      where: whereClause,
      with: { items: true },
      orderBy: [desc(schema.mealMenus.date)],
      limit: query.pageSize,
      offset,
    });

    sendPaginated(reply, menus, total, query.page, query.pageSize);
  });

  // ─── GET /meals/:id ───
  app.get("/:id", { preHandler: [validate({ params: uuidParamSchema })] }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const menu = await db.query.mealMenus.findFirst({
      where: eq(schema.mealMenus.id, id),
      with: { items: true, creator: { columns: { id: true, firstName: true, lastName: true } } },
    });
    if (!menu) throw new NotFoundError("Yemek menüsü");
    sendSuccess(reply, menu);
  });

  // ─── POST /meals ───
  app.post("/", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.STAFF),
      validate({ body: createMealMenuSchema }),
    ],
  }, async (request, reply) => {
    const { date, mealType, items } = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError();

    // Menüyü oluştur
    const [menu] = await db.insert(schema.mealMenus).values({
      tenantId,
      date,
      mealType,
      createdBy: request.user!.userId,
    }).returning();

    // Yemek kalemlerini ekle
    if (items.length > 0) {
      await db.insert(schema.mealItems).values(
        items.map((item: any, i: number) => ({
          menuId: menu.id,
          name: item.name,
          category: item.category,
          calories: item.calories,
          allergens: item.allergens || [],
          sortOrder: item.sortOrder ?? i,
        }))
      );
    }

    // Menüyü items ile birlikte döndür
    const result = await db.query.mealMenus.findFirst({
      where: eq(schema.mealMenus.id, menu.id),
      with: { items: true },
    });

    sendSuccess(reply, result, 201);
  });

  // ─── PUT /meals/:id ───
  app.put("/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.STAFF),
      validate({ params: uuidParamSchema, body: updateMealMenuSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const { items } = (request as any).validatedBody;

    const existing = await db.query.mealMenus.findFirst({ where: eq(schema.mealMenus.id, id) });
    if (!existing) throw new NotFoundError("Yemek menüsü");

    if (items) {
      // Eski kalemleri sil, yenilerini ekle
      await db.delete(schema.mealItems).where(eq(schema.mealItems.menuId, id));
      await db.insert(schema.mealItems).values(
        items.map((item: any, i: number) => ({
          menuId: id,
          name: item.name,
          category: item.category,
          calories: item.calories,
          allergens: item.allergens || [],
          sortOrder: item.sortOrder ?? i,
        }))
      );
    }

    await db.update(schema.mealMenus).set({ updatedAt: new Date() }).where(eq(schema.mealMenus.id, id));

    const result = await db.query.mealMenus.findFirst({
      where: eq(schema.mealMenus.id, id),
      with: { items: true },
    });

    sendSuccess(reply, result);
  });

  // ─── DELETE /meals/:id ───
  app.delete("/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL),
      validate({ params: uuidParamSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    await db.delete(schema.mealMenus).where(eq(schema.mealMenus.id, id));
    sendSuccess(reply, { message: "Menü silindi" });
  });
}
