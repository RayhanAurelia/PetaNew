import { Apple, ClipboardList, FileText, UserCog } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/pageHeader";

const SHORTCUTS = [
  {
    href: "/admin/articles",
    icon: FileText,
    title: "Kelola Artikel",
    desc: "Tulis, sunting, dan terbitkan artikel edukasi gizi.",
  },
  {
    href: "/admin/food",
    icon: Apple,
    title: "Master Makanan",
    desc: "CRUD & verifikasi basis data makanan.",
  },
  {
    href: "/admin/users",
    icon: UserCog,
    title: "Kelola Pengguna",
    desc: "Atur role, status, dan hapus akun pengguna.",
  },
  {
    href: "/admin/audit",
    icon: ClipboardList,
    title: "Audit Log",
    desc: "Riwayat semua perubahan data platform.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Panel Admin"
        title="Pusat Kontrol PETA"
        description="Kelola konten dan basis data platform."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SHORTCUTS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-primary transition group-hover:scale-105">
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-brand-primary">
                  {s.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
