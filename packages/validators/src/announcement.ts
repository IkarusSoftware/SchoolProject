import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter").max(255),
  content: z.string().min(10, "İçerik en az 10 karakter").max(10000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  targetType: z.enum(["ALL", "CLASS", "INDIVIDUAL"]),
  targetId: z.string().uuid().optional(),
  isPublished: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  attachmentUrl: z.string().url().optional(),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

export const announcementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
  targetType: z.enum(["ALL", "CLASS", "INDIVIDUAL"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  isPublished: z.coerce.boolean().optional(),
});
export type AnnouncementQuery = z.infer<typeof announcementQuerySchema>;
