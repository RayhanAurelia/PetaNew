export type UserRole = "user" | "admin";
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
  ) {}

  isAdmin(): boolean {
    return this.role === "admin" && this.isActive;
  }
}
