import { z } from "zod";

export const mealItemSchema = z.object({
  name: z.string().min(2).max(255),
  category: z.enum(["SOUP", "MAIN", "SIDE", "DESSERT", "DRINK"]),
  calories: z.number().int().positive().optional(),
  allergens: z.array(z.string()).optional(),
  sortOrder: z.number().int().default(0),
});

export const createMealMenuSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  items: z.array(mealItemSchema).min(1, "En az bir yemek kalemi ekleyin"),
});
export type CreateMealMenuInput = z.infer<typeof createMealMenuSchema>;

export const updateMealMenuSchema = z.object({
  items: z.array(mealItemSchema).min(1).optional(),
});
export type UpdateMealMenuInput = z.infer<typeof updateMealMenuSchema>;

export const mealMenuQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
export type MealMenuQuery = z.infer<typeof mealMenuQuerySchema>;
