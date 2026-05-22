import { redirect } from "next/navigation";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export default async function HomePage() {
  const { getCurrentUser } = await getAuthUseCases();

  try {
    await getCurrentUser.execute();
    redirect("/dashboard");
  } catch {
    redirect("/login");
  }
}