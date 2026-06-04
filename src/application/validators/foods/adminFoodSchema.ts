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

// Catatan: JANGAN pakai `.default()` di sini. `updateFoodSchema` dibuat dari
// `.partial()`, dan `.default()` tetap aktif pada partial — sehingga PATCH yang
// hanya mengirim sebagian field (mis. verifikasi) akan keisi default (0/"other")
// lalu menimpa kolom lain. Default untuk create ditangani di CreateFoodUseCase.
export const createFoodSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(200),
  brand: optionalText,
  category: foodCategoryEnum.optional(),
  description: optionalText,
  imageUrl: imageUrlField,
  caloriesPer100g: macroField,
  proteinPer100g: macroField.optional(),
  carbsPer100g: macroField.optional(),
  fatPer100g: macroField.optional(),
  fiberPer100g: macroField.nullable().optional(),
  isVerified: z.boolean().optional(),
});
export type CreateFoodInputDTO = z.infer<typeof createFoodSchema>;

export const updateFoodSchema = createFoodSchema.partial();
export type UpdateFoodInputDTO = z.infer<typeof updateFoodSchema>;
