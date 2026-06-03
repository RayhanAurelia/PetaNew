import { z } from "zod";

const mealEnum = z.enum(["breakfast", "lunch", "dinner", "snack"]);
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createNutritionLogSchema = z.object({
  foodId: z.string().min(1).max(120).nullable(),
  foodName: z
    .string()
    .min(1, "Nama makanan wajib diisi")
    .max(200, "Nama makanan maksimal 200 karakter")
    .trim(),
  servingQuantity: z
    .number()
    .positive("Porsi harus lebih besar dari 0")
    .lt(5000, "Porsi maksimal 5000 gram"),
  servingUnit: z
    .string()
    .min(1, "Satuan wajib diisi")
    .max(40, "Satuan maksimal 40 karakter")
    .trim(),
  calories: z.number().min(0, "Kalori tidak boleh negatif"),
  protein: z.number().min(0, "Protein tidak boleh negatif"),
  carbs: z.number().min(0, "Karbo tidak boleh negatif"),
  fat: z.number().min(0, "Lemak tidak boleh negatif"),
  meal: mealEnum,
  /** Optional override. Default: server-side NOW(). */
  loggedAt: z
    .string()
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: "Timestamp loggedAt tidak valid",
    })
    .optional(),
});

export const listNutritionLogsQuerySchema = z.object({
  date: z
    .string()
    .regex(isoDateRegex, "Tanggal harus format YYYY-MM-DD")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: "Tanggal tidak valid",
    }),
});

export type CreateNutritionLogInput = z.infer<typeof createNutritionLogSchema>;
export type ListNutritionLogsQuery = z.infer<
  typeof listNutritionLogsQuerySchema
>;
