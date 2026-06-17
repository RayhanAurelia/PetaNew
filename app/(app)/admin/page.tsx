import { Apple, ClipboardList, FileText, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/pageHeader";
import { AdminCarousel } from "@/components/dashboard/admin/adminCarousel";
import type { CarouselSlide } from "@/components/dashboard/admin/adminCarousel";
import { KpiCard } from "@/components/dashboard/admin/adminTable";
import {
  ACTION_LABEL,
  ACTION_STYLE,
  changeSummary,
  entryTitle,
  formatDateTimeID,
  TARGET_LABEL,
} from "@/components/dashboard/admin/audit/adminAuditTypes";
import { formatDateID } from "@/components/dashboard/admin/articles/adminArticleTypes";
import {
  getAdminArticleUseCases,
  getAdminAuditUseCases,
  getAdminFoodUseCases,
  getAdminUserUseCases,
} from "@/src/infrastructure/di/container";

const SHORTCUT_GROUPS = [
  {
    title: "Konten",
    items: [
      {
        href: "/admin/food",
        icon: Apple,
        title: "Master Makanan",
        desc: "CRUD, verifikasi, dan pratinjau basis data makanan.",
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        href: "/admin/articles",
        icon: FileText,
        title: "Kelola Artikel",
        desc: "Tulis, sunting, terbitkan, dan pratinjau artikel edukasi.",
        gradient: "from-blue-500 to-indigo-600",
      },
    ],
  },
  {
    title: "Pengawasan",
    items: [
      {
        href: "/admin/users",
        icon: UserCog,
        title: "Kelola Pengguna",
        desc: "Atur role, status, dan hapus akun pengguna.",
        gradient: "from-amber-500 to-orange-600",
      },
      {
        href: "/admin/audit",
        icon: ClipboardList,
        title: "Audit Log",
        desc: "Riwayat semua perubahan data platform.",
        gradient: "from-fuchsia-500 to-purple-600",
      },
    ],
  },
];

const nf = new Intl.NumberFormat("id-ID");

export default async function AdminDashboardPage() {
  const [userUC, foodUC, articleUC, auditUC] = await Promise.all([
    getAdminUserUseCases(),
    getAdminFoodUseCases(),
    getAdminArticleUseCases(),
    getAdminAuditUseCases(),
  ]);

  const [users, foods, foodsVerified, articles, articlesPublished, audit] =
    await Promise.all([
      userUC.adminListUsers.execute({}),
      foodUC.adminListFoods.execute({ pageSize: 5 }),
      foodUC.adminListFoods.execute({ verified: "verified", pageSize: 1 }),
      articleUC.adminListArticles.execute({ pageSize: 5 }),
      articleUC.adminListArticles.execute({ status: "published", pageSize: 1 }),
      auditUC.adminListAuditLogs.execute({ pageSize: 5 }),
    ]);

  const activeUsers = users.items.filter((u) => u.isActive).length;

  // Cincin progres mengukur capaian menuju target 100 per metrik
  // (bukan rasio terhadap total saat ini, agar tidak langsung 100%).
  const TARGET = 100;
  const toTarget = (value: number) =>
    Math.min(100, Math.round((value / TARGET) * 100));

  const kpis = [
    {
      icon: Users,
      label: "Pengguna",
      value: nf.format(users.total),
      caption: `${nf.format(activeUsers)} aktif · target ${TARGET}`,
      percent: toTarget(users.total),
      gradient: "from-amber-500 to-orange-600",
      accent: "#f59e0b",
      href: "/admin/users",
    },
    {
      icon: Apple,
      label: "Makanan",
      value: nf.format(foods.total),
      caption: `${nf.format(foodsVerified.total)} terverifikasi · target ${TARGET}`,
      percent: toTarget(foods.total),
      gradient: "from-emerald-500 to-teal-600",
      accent: "#14b8a6",
      href: "/admin/food",
    },
    {
      icon: FileText,
      label: "Artikel",
      value: nf.format(articles.total),
      caption: `${nf.format(articlesPublished.total)} terbit · target ${TARGET}`,
      percent: toTarget(articles.total),
      gradient: "from-blue-500 to-indigo-600",
      accent: "#6366f1",
      href: "/admin/articles",
    },
    {
      icon: ClipboardList,
      label: "Log Audit",
      value: nf.format(audit.total),
      caption: `aktivitas tercatat · target ${TARGET}`,
      percent: toTarget(audit.total),
      gradient: "from-fuchsia-500 to-purple-600",
      accent: "#a855f7",
      href: "/admin/audit",
    },
  ];

  const slides: CarouselSlide[] = [
    {
      key: "activity",
      title: "Aktivitas Terbaru",
      href: "/admin/audit",
      emptyText: "Belum ada aktivitas.",
      items: audit.items.map((e) => ({
        id: e.id,
        primary: `${TARGET_LABEL[e.targetType]} - ${entryTitle(e)}`,
        secondary: `${changeSummary(e)} · ${e.actorName || e.actorEmail || "Sistem"} · ${formatDateTimeID(e.createdAt)}`,
        badge: { label: ACTION_LABEL[e.action], className: ACTION_STYLE[e.action] },
      })),
    },
    {
      key: "articles",
      title: "Artikel Terbaru",
      href: "/admin/articles",
      emptyText: "Belum ada artikel.",
      items: articles.items.map((a) => ({
        id: a.id,
        primary: a.title,
        secondary: a.isPublished
          ? `Terbit ${formatDateID(a.publishedAt)}`
          : `Dibuat ${formatDateID(a.createdAt)}`,
        badge: {
          label: a.isPublished ? "Terbit" : "Draft",
          className: a.isPublished
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-amber-50 text-amber-700 ring-amber-200",
        },
      })),
    },
    {
      key: "foods",
      title: "Makanan Terbaru",
      href: "/admin/food",
      emptyText: "Belum ada makanan.",
      items: foods.items.map((f) => ({
        id: f.id,
        primary: f.name,
        secondary: `${f.brand ? `${f.brand} · ` : ""}${formatDateID(f.createdAt)}`,
        badge: {
          label: f.isVerified ? "Terverifikasi" : "Belum",
          className: f.isVerified
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-red-50 text-red-700 ring-red-200",
        },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Panel Admin"
        title="Pusat Kontrol PETA"
        description="Ringkasan platform dan kelola konten serta basis data."
      />

      {/* KPI cards dengan cincin progres rasio */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Carousel pratinjau + shortcut (berdampingan di desktop) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminCarousel slides={slides} />
        </div>

        <div className="space-y-6 lg:col-span-1">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {group.title}
              </h2>
              <div className="grid gap-3">
                {group.items.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
                    >
                      <div
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-sm transition group-hover:scale-105 ${s.gradient}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-brand-primary">
                          {s.title}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {s.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
