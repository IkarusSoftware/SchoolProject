import { z } from "zod";

export const createConversationSchema = z.object({
  participantId: z.string().uuid("Geçerli bir kullanıcı seçiniz"),
  type: z.enum(["DIRECT", "GROUP"]).default("DIRECT"),
  title: z.string().max(255).optional(),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Mesaj boş olamaz").max(5000),
  type: z.enum(["TEXT", "IMAGE", "FILE", "VOICE"]).default("TEXT"),
  metadata: z.record(z.unknown()).optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const messageListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(30),
  before: z.string().datetime().optional(),
});
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
