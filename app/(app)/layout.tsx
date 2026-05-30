import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboardShell";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export default async function AppLayout({
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

  return (
    <DashboardShell
      user={{
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }}
    >
      {children}
    </DashboardShell>
  );
}
