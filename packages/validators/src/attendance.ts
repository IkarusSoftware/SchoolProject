import { z } from "zod";

export const createAttendanceSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  notes: z.string().max(500).optional(),
});
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;

export const bulkAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    notes: z.string().max(500).optional(),
  })).min(1, "En az bir öğrenci kaydı gerekli"),
});
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;

export const attendanceQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;

export const leaveRequestSchema = z.object({
  studentId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(5, "Neden en az 5 karakter olmalıdır").max(500),
  documentUrl: z.string().url().optional(),
});
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(500).optional(),
});
export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>;
