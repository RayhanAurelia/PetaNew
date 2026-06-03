export interface ProfileUser {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  avatarUrl: string | null;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}
