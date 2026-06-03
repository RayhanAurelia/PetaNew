import { PageHeader } from "@/components/dashboard/pageHeader";
import { DailySummaryWidget } from "@/components/dashboard/dailySummaryWidget";
import { getSubjectUseCases, getNutritionLogUseCases } from "@/src/infrastructure/di/container";
import { getDefaultTarget, todayISO } from "@/components/dashboard/nutrition/nutritionTypes";

export default async function DashboardPage() {
  const { getCurrentUser, listSubjects } = await getSubjectUseCases();
  const user = await getCurrentUser.execute();
  const subjects = await listSubjects.execute(user.id);
  
  const primarySubject = subjects.find(s => s.isPrimary && s.relationship === "self") ?? subjects[0];
  
  let summary = null;
  let target = null;

  if (primarySubject) {
    const { getDailySummary } = await getNutritionLogUseCases();
    summary = await getDailySummary.execute(user.id, primarySubject.id, todayISO());
    target = getDefaultTarget(primarySubject.lifeStage);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Dashboard"
        title="Ringkasan Harian"
        description="Pantau status gizi subjek dan konsumsi makanan dalam satu tampilan."
      />

      <div className="mt-8">
        <DailySummaryWidget summary={summary} target={target} />
      </div>
    </div>
  );
}
