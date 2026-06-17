import type { UserRole } from "@/src/domain/entities/user";

export interface AdminUserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ListAdminUsersOutputDTO {
  items: AdminUserDTO[];
  total: number;
}
