import { z } from "zod";

// ─── Pagination ───
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().max(200).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ─── UUID Param ───
export const uuidParamSchema = z.object({
  id: z.string().uuid("Geçersiz ID formatı"),
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

// ─── Date Range ───
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
