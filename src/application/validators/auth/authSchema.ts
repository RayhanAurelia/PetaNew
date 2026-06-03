import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(50, "Password maksimal 50 karakter")
    .trim(),
  fullName: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),
});

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Format email tidak valid"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(50, "Password maksimal 50 karakter")
    .trim(),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim()
    .optional(),
  avatarUrl: z
    .string()
    .url("URL avatar tidak valid")
    .max(500)
    .nullable()
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
