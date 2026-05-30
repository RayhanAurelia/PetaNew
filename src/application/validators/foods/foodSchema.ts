import { z } from "zod";

export const searchFoodsSchema = z.object({
  q: z
    .string()
    .min(2, "Kata kunci minimal 2 karakter")
    .max(80, "Kata kunci maksimal 80 karakter")
    .trim(),
  page: z.coerce.number().int().min(1).max(500).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SearchFoodsInput = z.infer<typeof searchFoodsSchema>;
