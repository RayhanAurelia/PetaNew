import type { AdminUser } from "../entities/adminUser";
import type { UserRole } from "../entities/user";

export interface AdminListUsersOptions {
  search?: string;
  role?: UserRole;
  /** true = hanya aktif, false = hanya nonaktif, undefined = semua. */
  active?: boolean;
}

export interface IUserAdminRepository {
  list(options: AdminListUsersOptions): Promise<AdminUser[]>;
  getById(id: string): Promise<AdminUser | null>;
  updateRole(id: string, role: UserRole): Promise<AdminUser>;
  setActive(id: string, active: boolean): Promise<AdminUser>;
  /** Hapus permanen (cascade ke seluruh data milik user). */
  delete(id: string): Promise<void>;
}
