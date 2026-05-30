import { z } from "zod";

const genderEnum = z.enum(["male", "female", "other"]);
const relationshipEnum = z.enum([
  "self",
  "child",
  "wife",
  "husband",
  "parent",
  "sibling",
  "other",
]);

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const birthDateField = z
  .string()
  .regex(isoDateRegex, "Tanggal lahir harus format YYYY-MM-DD")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), {
    message: "Tanggal tidak valid",
  })
  .refine((s) => new Date(s) <= new Date(), {
    message: "Tanggal lahir tidak boleh di masa depan",
  })
  .refine(
    (s) => {
      const years = new Date().getFullYear() - new Date(s).getFullYear();
      return years <= 120;
    },
    { message: "Usia melebihi batas wajar (max 120 tahun)" },
  );

const heightField = z
  .number()
  .positive("Tinggi harus lebih besar dari 0")
  .lt(300, "Tinggi harus kurang dari 300 cm")
  .nullable()
  .optional();

const activityField = z
  .number()
  .min(1, "Level aktivitas minimal 1.0")
  .max(2.5, "Level aktivitas maksimal 2.5");

export const createSubjectSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .trim(),
    gender: genderEnum,
    birthDate: birthDateField,
    relationship: relationshipEnum,
    heightCm: heightField,
    activityLevel: activityField,
    isPrimary: z.boolean(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .refine((d) => !d.isPrimary || d.relationship === "self", {
    message: "Subjek utama (primary) hanya untuk relationship 'self'",
    path: ["isPrimary"],
  });

export const updateSubjectSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .trim()
      .optional(),
    gender: genderEnum.optional(),
    birthDate: birthDateField.optional(),
    relationship: relationshipEnum.optional(),
    heightCm: heightField,
    activityLevel: activityField.optional(),
    isPrimary: z.boolean().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .refine(
    (d) => {
      if (d.isPrimary === true && d.relationship && d.relationship !== "self") {
        return false;
      }
      return true;
    },
    {
      message: "Subjek utama (primary) hanya untuk relationship 'self'",
      path: ["isPrimary"],
    },
  );

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
