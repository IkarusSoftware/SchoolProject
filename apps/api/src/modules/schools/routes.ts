import type { FastifyInstance } from "fastify";
import { eq, count } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { authenticate, authorize } from "../../middleware/auth";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { NotFoundError } from "../../utils/errors";
import { UserRole } from "@edusync/shared";
import { validate } from "../../middleware/validate";
import { paginationSchema, uuidParamSchema } from "@edusync/validators";

export async function schoolRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // ─── GET /schools (Super Admin only) ───
  app.get(
    "/",
    {
      preHandler: [
        authorize(UserRole.SUPER_ADMIN),
        validate({ query: paginationSchema }),
      ],
    },
    async (request, reply) => {
      const query = (request as any).validatedQuery;
      const offset = (query.page - 1) * query.pageSize;

      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.tenants);

      const schools = await db.query.tenants.findMany({
        with: {
          subscriptions: {
            with: { plan: true },
            limit: 1,
            orderBy: (s, { desc }) => [desc(s.createdAt)],
          },
        },
        limit: query.pageSize,
        offset,
      });

      sendPaginated(reply, schools, total, query.page, query.pageSize);
    }
  );

  // ─── GET /schools/:id ───
  app.get(
    "/:id",
    {
      preHandler: [validate({ params: uuidParamSchema })],
    },
    async (request, reply) => {
      const { id } = (request as any).validatedParams;

      // Non-super-admins can only see their own school
      if (
        request.user!.role !== "SUPER_ADMIN" &&
        request.user!.tenantId !== id
      ) {
        throw new NotFoundError("Okul");
      }

      const school = await db.query.tenants.findFirst({
        where: eq(schema.tenants.id, id),
        with: {
          subscriptions: {
            with: { plan: true },
          },
        },
      });

      if (!school) {
        throw new NotFoundError("Okul");
      }

      // Get stats
      const [studentCount] = await db
        .select({ total: count() })
        .from(schema.students)
        .where(eq(schema.students.tenantId, id));

      const [teacherCount] = await db
        .select({ total: count() })
        .from(schema.users)
        .where(eq(schema.users.tenantId, id));

      sendSuccess(reply, {
        ...school,
        stats: {
          studentCount: studentCount.total,
          teacherCount: teacherCount.total,
        },
      });
    }
  );
}
