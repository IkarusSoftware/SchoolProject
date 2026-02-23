import type { FastifyInstance } from "fastify";
import { eq, and, count, asc, desc, gte, lte, sql, inArray } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { createAttendanceSchema, bulkAttendanceSchema, attendanceQuerySchema, leaveRequestSchema, reviewLeaveRequestSchema } from "@edusync/validators";
import { uuidParamSchema } from "@edusync/validators";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/errors";
import { UserRole } from "@edusync/shared";

export async function attendanceRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // ─── GET /attendance ───
  app.get("/", { preHandler: [validate({ query: attendanceQuerySchema })] }, async (request, reply) => {
    const query = (request as any).validatedQuery;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.attendance.tenantId, tenantId));
    }
    if (query.classId) conditions.push(eq(schema.attendance.classId, query.classId));
    if (query.studentId) conditions.push(eq(schema.attendance.studentId, query.studentId));
    if (query.date) conditions.push(eq(schema.attendance.date, query.date));
    if (query.startDate) conditions.push(gte(schema.attendance.date, query.startDate));
    if (query.endDate) conditions.push(lte(schema.attendance.date, query.endDate));
    if (query.status) conditions.push(eq(schema.attendance.status, query.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [{ total }] = await db.select({ total: count() }).from(schema.attendance).where(whereClause);
    const offset = (query.page - 1) * query.pageSize;

    const records = await db.query.attendance.findMany({
      where: whereClause,
      with: {
        student: { columns: { id: true, firstName: true, lastName: true, studentNumber: true, photo: true } },
        recorder: { columns: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [desc(schema.attendance.date)],
      limit: query.pageSize,
      offset,
    });

    sendPaginated(reply, records, total, query.page, query.pageSize);
  });

  // ─── POST /attendance (tek kayıt) ───
  app.post("/", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER),
      validate({ body: createAttendanceSchema }),
    ],
  }, async (request, reply) => {
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");

    const student = await db.query.students.findFirst({
      where: and(
        eq(schema.students.id, data.studentId),
        eq(schema.students.tenantId, tenantId)
      ),
      columns: { id: true },
    });
    if (!student) throw new NotFoundError("Öğrenci");

    if (data.classId) {
      const classRecord = await db.query.classes.findFirst({
        where: and(
          eq(schema.classes.id, data.classId),
          eq(schema.classes.tenantId, tenantId)
        ),
        columns: { id: true },
      });
      if (!classRecord) throw new NotFoundError("Sınıf");
    }

    const [record] = await db.insert(schema.attendance).values({
      ...data,
      tenantId,
      recordedBy: request.user!.userId,
    }).onConflictDoUpdate({
      target: [schema.attendance.studentId, schema.attendance.date],
      set: { status: data.status, notes: data.notes, recordedBy: request.user!.userId, updatedAt: new Date() },
    }).returning();

    sendSuccess(reply, record, 201);
  });

  // ─── POST /attendance/bulk (toplu yoklama) ───
  app.post("/bulk", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER),
      validate({ body: bulkAttendanceSchema }),
    ],
  }, async (request, reply) => {
    const { classId, date, records } = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");

    const classRecord = await db.query.classes.findFirst({
      where: and(
        eq(schema.classes.id, classId),
        eq(schema.classes.tenantId, tenantId)
      ),
      columns: { id: true },
    });
    if (!classRecord) throw new NotFoundError("Sınıf");

    const studentIds: string[] = Array.from(
      new Set(records.map((r: any) => String(r.studentId)))
    );
    const students = await db
      .select({ id: schema.students.id })
      .from(schema.students)
      .where(
        and(
          eq(schema.students.tenantId, tenantId),
          inArray(schema.students.id, studentIds)
        )
      );

    if (students.length !== studentIds.length) {
      throw new ForbiddenError("Bazı öğrenciler bu okula ait değil");
    }

    const values = records.map((r: any) => ({
      tenantId,
      studentId: r.studentId,
      classId,
      date,
      status: r.status,
      notes: r.notes,
      recordedBy: request.user!.userId,
    }));

    const result = await db.insert(schema.attendance).values(values)
      .onConflictDoNothing()
      .returning();

    await db.insert(schema.auditLogs).values({
      userId: request.user!.userId,
      tenantId,
      action: "BULK_ATTENDANCE",
      resource: "attendance",
      details: { classId, date, count: result.length },
      ipAddress: request.ip,
    });

    sendSuccess(reply, { inserted: result.length, date, classId }, 201);
  });

  // ─── GET /attendance/summary (sınıf bazlı özet) ───
  app.get("/summary", async (request, reply) => {
    const query = request.query as { classId?: string; date?: string };
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    if (!query.classId || !query.date) throw new BadRequestError("classId ve date gerekli");

    const conditions = [
      eq(schema.attendance.classId, query.classId),
      eq(schema.attendance.date, query.date),
    ];
    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.attendance.tenantId, tenantId));
    }

    const records = await db.query.attendance.findMany({
      where: and(...conditions),
      with: { student: { columns: { id: true, firstName: true, lastName: true } } },
    });

    const summary = {
      date: query.date,
      total: records.length,
      present: records.filter(r => r.status === "PRESENT").length,
      absent: records.filter(r => r.status === "ABSENT").length,
      late: records.filter(r => r.status === "LATE").length,
      excused: records.filter(r => r.status === "EXCUSED").length,
      records,
    };

    sendSuccess(reply, summary);
  });

  // ─── POST /attendance/leave-requests ───
  app.post("/leave-requests", {
    preHandler: [
      authorize(UserRole.PARENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL),
      validate({ body: leaveRequestSchema }),
    ],
  }, async (request, reply) => {
    const data = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError();

    const student = await db.query.students.findFirst({
      where: and(
        eq(schema.students.id, data.studentId),
        eq(schema.students.tenantId, tenantId)
      ),
      columns: { id: true },
    });
    if (!student) throw new NotFoundError("Öğrenci");

    if (request.user!.role === "PARENT") {
      const link = await db.query.studentParents.findFirst({
        where: and(
          eq(schema.studentParents.studentId, data.studentId),
          eq(schema.studentParents.parentId, request.user!.userId)
        ),
        columns: { id: true },
      });
      if (!link) {
        throw new ForbiddenError("Bu öğrenci için izin talebi oluşturamazsınız");
      }
    }

    const [leaveRequest] = await db.insert(schema.leaveRequests).values({
      ...data,
      tenantId,
      requestedBy: request.user!.userId,
    }).returning();

    sendSuccess(reply, leaveRequest, 201);
  });

  // ─── GET /attendance/leave-requests ───
  app.get("/leave-requests", async (request, reply) => {
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const query = request.query as { status?: string; studentId?: string };
    const conditions: any[] = [];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.leaveRequests.tenantId, tenantId));
    }
    if (query.status) conditions.push(eq(schema.leaveRequests.status, query.status));
    if (query.studentId) conditions.push(eq(schema.leaveRequests.studentId, query.studentId));

    if (request.user!.role === "PARENT") {
      conditions.push(eq(schema.leaveRequests.requestedBy, request.user!.userId));
    }

    const requests = await db.query.leaveRequests.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { student: { columns: { id: true, firstName: true, lastName: true } } },
      orderBy: [desc(schema.leaveRequests.createdAt)],
    });

    sendSuccess(reply, requests);
  });

  // ─── PUT /attendance/leave-requests/:id/review ───
  app.put("/leave-requests/:id/review", {
    preHandler: [
      authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL),
      validate({ params: uuidParamSchema, body: reviewLeaveRequestSchema }),
    ],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const { status, reviewNote } = (request as any).validatedBody;
    const tenantId = request.user!.tenantId;
    const isSuperAdmin = request.user!.role === UserRole.SUPER_ADMIN;
    const conditions: any[] = [eq(schema.leaveRequests.id, id)];

    if (!isSuperAdmin) {
      if (!tenantId) throw new ForbiddenError("Tenant bilgisi gerekli");
      conditions.push(eq(schema.leaveRequests.tenantId, tenantId));
    }

    const [updated] = await db.update(schema.leaveRequests).set({
      status,
      reviewNote,
      reviewedBy: request.user!.userId,
      reviewedAt: new Date(),
    }).where(and(...conditions)).returning();

    if (!updated) throw new NotFoundError("İzin talebi");
    sendSuccess(reply, updated);
  });
}
