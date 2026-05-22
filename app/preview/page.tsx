import { PetaLogo } from "@/components/icons/petaLogo";
import { BrandPanel } from "@/components/auth/brandPanel";

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8 space-y-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Component Preview</h1>
        <p className="mt-1 text-slate-600">
          Visualisasi komponen sebelum integrasi ke page
        </p>
      </header>

      {/* ============ PETA LOGO VARIANTS ============ */}
      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          PetaLogo Variants
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default — text di white bg */}
          <Card label="Default (white background, emerald color)">
            <div className="text-emerald-600">
              <PetaLogo />
            </div>
          </Card>

          {/* Di background gelap (cara dipakai di brand panel) */}
          <Card label="On dark gradient (white color)" dark>
            <div className="text-white">
              <PetaLogo />
            </div>
          </Card>

          {/* Icon only */}
          <Card label="Icon only (showText=false)">
            <div className="text-emerald-600">
              <PetaLogo showText={false} />
            </div>
          </Card>

          {/* Ukuran besar */}
          <Card label="Large size (via Tailwind override)">
            <div className="text-emerald-600 [&_svg]:h-14 [&_svg]:w-14 [&_span]:text-4xl">
              <PetaLogo />
            </div>
          </Card>
        </div>
      </section>

      {/* ============ BRAND PANEL ============ */}
      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          BrandPanel
        </h2>

        {/* Aspect ratio mirip kalau di auth page (50% lebar layar) */}
        <div className="bg-white p-2 rounded-2xl shadow-lg">
          <p className="text-sm text-slate-500 mb-2 px-2">Default tagline</p>
          <div className="grid grid-cols-1 rounded-xl overflow-hidden h-[600px]">
            {/* Override `hidden lg:flex` jadi `flex` supaya muncul di semua size */}
            <div className="[&>div]:!flex [&>div]:!h-full">
              <BrandPanel />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-2 rounded-2xl shadow-lg">
          <p className="text-sm text-slate-500 mb-2 px-2">
            Custom tagline (untuk register page)
          </p>
          <div className="grid grid-cols-1 rounded-xl overflow-hidden h-[600px]">
            <div className="[&>div]:!flex [&>div]:!h-full">
              <BrandPanel tagline="Mulai perjalanan gizi keluarga yang lebih sehat. Pantau pertumbuhan anak, hitung kebutuhan kalori, cegah stunting sejak dini." />
            </div>
          </div>
        </div>
      </section>

      {/* ============ SIMULASI LAYOUT 2 KOLOM ============ */}
      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Layout simulation (mirip AuthShell)
        </h2>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="[&>div]:!flex">
            <BrandPanel />
          </div>
          <div className="p-12 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <p className="text-sm">Form login/register akan muncul di sini</p>
              <p className="text-xs mt-1">(placeholder)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Helper card untuk grouping preview */
function Card({
  label,
  children,
  dark = false,
}: {
  label: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
        {label}
      </div>
      <div
        className={
          dark
            ? "p-8 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center"
            : "p-8 flex items-center justify-center"
        }
      >
        {children}
      </div>
    </div>
  );
}
