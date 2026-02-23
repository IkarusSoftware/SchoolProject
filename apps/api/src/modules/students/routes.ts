import type { FastifyInstance } from "fastify";
import { eq, and, ilike, sql, count, asc, desc } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { createStudentSchema, updateStudentSchema, studentListQuerySchema } from "@edusync/validators";
import { uuidParamSchema } from "@edusync/validators";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { NotFoundError, ForbiddenError } from "../../utils/errors";
import { UserRole } from "@edusync/shared";

export async function studentRoutes(app: FastifyInstance): Promise<void> {
  // All student routes require authentication
  app.addHook("preHandler", authenticate);

  // â”€â”€â”€ GET /students â”€â”€â”€
  app.get(
    "/",
    {
      preHandler: [
        authorize(
          UserRole.SUPER_ADMIN,
          UserRole.SCHOOL_OWNER,
          UserRole.PRINCIPAL,
          UserRole.VICE_PRINCIPAL,
          UserRole.TEACHER
        ),
        validate({ query: studentListQuerySchema }),
      ],
    },
    async (request, reply) => {
      const query = (request as any).validatedQuery;
      const tenantId = request.user!.tenantId;

      if (!tenantId && request.user!.role !== "SUPER_ADMIN") {
        throw new ForbiddenError();
      }

      // Build where conditions
      const conditions = [];
      if (tenantId) {
        conditions.push(eq(schema.students.tenantId, tenantId));
      }
      if (query.status) {
        conditions.push(eq(schema.students.status, query.status));
      }
      if (query.classId) {
        conditions.push(eq(schema.students.classId, query.classId));
      }
      if (query.gender) {
        conditions.push(eq(schema.students.gender, query.gender));
      }
      if (query.search) {
        conditions.push(
          sql`(${schema.students.firstName} ILIKE ${`%${query.search}%`} OR ${schema.students.lastName} ILIKE ${`%${query.search}%`} OR ${schema.students.studentNumber} ILIKE ${`%${query.search}%`})`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count total
      const [{ total }] = await db
        .select({ total: count() })
        .from(schema.students)
        .where(whereClause);

      // Fetch paginated results
      const orderFn = query.sortOrder === "asc" ? asc : desc;
      const sortColumn =
        query.sortBy === "lastName"
          ? schema.students.lastName
          : query.sortBy === "studentNumber"
            ? schema.students.studentNumber
            : query.sortBy === "createdAt"
              ? schema.students.createdAt
              : schema.students.firstName;

      const offset = (query.page - 1) * query.pageSize;

      const studentsList = await db.query.students.findMany({
        where: whereClause,
        with: {
          class: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [orderFn(sortColumn)],
        limit: query.pageSize,
        offset,
      });

      sendPaginated(reply, studentsList, total, query.page, query.pageSize);
    }
  );

  // â”€â”€â”€ GET /students/:id â”€â”€â”€
  app.get(
    "/:id",
    {
      preHandler: [
        authorize(
          UserRole.SUPER_ADMIN,
          UserRole.SCHOOL_OWNER,
          UserRole.PRINCIPAL,
          UserRole.VICE_PRINCIPAL,
          UserRole.TEACHER,
          UserRole.PARENT
        ),
        validate({ params: uuidParamSchema }),
      ],
    },
    async (request, reply) => {
      const { id } = (request as any).validatedParams;
      const tenantId = request.user!.tenantId;

      const student = await db.query.students.findFirst({
        where: and(
          eq(schema.students.id, id),
          tenantId ? eq(schema.students.tenantId, tenantId) : undefined
        ),
        with: {
          class: {
            with: {
              gradeLevel: true,
            },
          },
          parents: {
            with: {
              parent: {
                columns: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!student) {
        throw new NotFoundError("Ã–ÄŸrenci");
      }

      // If parent, check they're linked to this student
      if (request.user!.role === "PARENT") {
        const isLinked = student.parents.some(
          (sp) => sp.parentId === request.user!.userId
        );
        if (!isLinked) {
          throw new ForbiddenError("Bu Ã¶ÄŸrencinin bilgilerine eriÅŸim yetkiniz yok");
        }
      }

      sendSuccess(reply, student);
    }
  );

  // â”€â”€â”€ POST /students â”€â”€â”€
  app.post(
    "/",
    {
      preHandler: [
        authorize(
          UserRole.SUPER_ADMIN,
          UserRole.SCHOOL_OWNER,
          UserRole.PRINCIPAL,
          UserRole.VICE_PRINCIPAL
        ),
        validate({ body: createStudentSchema }),
      ],
    },
    async (request, reply) => {
      const data = (request as any).validatedBody;
      const tenantId = request.user!.tenantId;

      if (!tenantId) {
        throw new ForbiddenError("Tenant bilgisi gerekli");
      }

      if (data.classId) {
        const classRecord = await db.query.classes.findFirst({
          where: and(
            eq(schema.classes.id, data.classId),
            eq(schema.classes.tenantId, tenantId)
          ),
          columns: { id: true },
        });

        if (!classRecord) {
          throw new NotFoundError("SÄ±nÄ±f");
        }
      }

      // Generate student number
      const [lastStudent] = await db
        .select({ studentNumber: schema.students.studentNumber })
        .from(schema.students)
        .where(eq(schema.students.tenantId, tenantId))
        .orderBy(desc(schema.students.studentNumber))
        .limit(1);

      const year = new Date().getFullYear().toString();
      let nextNumber = 1;
      if (lastStudent?.studentNumber) {
        const lastNum = parseInt(lastStudent.studentNumber.slice(-4), 10);
        nextNumber = lastNum + 1;
      }
      const studentNumber = `${year}${nextNumber.toString().padStart(4, "0")}`;

      // Create student
      const [student] = await db
        .insert(schema.students)
        .values({
          ...data,
          tenantId,
          studentNumber,
          dateOfBirth: new Date(data.dateOfBirth),
        })
        .returning();

      // Audit log
      await db.insert(schema.auditLogs).values({
        userId: request.user!.userId,
        tenantId,
        action: "CREATE",
        resource: "students",
        resourceId: student.id,
        details: { studentNumber },
        ipAddress: request.ip,
      });

      sendSuccess(reply, student, 201);
    }
  );

  // â”€â”€â”€ PUT /students/:id â”€â”€â”€
  app.put(
    "/:id",
    {
      preHandler: [
        authorize(
          UserRole.SUPER_ADMIN,
          UserRole.SCHOOL_OWNER,
          UserRole.PRINCIPAL,
          UserRole.VICE_PRINCIPAL
        ),
        validate({ params: uuidParamSchema, body: updateStudentSchema }),
      ],
    },
    async (request, reply) => {
      const { id } = (request as any).validatedParams;
      const data = (request as any).validatedBody;
      const tenantId = request.user!.tenantId;
      const conditions: any[] = [eq(schema.students.id, id)];
      if (tenantId) conditions.push(eq(schema.students.tenantId, tenantId));

      // Check student exists and belongs to tenant
      const existing = await db.query.students.findFirst({
        where: and(...conditions),
      });

      if (!existing) {
        throw new NotFoundError("Öğrenci");
      }

      if (data.classId) {
        const classRecord = await db.query.classes.findFirst({
          where: and(
            eq(schema.classes.id, data.classId),
            eq(schema.classes.tenantId, existing.tenantId)
          ),
          columns: { id: true },
        });

        if (!classRecord) {
          throw new NotFoundError("Sınıf");
        }
      }

      // Update
      const updateData: Record<string, any> = { ...data, updatedAt: new Date() };
      if (data.dateOfBirth) {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      }

      const [updated] = await db
        .update(schema.students)
        .set(updateData)
        .where(and(...conditions))
        .returning();

      // Audit log
      await db.insert(schema.auditLogs).values({
        userId: request.user!.userId,
        tenantId,
        action: "UPDATE",
        resource: "students",
        resourceId: id,
        ipAddress: request.ip,
      });

      sendSuccess(reply, updated);
    }
  );

  // â”€â”€â”€ DELETE /students/:id â”€â”€â”€
  app.delete(
    "/:id",
    {
      preHandler: [
        authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL),
        validate({ params: uuidParamSchema }),
      ],
    },
    async (request, reply) => {
      const { id } = (request as any).validatedParams;
      const tenantId = request.user!.tenantId;
      const conditions: any[] = [eq(schema.students.id, id)];
      if (tenantId) conditions.push(eq(schema.students.tenantId, tenantId));

      const existing = await db.query.students.findFirst({
        where: and(...conditions),
      });

      if (!existing) {
        throw new NotFoundError("Öğrenci");
      }

      // Soft delete (set status to INACTIVE)
      await db
        .update(schema.students)
        .set({ status: "INACTIVE", updatedAt: new Date() })
        .where(and(...conditions));

      // Audit log
      await db.insert(schema.auditLogs).values({
        userId: request.user!.userId,
        tenantId,
        action: "DELETE",
        resource: "students",
        resourceId: id,
        ipAddress: request.ip,
      });

      sendSuccess(reply, { message: "Ã–ÄŸrenci baÅŸarÄ±yla silindi" });
    }
  );
}

