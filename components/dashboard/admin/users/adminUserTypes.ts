export type UserRole = "user" | "admin";

export interface AdminUserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ListAdminUsersResult {
  items: AdminUserDTO[];
  total: number;
}

export type StatusFilter = "all" | "active" | "inactive";

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export const ROLE_LABEL: Record<UserRole, string> = {
  user: "Pengguna",
  admin: "Admin",
};

export interface ApiOk<T> {
  success: true;
  data: T;
}
export interface ApiErr {
  success: false;
  error: { code: string; message: string; details?: Record<string, string[]> };
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function formatDateID(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}
