import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminUser } from "@/src/domain/entities/adminUser";
import type { UserRole } from "@/src/domain/entities/user";
import type {
  AdminListUsersOptions,
  IUserAdminRepository,
} from "@/src/domain/repositories/IUserAdminRepository";
import {
  AdminUserNotFoundError,
  CannotModifySelfError,
  UserAdminOperationFailedError,
} from "@/src/domain/errors/userAdminErrors";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

function toDomain(row: UserRow): AdminUser {
  return new AdminUser(
    row.id,
    row.email,
    row.full_name,
    row.role,
    row.is_active,
    row.avatar_url,
    new Date(row.created_at),
  );
}

/**
 * Repository admin pengguna. Pembacaan email & penghapusan akun memakai RPC
 * SECURITY DEFINER (lihat `supabase/admin-users.sql`); perubahan role/status
 * memakai UPDATE biasa yang sudah diizinkan RLS untuk admin.
 */
export class SupabaseUserAdminRepository implements IUserAdminRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(options: AdminListUsersOptions): Promise<AdminUser[]> {
    const { data, error } = await this.client.rpc("admin_list_users", {
      p_search: options.search ?? null,
      p_role: options.role ?? null,
      p_active: options.active ?? null,
    });
    if (error) throw new UserAdminOperationFailedError(error.message);
    return ((data ?? []) as UserRow[]).map(toDomain);
  }

  async getById(id: string): Promise<AdminUser | null> {
    const { data, error } = await this.client.rpc("admin_get_user", {
      p_target: id,
    });
    if (error) throw new UserAdminOperationFailedError(error.message);
    const rows = (data ?? []) as UserRow[];
    return rows.length > 0 ? toDomain(rows[0]) : null;
  }

  async updateRole(id: string, role: UserRole): Promise<AdminUser> {
    const { error } = await this.client
      .from("profiles")
      .update({ role })
      .eq("id", id);
    if (error) throw new UserAdminOperationFailedError(error.message);
    return this.reload(id);
  }

  async setActive(id: string, active: boolean): Promise<AdminUser> {
    const { error } = await this.client
      .from("profiles")
      .update({ is_active: active })
      .eq("id", id);
    if (error) throw new UserAdminOperationFailedError(error.message);
    return this.reload(id);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.rpc("admin_delete_user", {
      p_target: id,
    });
    if (error) {
      if (error.message.includes("cannot delete self")) {
        throw new CannotModifySelfError("Anda tidak dapat menghapus akun sendiri");
      }
      throw new UserAdminOperationFailedError(error.message);
    }
  }

  private async reload(id: string): Promise<AdminUser> {
    const user = await this.getById(id);
    if (!user) throw new AdminUserNotFoundError();
    return user;
  }
}
