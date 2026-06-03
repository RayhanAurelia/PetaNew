import { redirect } from "next/navigation";
import { ProfileView } from "@/components/dashboard/profile/profileView";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export default async function ProfilePage() {
  const { getCurrentUser } = await getAuthUseCases();

  let user;
  try {
    user = await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  return (
    <ProfileView
      initialUser={{
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }}
    />
  );
}
