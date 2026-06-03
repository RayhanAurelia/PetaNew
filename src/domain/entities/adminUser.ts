import type { UserRole } from "./user";

/** Representasi pengguna untuk panel admin (profil + email dari auth.users). */
export class AdminUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
  ) {}
}
