import { redirect } from "next/navigation";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { PetaLogo } from "@/components/icons/petaLogo";

export default async function DashboardPage() {
  const { getCurrentUser } = await getAuthUseCases();

  let user;
  try {
    user = await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="text-blue-600">
            <PetaLogo />
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            DASHBOARD
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Selamat datang, {user.fullName}!
          </h1>
          <p className="mt-2 text-slate-600">
            Login berhasil. Backend authentication & frontend page sudah
            terintegrasi.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Email" value={user.email} />
            <Stat label="Role" value={user.role} highlight={user.role === "admin"} />
            <Stat label="Status" value="Aktif" />
          </dl>

          <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            🚧 Halaman ini placeholder. Fitur dashboard (subject list, growth
            tracking, kalkulator gizi) akan dibangun di tahap selanjutnya.
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-1 text-base font-semibold ${
          highlight ? "text-blue-600" : "text-slate-900"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}