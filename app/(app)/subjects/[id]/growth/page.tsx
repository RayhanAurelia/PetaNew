import { notFound, redirect } from "next/navigation";
import { GrowthHistoryView } from "@/components/dashboard/growth/growthHistoryView";
import { getSubjectUseCases } from "@/src/infrastructure/di/container";
import { SubjectError } from "@/src/domain/errors/subjectErrors";

export default async function GrowthHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getCurrentUser, listSubjects } = await getSubjectUseCases();

  let user;
  try {
    user = await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  try {
    const subjects = await listSubjects.execute(user.id);
    const subject = subjects.find((s) => s.id === id);
    if (!subject) {
      notFound();
    }
    return <GrowthHistoryView subject={subject} />;
  } catch (err) {
    if (err instanceof SubjectError) {
      notFound();
    }
    throw err;
  }
}
