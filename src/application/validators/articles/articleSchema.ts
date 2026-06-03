import { z } from "zod";

const lifeStageEnum = z.enum(["balita", "anak", "remaja", "dewasa"]);

export const listArticlesQuerySchema = z.object({
  lifeStage: lifeStageEnum.optional(),
  page: z.coerce.number().int().min(1).max(200).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(40).optional().default(12),
});

export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;

/** Ubah judul menjadi slug URL-friendly (huruf kecil, tanda hubung). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // buang diakritik
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const optionalText = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .nullable();

const slugField = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung");

const coverUrlField = z
  .url("URL gambar tidak valid")
  .max(1000)
  .or(z.literal(""))
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

export const adminListArticlesQuerySchema = z.object({
  status: z.enum(["all", "published", "draft"]).optional().default("all"),
  lifeStage: lifeStageEnum.optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(500).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type AdminListArticlesQuery = z.infer<
  typeof adminListArticlesQuerySchema
>;

export const createArticleSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  slug: slugField.optional(),
  excerpt: optionalText,
  content: z.string().trim().min(1, "Konten tidak boleh kosong").max(50000),
  coverImageUrl: coverUrlField,
  targetLifeStage: lifeStageEnum.optional().nullable(),
  isPublished: z.boolean().optional().default(false),
});
export type CreateArticleInputDTO = z.infer<typeof createArticleSchema>;

export const updateArticleSchema = createArticleSchema.partial();
export type UpdateArticleInputDTO = z.infer<typeof updateArticleSchema>;
