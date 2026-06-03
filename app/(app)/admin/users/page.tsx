import { redirect } from "next/navigation";
import { AdminUsersView } from "@/components/dashboard/admin/users/adminUsersView";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export default async function AdminUsersPage() {
  const { getCurrentUser } = await getAuthUseCases();

  let user;
  try {
    user = await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  return <AdminUsersView currentUserId={user.id} />;
}
