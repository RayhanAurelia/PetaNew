import { PageHeader } from "@/components/dashboard/pageHeader";
import { DailySummaryWidget } from "@/components/dashboard/dailySummaryWidget";
import { QuickStatCards, MacroProgressCard, RecentFoodsCard, SubjectsCard, HealthHighlightCard } from "@/components/dashboard/dashboardWidgets";
import { getSubjectUseCases, getNutritionLogUseCases } from "@/src/infrastructure/di/container";
import { getDefaultTarget, todayISO } from "@/components/dashboard/nutrition/nutritionTypes";

export default async function DashboardPage() {
  const { getCurrentUser, listSubjects } = await getSubjectUseCases();
  const user = await getCurrentUser.execute();
  const subjects = await listSubjects.execute(user.id);

  const primarySubject = subjects.find(s => s.isPrimary && s.relationship === "self") ?? subjects[0];

  let summary = null;
  let target = null;
  let recentLogs: any[] = [];

  if (primarySubject) {
    const { getDailySummary, listNutritionLogs } = await getNutritionLogUseCases();
    summary = await getDailySummary.execute(user.id, primarySubject.id, todayISO());
    target = getDefaultTarget(primarySubject.lifeStage);

    recentLogs = await listNutritionLogs.execute(user.id, primarySubject.id, todayISO());
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Halo, ${user.fullName.split(" ")[0]}!`}
        description="Pantau status gizi subjek dan konsumsi makanan hari ini dengan mudah."
      />

      <div className="mt-8 flex flex-col gap-6 pb-12">
        {/* Row 1: Quick Stats */}
        <QuickStatCards summary={summary} target={target} recentLogsCount={recentLogs.length} />

        {/* Row 2: Analytics, Recent Foods */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <MacroProgressCard summary={summary} target={target} />
          </div>
          <div className="lg:col-span-1">
            <RecentFoodsCard logs={recentLogs} />
          </div>
        </div>

        {/* Row 3: Subjects, Circle Tracker, Highlight */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <SubjectsCard subjects={subjects} />
          </div>
          <div className="flex flex-col justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-800">Target Gizi Harian</h3>
            <DailySummaryWidget summary={summary} target={target} />
          </div>
          <div className="lg:col-span-1">
            <HealthHighlightCard subject={primarySubject} />
          </div>
        </div>
      </div>
    </div>
  );
}
