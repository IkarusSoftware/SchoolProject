import { z } from "zod";

// ─── Create Student ───
export const createStudentSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır").max(50),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır").max(50),
  nationalId: z
    .string()
    .length(11, "TC Kimlik numarası 11 haneli olmalıdır")
    .regex(/^[0-9]+$/, "TC Kimlik numarası sadece rakam içermelidir")
    .optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır"),
  gender: z.enum(["MALE", "FEMALE"]),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"])
    .optional(),
  address: z.string().max(500).optional(),
  classId: z.string().uuid("Geçerli bir sınıf seçiniz").optional(),
  healthNotes: z.string().max(1000).optional(),
  allergies: z.array(z.string()).optional(),
  parentInfo: z
    .object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
      phone: z.string(),
      relation: z.enum(["MOTHER", "FATHER", "GUARDIAN", "OTHER"]),
    })
    .optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

// ─── Update Student ───
export const updateStudentSchema = createStudentSchema.partial();
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

// ─── Student List Query ───
export const studentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  classId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED", "SUSPENDED"]).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  sortBy: z.enum(["firstName", "lastName", "studentNumber", "createdAt"]).default("firstName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
