import { PageHeader } from "@/components/dashboard/pageHeader";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Dashboard"
        title="Ringkasan Harian"
        description="Pantau status gizi subjek dan konsumsi makanan dalam satu tampilan."
      />

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          Konten dashboard masih kosong.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Card status gizi, progres harian, dan artikel akan ditambahkan pada
          tahap berikutnya.
        </p>
      </div>
    </div>
  );
}
