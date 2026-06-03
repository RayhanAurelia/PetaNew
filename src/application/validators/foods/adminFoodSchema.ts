import { z } from "zod";

export const foodCategoryEnum = z.enum([
  "staple",
  "protein_animal",
  "protein_plant",
  "vegetable",
  "fruit",
  "dairy",
  "snack",
  "beverage",
  "other",
]);

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .nullable();

const imageUrlField = z
  .url("URL gambar tidak valid")
  .max(1000)
  .or(z.literal(""))
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

/** Nutrisi non-negatif dengan batas wajar (per 100 g). */
const macroField = z.coerce
  .number()
  .nonnegative("Tidak boleh negatif")
  .max(10000, "Nilai terlalu besar");

export const adminListFoodsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: foodCategoryEnum.optional(),
  verified: z.enum(["all", "verified", "unverified"]).optional().default("all"),
  page: z.coerce.number().int().min(1).max(500).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type AdminListFoodsQuery = z.infer<typeof adminListFoodsQuerySchema>;

export const createFoodSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(200),
  brand: optionalText,
  category: foodCategoryEnum.optional().default("other"),
  description: optionalText,
  imageUrl: imageUrlField,
  caloriesPer100g: macroField,
  proteinPer100g: macroField.optional().default(0),
  carbsPer100g: macroField.optional().default(0),
  fatPer100g: macroField.optional().default(0),
  fiberPer100g: macroField.nullable().optional(),
  isVerified: z.boolean().optional().default(false),
});
export type CreateFoodInputDTO = z.infer<typeof createFoodSchema>;

export const updateFoodSchema = createFoodSchema.partial();
export type UpdateFoodInputDTO = z.infer<typeof updateFoodSchema>;
