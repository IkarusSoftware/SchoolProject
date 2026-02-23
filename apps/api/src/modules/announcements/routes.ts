import type { FastifyInstance } from "fastify";
import { eq, and, desc, count } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { createAnnouncementSchema, updateAnnouncementSchema, announcementQuerySchema } from "@edusync/validators";
import { uuidParamSchema } from "@edusync/validators";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { NotFoundError, ForbiddenError } from "../../utils/errors";
import { UserRole } from "@edusync/shared";

export async function announcementRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // ─── GET /announcements ───
  app.get("/", { preHandler: [validate({ query: announcementQuerySchema })] }, async (request, reply) => {
    const query = (request as any).validatedQuery;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.announcements.tenantId, tenantId));
    }
    if (query.targetType) conditions.push(eq(schema.announcements.targetType, query.targetType));
    if (query.priority) conditions.push(eq(schema.announcements.priority, query.priority));
    if (query.isPublished !== undefined) conditions.push(eq(schema.announcements.isPublished, query.isPublished));

    // Veliler sadece yayınlanmış duyuruları görebilir
    if (request.user!.role === "PARENT") {
      conditions.push(eq(schema.announcements.isPublished, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(schema.announcements).where(whereClause);
    const offset = (query.page - 1) * query.pageSize;

    const announcementsList = await db.query.announcements.findMany({
      where: whereClause,
      with: {
        author: { columns: { id: true, firstName: true, lastName: true, avatar: true } },
        reads: { columns: { userId: true } },
      },
      orderBy: [desc(schema.announcements.createdAt)],
      limit: query.pageSize,
      offset,
    });

    // Her duyuruya okunma bilgisi ekle
    const enriched = announcementsList.map(a => ({
      ...a,
      readCount: a.reads.length,
      isRead: a.reads.some(r => r.userId === request.user!.userId),
      reads: undefined,
    }));

    sendPaginated(reply, enriched, total, query.page, query.pageSize);
  });

  // ─── GET /announcements/:id ───
  app.get("/:id", { preHandler: [validate({ params: uuidParamSchema })] }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.announcements.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.announcements.tenantId, tenantId));
    }

    if (request.user!.role === "PARENT") {
      conditions.push(eq(schema.announcements.isPublished, true));
    }

    const announcement = await db.query.announcements.findFirst({
      where: and(...conditions),
      with: { author: { columns: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    if (!announcement) throw new NotFoundError("Duyuru");

    // Okundu olarak işaretle
    await db.insert(schema.announcementReads).values({
      announcementId: id,
      userId: request.user!.userId,
    }).onConflictDoNothing();

    sendSuccess(reply, announcement);
  });

  // ─── POST /announcements ───
  app.post("/", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER),
      validate({ body: createAnnouncementSchema }),
    ],
  }, async (request, reply) => {
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError();

    const [announcement] = await db.insert(schema.announcements).values({
      ...data,
      tenantId,
      authorId: request.user!.userId,
      publishedAt: data.isPublished ? new Date() : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    }).returning();

    await db.insert(schema.auditLogs).values({
      userId: request.user!.userId,
      tenantId,
      action: "CREATE",
      resource: "announcements",
      resourceId: announcement.id,
      ipAddress: request.ip,
    });

    sendSuccess(reply, announcement, 201);
  });

  // ─── PUT /announcements/:id ───
  app.put("/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER),
      validate({ params: uuidParamSchema, body: updateAnnouncementSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.announcements.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.announcements.tenantId, tenantId));
    }

    const updateData: Record<string, any> = { ...data, updatedAt: new Date() };
    if (data.isPublished && !data.publishedAt) updateData.publishedAt = new Date();
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);

    const [updated] = await db.update(schema.announcements).set(updateData)
      .where(and(...conditions)).returning();
    if (!updated) throw new NotFoundError("Duyuru");

    sendSuccess(reply, updated);
  });

  // ─── DELETE /announcements/:id ───
  app.delete("/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL),
      validate({ params: uuidParamSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.announcements.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.announcements.tenantId, tenantId));
    }

    const deleted = await db
      .delete(schema.announcements)
      .where(and(...conditions))
      .returning({ id: schema.announcements.id });

    if (!deleted.length) throw new NotFoundError("Duyuru");

    sendSuccess(reply, { message: "Duyuru silindi" });
  });
}
