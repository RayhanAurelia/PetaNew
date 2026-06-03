import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationDTO } from "../../dtos/notifications/notificationDTO";

const GROWTH_REMINDER_WARN_DAYS = 14;
const GROWTH_REMINDER_DANGER_DAYS = 30;
const NUTRITION_REMINDER_AFTER_HOUR = 11; // baru muncul setelah jam 11 siang
const NEW_ARTICLES_WINDOW_DAYS = 7;

interface SubjectMini {
  id: string;
  name: string;
  age_years: number;
  life_stage: "balita" | "anak" | "remaja" | "dewasa";
}

interface LatestGrowthMini {
  subject_id: string;
  bmi: number | null;
  recorded_at: string;
}

/**
 * Aggregator notifikasi — dihitung on-the-fly dari data yang sudah ada.
 * Tidak menyimpan tabel notifications baru. Client menyimpan flag "dismissed"
 * di localStorage berbasis `id` yang stabil per kondisi.
 */
export class GetNotificationsUseCase {
  constructor(private readonly client: SupabaseClient) {}

  async execute(profileId: string): Promise<NotificationDTO[]> {
    const today = isoDate(new Date());
    const subjects = await this.loadSubjects(profileId);
    const subjectIds = subjects.map((s) => s.id);

    const [latestGrowthMap, todaysNutritionMap, newArticleCount] =
      await Promise.all([
        this.loadLatestGrowth(subjectIds),
        this.loadTodaysNutritionCounts(subjectIds, today),
        this.countNewArticles(NEW_ARTICLES_WINDOW_DAYS),
      ]);

    const notifications: NotificationDTO[] = [];
    const now = new Date();

    for (const s of subjects) {
      // 1. Reminder pengukuran
      const latest = latestGrowthMap.get(s.id);
      const reminder = buildGrowthReminder(s, latest, now);
      if (reminder) notifications.push(reminder);

      // 2. BMI alert (kalau extreme)
      const bmiAlert = buildBmiAlert(s, latest, now);
      if (bmiAlert) notifications.push(bmiAlert);

      // 3. Reminder catat makan hari ini (hanya setelah jam tertentu)
      if (now.getHours() >= NUTRITION_REMINDER_AFTER_HOUR) {
        const hasNutritionToday = (todaysNutritionMap.get(s.id) ?? 0) > 0;
        if (!hasNutritionToday) {
          notifications.push(buildNutritionReminder(s, today, now));
        }
      }
    }

    // 4. Artikel baru minggu ini
    if (newArticleCount > 0) {
      notifications.push(buildNewArticles(newArticleCount, now));
    }

    // Urutkan: danger → warning → info, lalu terbaru dulu.
    return notifications.sort(bySeverityThenDate);
  }

  private async loadSubjects(profileId: string): Promise<SubjectMini[]> {
    const { data, error } = await this.client
      .from("subjects_enriched")
      .select("id, name, age_years, life_stage")
      .eq("profile_id", profileId);
    if (error || !data) return [];
    return data as SubjectMini[];
  }

  private async loadLatestGrowth(
    subjectIds: string[],
  ): Promise<Map<string, LatestGrowthMini>> {
    if (subjectIds.length === 0) return new Map();
    const { data, error } = await this.client
      .from("latest_growth")
      .select("subject_id, bmi, recorded_at")
      .in("subject_id", subjectIds);
    if (error || !data) return new Map();
    return new Map(
      (data as LatestGrowthMini[]).map((r) => [r.subject_id, r]),
    );
  }

  private async loadTodaysNutritionCounts(
    subjectIds: string[],
    today: string,
  ): Promise<Map<string, number>> {
    if (subjectIds.length === 0) return new Map();
    const { data, error } = await this.client
      .from("nutrition_log")
      .select("subject_id")
      .in("subject_id", subjectIds)
      .eq("log_date", today);
    if (error || !data) return new Map();
    const map = new Map<string, number>();
    for (const row of data as { subject_id: string }[]) {
      map.set(row.subject_id, (map.get(row.subject_id) ?? 0) + 1);
    }
    return map;
  }

  private async countNewArticles(windowDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - windowDays);
    const { count, error } = await this.client
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .gte("published_at", cutoff.toISOString());
    if (error) return 0;
    return count ?? 0;
  }
}

// ---------------------- Builders ----------------------

function buildGrowthReminder(
  s: SubjectMini,
  latest: LatestGrowthMini | undefined,
  now: Date,
): NotificationDTO | null {
  // Tanpa data → reminder "belum pernah mengukur"
  if (!latest) {
    return {
      id: `growth_reminder-never-${s.id}`,
      type: "growth_reminder",
      severity: "warning",
      title: `Belum ada pengukuran untuk ${s.name}`,
      description:
        "Catat tinggi & berat pertama agar status gizi bisa dipantau.",
      href: `/subjects/${s.id}/growth`,
      createdAt: now.toISOString(),
    };
  }

  const recorded = new Date(latest.recorded_at);
  const daysAgo = Math.floor(
    (now.getTime() - recorded.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysAgo < GROWTH_REMINDER_WARN_DAYS) return null;

  const severity: NotificationDTO["severity"] =
    daysAgo >= GROWTH_REMINDER_DANGER_DAYS ? "danger" : "warning";

  return {
    id: `growth_reminder-${s.id}-${latest.recorded_at}`,
    type: "growth_reminder",
    severity,
    title: `Pengukuran ${s.name} belum diperbarui ${daysAgo} hari`,
    description:
      severity === "danger"
        ? "Sudah lebih dari sebulan. Catat pengukuran terbaru sekarang."
        : "Tinggi & berat sebaiknya dicatat minimal 2 minggu sekali.",
    href: `/subjects/${s.id}/growth`,
    createdAt: recorded.toISOString(),
  };
}

function buildBmiAlert(
  s: SubjectMini,
  latest: LatestGrowthMini | undefined,
  now: Date,
): NotificationDTO | null {
  if (!latest || latest.bmi == null) return null;
  const bmi = Number(latest.bmi);
  if (Number.isNaN(bmi)) return null;

  // Cuma trigger untuk dewasa (cutoff WHO Asia definitif).
  // Anak/balita perlu Z-score WHO yang belum di-bundle.
  if (s.age_years < 19) return null;

  let level: "ok" | "warn" | "danger" = "ok";
  let label = "";
  if (bmi < 18.5) {
    level = "warn";
    label = "kekurangan berat";
  } else if (bmi >= 30) {
    level = "danger";
    label = "obesitas tingkat II";
  } else if (bmi >= 25) {
    level = "warn";
    label = "obesitas tingkat I";
  }
  if (level === "ok") return null;

  return {
    id: `bmi_alert-${s.id}-${latest.recorded_at}`,
    type: "bmi_alert",
    severity: level === "danger" ? "danger" : "warning",
    title: `BMI ${s.name}: ${bmi.toFixed(1)} (${label})`,
    description:
      "Pertimbangkan konsultasi dengan ahli gizi atau dokter untuk evaluasi lebih lanjut.",
    href: `/subjects/${s.id}/growth`,
    createdAt: new Date(latest.recorded_at).toISOString(),
  };
}

function buildNutritionReminder(
  s: SubjectMini,
  today: string,
  now: Date,
): NotificationDTO {
  return {
    id: `nutrition_reminder-${s.id}-${today}`,
    type: "nutrition_reminder",
    severity: "info",
    title: `Catat makanan ${s.name} hari ini`,
    description:
      "Belum ada catatan konsumsi hari ini. Catat agar progres gizi terpantau.",
    href: `/log`,
    createdAt: now.toISOString(),
  };
}

function buildNewArticles(count: number, now: Date): NotificationDTO {
  const weekKey = isoWeekKey(now);
  return {
    id: `new_articles-${weekKey}`,
    type: "new_articles",
    severity: "info",
    title: `${count} artikel baru minggu ini`,
    description:
      "Tim PETA menerbitkan artikel edukasi gizi baru. Cek di halaman Artikel.",
    href: "/articles",
    createdAt: now.toISOString(),
  };
}

// ---------------------- Helpers ----------------------

const SEVERITY_RANK: Record<NotificationDTO["severity"], number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

function bySeverityThenDate(a: NotificationDTO, b: NotificationDTO): number {
  const s = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  if (s !== 0) return s;
  return a.createdAt < b.createdAt ? 1 : -1;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isoWeekKey(d: Date): string {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7,
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
