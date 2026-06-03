import { redirect } from "next/navigation";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

/**
 * Guard untuk seluruh rute /admin/*. Layout (app) di atasnya sudah memastikan
 * user login & merender DashboardShell; di sini cukup pastikan role admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getCurrentUser } = await getAuthUseCases();

  let user;
  try {
    user = await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
