import type { AdminUser } from "@/src/domain/entities/adminUser";
import type { AdminUserDTO } from "../../dtos/users/adminUserDTO";

export function toAdminUserDTO(u: AdminUser): AdminUserDTO {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    isActive: u.isActive,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt.toISOString(),
  };
}
