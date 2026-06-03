import { z } from "zod";

export const userRoleEnum = z.enum(["user", "admin"]);

export const adminListUsersQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  role: userRoleEnum.optional(),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
});
export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;

export const updateUserSchema = z
  .object({
    role: userRoleEnum.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.isActive !== undefined, {
    message: "Tidak ada perubahan yang dikirim",
  });
export type UpdateUserInputDTO = z.infer<typeof updateUserSchema>;
