import { z } from "zod";

export const createScheduleSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  dayOfWeek: z.number().int().min(1).max(5), // 1=Pazartesi, 5=Cuma
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Saat HH:MM formatında olmalıdır"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Saat HH:MM formatında olmalıdır"),
  room: z.string().max(50).optional(),
});
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleSchema.partial();
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const scheduleQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  dayOfWeek: z.coerce.number().int().min(1).max(5).optional(),
});
export type ScheduleQuery = z.infer<typeof scheduleQuerySchema>;

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().max(20).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli hex renk kodu giriniz").optional(),
});
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
