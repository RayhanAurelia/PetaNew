import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createGrowthLogSchema = z.object({
  weightKg: z
    .number()
    .positive("Berat harus lebih besar dari 0")
    .lt(500, "Berat harus kurang dari 500 kg"),
  heightCm: z
    .number()
    .positive("Tinggi harus lebih besar dari 0")
    .lt(300, "Tinggi harus kurang dari 300 cm"),
  recordedAt: z
    .string()
    .regex(isoDateRegex, "Tanggal pengukuran harus format YYYY-MM-DD")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: "Tanggal tidak valid",
    })
    .refine((s) => new Date(s) <= new Date(), {
      message: "Tanggal pengukuran tidak boleh di masa depan",
    }),
  description: z
    .string()
    .max(500, "Catatan maksimal 500 karakter")
    .trim()
    .optional()
    .nullable(),
});

export type CreateGrowthLogInput = z.infer<typeof createGrowthLogSchema>;
