import type { FastifyInstance } from "fastify";
import { eq, and, desc, asc } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { createScheduleSchema, updateScheduleSchema, scheduleQuerySchema, createSubjectSchema } from "@edusync/validators";
import { uuidParamSchema } from "@edusync/validators";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";
import { NotFoundError, ForbiddenError, ConflictError } from "../../utils/errors";
import { UserRole } from "@edusync/shared";

export async function scheduleRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // ═══ SUBJECTS (Dersler) ═══

  // ─── GET /schedules/subjects ───
  app.get("/subjects", async (request, reply) => {
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.subjects.tenantId, tenantId));
    }

    const subjectsList = await db.query.subjects.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(schema.subjects.name)],
    });

    sendSuccess(reply, subjectsList);
  });

  // ─── POST /schedules/subjects ───
  app.post("/subjects", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL),
      validate({ body: createSubjectSchema }),
    ],
  }, async (request, reply) => {
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError();

    const [subject] = await db.insert(schema.subjects).values({
      ...data,
      tenantId,
    }).returning();

    sendSuccess(reply, subject, 201);
  });

  // ─── DELETE /schedules/subjects/:id ───
  app.delete("/subjects/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL),
      validate({ params: uuidParamSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.subjects.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.subjects.tenantId, tenantId));
    }

    const deleted = await db
      .delete(schema.subjects)
      .where(and(...conditions))
      .returning({ id: schema.subjects.id });

    if (!deleted.length) throw new NotFoundError("Ders");

    sendSuccess(reply, { message: "Ders silindi" });
  });

  // ═══ SCHEDULES (Ders Programı) ═══

  // ─── GET /schedules ───
  app.get("/", { preHandler: [validate({ query: scheduleQuerySchema })] }, async (request, reply) => {
    const query = (request as any).validatedQuery;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.schedules.tenantId, tenantId));
    }
    if (query.classId) conditions.push(eq(schema.schedules.classId, query.classId));
    if (query.teacherId) conditions.push(eq(schema.schedules.teacherId, query.teacherId));
    if (query.dayOfWeek) conditions.push(eq(schema.schedules.dayOfWeek, query.dayOfWeek));

    // Öğretmen sadece kendi programını görsün (isteğe bağlı)
    if (request.user!.role === "TEACHER" && !query.classId) {
      conditions.push(eq(schema.schedules.teacherId, request.user!.userId));
    }

    const scheduleList = await db.query.schedules.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        class: { columns: { id: true, name: true } },
        subject: true,
        teacher: { columns: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [asc(schema.schedules.dayOfWeek), asc(schema.schedules.startTime)],
    });

    sendSuccess(reply, scheduleList);
  });

  // ─── POST /schedules ───
  app.post("/", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL),
      validate({ body: createScheduleSchema }),
    ],
  }, async (request, reply) => {
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError();

    const classRecord = await db.query.classes.findFirst({
      where: and(
        eq(schema.classes.id, data.classId),
        eq(schema.classes.tenantId, tenantId)
      ),
    });
    if (!classRecord) throw new NotFoundError("Sınıf");

    const subjectRecord = await db.query.subjects.findFirst({
      where: and(
        eq(schema.subjects.id, data.subjectId),
        eq(schema.subjects.tenantId, tenantId)
      ),
    });
    if (!subjectRecord) throw new NotFoundError("Ders");

    const teacherRecord = await db.query.users.findFirst({
      where: and(
        eq(schema.users.id, data.teacherId),
        eq(schema.users.tenantId, tenantId)
      ),
    });
    if (!teacherRecord) throw new NotFoundError("Öğretmen");

    const academicYearRecord = await db.query.academicYears.findFirst({
      where: and(
        eq(schema.academicYears.id, data.academicYearId),
        eq(schema.academicYears.tenantId, tenantId)
      ),
    });
    if (!academicYearRecord) throw new NotFoundError("Akademik yıl");

    // Çakışma kontrolü - aynı sınıf, aynı gün, aynı saat
    const classConflict = await db.query.schedules.findFirst({
      where: and(
        eq(schema.schedules.tenantId, tenantId),
        eq(schema.schedules.classId, data.classId),
        eq(schema.schedules.dayOfWeek, data.dayOfWeek),
        eq(schema.schedules.startTime, data.startTime),
      ),
    });
    if (classConflict) throw new ConflictError("Bu sınıfın bu saatte zaten dersi var");

    // Öğretmen çakışma kontrolü
    const teacherConflict = await db.query.schedules.findFirst({
      where: and(
        eq(schema.schedules.tenantId, tenantId),
        eq(schema.schedules.teacherId, data.teacherId),
        eq(schema.schedules.dayOfWeek, data.dayOfWeek),
        eq(schema.schedules.startTime, data.startTime),
      ),
    });
    if (teacherConflict) throw new ConflictError("Bu öğretmenin bu saatte zaten dersi var");

    const [schedule] = await db.insert(schema.schedules).values({
      ...data,
      tenantId,
    }).returning();

    const result = await db.query.schedules.findFirst({
      where: eq(schema.schedules.id, schedule.id),
      with: {
        class: { columns: { id: true, name: true } },
        subject: true,
        teacher: { columns: { id: true, firstName: true, lastName: true } },
      },
    });

    sendSuccess(reply, result, 201);
  });

  // ─── PUT /schedules/:id ───
  app.put("/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL),
      validate({ params: uuidParamSchema, body: updateScheduleSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.schedules.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.schedules.tenantId, tenantId));
    }

    const existing = await db.query.schedules.findFirst({
      where: and(...conditions),
    });
    if (!existing) throw new NotFoundError("Ders programı kaydı");

    if (!isSuperAdmin && tenantId) {
      if (data.classId) {
        const classRecord = await db.query.classes.findFirst({
          where: and(
            eq(schema.classes.id, data.classId),
            eq(schema.classes.tenantId, tenantId)
          ),
        });
        if (!classRecord) throw new NotFoundError("Sınıf");
      }

      if (data.subjectId) {
        const subjectRecord = await db.query.subjects.findFirst({
          where: and(
            eq(schema.subjects.id, data.subjectId),
            eq(schema.subjects.tenantId, tenantId)
          ),
        });
        if (!subjectRecord) throw new NotFoundError("Ders");
      }

      if (data.teacherId) {
        const teacherRecord = await db.query.users.findFirst({
          where: and(
            eq(schema.users.id, data.teacherId),
            eq(schema.users.tenantId, tenantId)
          ),
        });
        if (!teacherRecord) throw new NotFoundError("Öğretmen");
      }

      if (data.academicYearId) {
        const academicYearRecord = await db.query.academicYears.findFirst({
          where: and(
            eq(schema.academicYears.id, data.academicYearId),
            eq(schema.academicYears.tenantId, tenantId)
          ),
        });
        if (!academicYearRecord) throw new NotFoundError("Akademik yıl");
      }
    }

    const [updated] = await db
      .update(schema.schedules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(...conditions))
      .returning();
    if (!updated) throw new NotFoundError("Ders programı kaydı");

    sendSuccess(reply, updated);
  });

  // ─── DELETE /schedules/:id ───
  app.delete("/:id", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.SCHOOL_OWNER, UserRole.PRINCIPAL),
      validate({ params: uuidParamSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.schedules.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.schedules.tenantId, tenantId));
    }

    const deleted = await db
      .delete(schema.schedules)
      .where(and(...conditions))
      .returning({ id: schema.schedules.id });

    if (!deleted.length) throw new NotFoundError("Ders programı kaydı");

    sendSuccess(reply, { message: "Ders programı kaydı silindi" });
  });
}
