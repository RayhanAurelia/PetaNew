import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landingPage";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export default async function HomePage() {
  const { getCurrentUser } = await getAuthUseCases();

  // Sudah login → langsung ke dashboard. Tamu → tampilkan landing page.
  try {
    await getCurrentUser.execute();
  } catch {
    return <LandingPage />;
  }
  redirect("/dashboard");
}