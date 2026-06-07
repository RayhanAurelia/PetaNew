import { DashboardView } from "@/components/dashboard/dashboardView";
import {
  getSubjectUseCases,
  getNutritionLogUseCases,
  getGrowthLogUseCases,
  getArticleUseCases,
} from "@/src/infrastructure/di/container";
import {
  todayISO,
  type NutritionLogDTO,
  type DailySummaryDTO,
} from "@/components/dashboard/nutrition/nutritionTypes";
import type { GrowthLogDTO } from "@/components/dashboard/growth/growthTypes";

export default async function DashboardPage() {
  const { getCurrentUser, listSubjects } = await getSubjectUseCases();
  const user = await getCurrentUser.execute();
  const subjects = await listSubjects.execute(user.id);

  const primarySubject =
    subjects.find((s) => s.isPrimary && s.relationship === "self") ?? subjects[0] ?? null;

  let summary: DailySummaryDTO | null = null;
  let recentLogs: NutritionLogDTO[] = [];
  let growthLogs: GrowthLogDTO[] = [];

  if (primarySubject) {
    const { getDailySummary, listNutritionLogs } = await getNutritionLogUseCases();
    const { listGrowthLogs } = await getGrowthLogUseCases();

    summary = await getDailySummary.execute(user.id, primarySubject.id, todayISO());
    recentLogs = await listNutritionLogs.execute(user.id, primarySubject.id, todayISO());
    growthLogs = await listGrowthLogs.execute(user.id, primarySubject.id);
  }

  // Artikel unggulan untuk kartu sorotan (backdrop gambar + judul/ringkasan).
  const { listArticles } = await getArticleUseCases();
  // Ambil artikel terbaru yang dipublikasikan (tanpa filter tahap usia) agar
  // kartu sorotan selalu terisi selama ada artikel terbit.
  const articleResult = await listArticles.execute(undefined, 1, 5);

  return (
    <DashboardView
      userFirstName={user.fullName.split(" ")[0]}
      subjects={subjects}
      primarySubjectId={primarySubject?.id ?? null}
      initialSummary={summary}
      initialLogs={recentLogs}
      initialGrowth={growthLogs}
      articles={articleResult.items}
    />
  );
}
