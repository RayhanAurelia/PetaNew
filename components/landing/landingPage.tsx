"use client";

import {
  Apple,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Flame,
  LineChart,
  Menu,
  RotateCcw,
  Sparkles,
  Star,
  Users,
  Utensils,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const NAV = [
  { label: "Fitur", href: "#fitur" },
  { label: "Tracker", href: "#tracker" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Harga", href: "#harga" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbf4e6] font-sans text-emerald-950">
      <Navbar />
      <Hero />
      <Features />
      <DemoSection />
      <GrowthSection />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}

/* ------------------------------ Navbar ------------------------------ */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/5 bg-[#fbf4e6]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(n.href);
              }}
              className="text-sm font-medium text-emerald-900/70 transition hover:text-emerald-700"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-emerald-900/80 transition hover:text-emerald-700"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
          >
            Coba Gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-emerald-900 lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-emerald-900/5 bg-[#fbf4e6] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  smoothScrollTo(n.href);
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-900/80 hover:bg-emerald-900/5"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-emerald-900/15 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-full bg-emerald-950 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Coba Gratis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Beranda PETA"
    >
      <span className="font-bungee text-xl leading-none">
        <span className="text-emerald-700">Pe</span>
        <span className="text-orange-500">Ta</span>
      </span>
    </Link>
  );
}

/** Geser halus ke section dengan id sesuai href (#id). */
function smoothScrollTo(href: string) {
  if (!href.startsWith("#")) return;
  const el = document.getElementById(href.slice(1));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ------------------------------- Hero ------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-100/40 via-[#fbf4e6] to-orange-100/50"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Copy */}
        <div>
          <h1 className="mt-6 font-fraunces text-5xl font-semibold leading-[1.18] tracking-tight text-emerald-950 sm:text-6xl">
            Pantau gizi &amp;{" "}
            <span className="relative inline-block pb-3 text-emerald-600">
              tumbuh kembang
              <svg
                aria-hidden
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
                className="absolute bottom-0 left-0 h-3 w-full"
              >
                <path
                  d="M3 8C60 3 165 3 297 6"
                  stroke="#fb923c"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            si kecil
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-emerald-900/70">
            Catat asupan harian, ukur pertumbuhan, dan pantau status gizi
            keluarga dalam satu aplikasi, dirancang sederhana untuk orang tua
            sibuk.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#tracker"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("#tracker");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-900/15 bg-white px-6 py-3.5 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Lihat demo interaktif
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                "from-emerald-400 to-emerald-600",
                "from-amber-400 to-orange-500",
                "from-rose-400 to-pink-500",
                "from-sky-400 to-blue-500",
              ].map((g, i) => (
                <span
                  key={i}
                  className={`h-8 w-8 rounded-full bg-linear-to-br ${g} ring-2 ring-[#fbf4e6]`}
                />
              ))}
            </div>
            <p className="text-sm text-emerald-900/70">
              <span className="font-semibold text-emerald-950">
                Ribuan keluarga
              </span>{" "}
              memantau gizi anak setiap hari
            </p>
          </div>
        </div>

        {/* Visual */}
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-sm self-start">
      {/* Bingkai (card) tetap; gambar di dalamnya dikecilkan via lebar img.
          GIF animasi pakai <img> agar animasinya tetap jalan. */}
      <div className="relative grid aspect-square items-start justify-items-center overflow-hidden rounded-[2.5rem] bg-linear-to-br from-emerald-200/70 to-orange-200/70 px-6 pb-6 pt-0 shadow-xl shadow-emerald-900/5 ring-1 ring-white/60">
        {/* Ubah lebar img (mis. `w-4/5`) untuk besar/kecil tanpa mengubah card. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing-page.gif"
          alt="Pratinjau aplikasi PETA"
          className="w-full object-contain object-top drop-shadow-lg"
        />
      </div>

      {/* 3 kartu mengambang (di dalam batas bingkai agar tidak terpotong) */}
      <FloatChip
        className="left-0 top-6"
        delay={0.2}
        icon={<Apple className="h-4 w-4" />}
        tone="from-emerald-500 to-teal-600"
        label="Kalori hari ini"
        value="1.240 kcal"
      />
      <FloatChip
        className="right-0 top-2/3"
        delay={1}
        icon={<Utensils className="h-4 w-4" />}
        tone="from-amber-400 to-orange-500"
        label="Sayur"
        value="4 dari 5 porsi"
      />
      <FloatChip
        className="bottom-6 left-4"
        delay={1.6}
        icon={<LineChart className="h-4 w-4" />}
        tone="from-sky-500 to-blue-600"
        label="Tinggi bulan ini"
        value="+1,2 cm"
      />
    </div>
  );
}

function FloatChip({
  className,
  delay = 0,
  icon,
  tone,
  label,
  value,
}: {
  className: string;
  delay?: number;
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className={`animate-peta-float absolute flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg shadow-emerald-900/10 ring-1 ring-emerald-900/5 ${className}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-linear-to-br text-white ${tone}`}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-[10px] text-emerald-900/50">{label}</p>
        <p className="text-sm font-bold text-emerald-950">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------ Features ---------------------------- */
const FEATURES = [
  {
    icon: Utensils,
    tone: "from-emerald-500 to-teal-600",
    title: "Catat Asupan Harian",
    desc: "Log makanan dalam sekali ketuk dari database gizi makanan lokal Indonesia",
  },
  {
    icon: LineChart,
    tone: "from-amber-400 to-orange-500",
    title: "Kurva Tumbuh WHO",
    desc: "Visualisasi otomatis tinggi, berat, dan BMI sesuai standar WHO",
  },
  {
    icon: Apple,
    tone: "from-rose-400 to-pink-500",
    title: "Database Makanan",
    desc: "Jelajahi detail kalori, protein, karbohidrat, dan lemak per 100 gram",
  },
  {
    icon: Bell,
    tone: "from-sky-500 to-blue-600",
    title: "Pengingat Pintar",
    desc: "Notifikasi jadwal makan & pengukuran agar tidak ada yang terlewat",
  },
  {
    icon: BookOpen,
    tone: "from-violet-500 to-purple-600",
    title: "Edukasi Terkurasi",
    desc: "Artikel gizi & tumbuh kembang yang ditulis ringkas dan mudah dipahami",
  },
  {
    icon: Users,
    tone: "from-fuchsia-500 to-purple-600",
    title: "Multi-Subjek",
    desc: "Pantau beberapa anak & anggota keluarga sekaligus dalam satu akun",
  },
];

function Features() {
  return (
    <section
      id="fitur"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 lg:px-8"
    >
      <SectionHead
        kicker="FITUR LENGKAP"
        title={
          <>
            Semua yang Bunda &amp; Ayah butuhkan, dalam{" "}
            <span className="text-orange-500">satu app</span>
          </>
        }
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={i * 80}>
              <div className="group h-full rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5">
                <span
                  className={`grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br text-white shadow-sm transition group-hover:scale-105 ${f.tone}`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-fraunces text-xl font-semibold text-emerald-950">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/60">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------- Demo interaktif ------------------------ */
interface DemoFood {
  id: string;
  name: string;
  emoji: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEMO_FOODS: DemoFood[] = [
  {
    id: "nasi",
    name: "Nasi Tim",
    emoji: "🍚",
    kcal: 180,
    protein: 4,
    carbs: 38,
    fat: 2,
  },
  {
    id: "telur",
    name: "Telur Rebus",
    emoji: "🥚",
    kcal: 70,
    protein: 6,
    carbs: 1,
    fat: 5,
  },
  {
    id: "pisang",
    name: "Pisang",
    emoji: "🍌",
    kcal: 90,
    protein: 1,
    carbs: 23,
    fat: 0,
  },
  {
    id: "bayam",
    name: "Bayam Tumis",
    emoji: "🥬",
    kcal: 60,
    protein: 3,
    carbs: 6,
    fat: 3,
  },
  {
    id: "ayam",
    name: "Ayam Suwir",
    emoji: "🍗",
    kcal: 150,
    protein: 14,
    carbs: 0,
    fat: 10,
  },
  {
    id: "susu",
    name: "Susu",
    emoji: "🥛",
    kcal: 120,
    protein: 6,
    carbs: 9,
    fat: 5,
  },
  {
    id: "alpukat",
    name: "Alpukat",
    emoji: "🥑",
    kcal: 110,
    protein: 1,
    carbs: 6,
    fat: 10,
  },
  {
    id: "ikan",
    name: "Ikan",
    emoji: "🐟",
    kcal: 130,
    protein: 20,
    carbs: 0,
    fat: 5,
  },
];

const DEMO_TARGET = { kcal: 1300, protein: 35, carbs: 180, fat: 45 };

function DemoSection() {
  const [added, setAdded] = useState<string[]>([]);

  const totals = useMemo(() => {
    return added.reduce(
      (acc, id) => {
        const f = DEMO_FOODS.find((x) => x.id === id);
        if (f) {
          acc.kcal += f.kcal;
          acc.protein += f.protein;
          acc.carbs += f.carbs;
          acc.fat += f.fat;
        }
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [added]);

  return (
    <section id="tracker" className="scroll-mt-20 bg-[#f7edd8] py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SectionHead
          kicker="DEMO INTERAKTIF"
          title={
            <>
              Coba sendiri —{" "}
              <span className="text-emerald-600">tap makanan</span> di bawah
            </>
          }
          subtitle="Lihat bagaimana asupan harian si kecil tervisualisasi secara real-time"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Menu */}
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-fraunces text-xl font-semibold text-emerald-950">
                Menu hari ini
              </h3>
              {added.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAdded([])}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DEMO_FOODS.map((f) => {
                const count = added.filter((id) => id === f.id).length;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAdded((prev) => [...prev, f.id])}
                    className="group relative rounded-2xl border border-emerald-900/10 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                  >
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                      +
                    </span>
                    {count > 0 && (
                      <span className="absolute left-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                    <div className="text-3xl">{f.emoji}</div>
                    <p className="mt-2 truncate text-sm font-semibold text-emerald-950">
                      {f.name}
                    </p>
                    <p className="text-[11px] text-emerald-900/50">
                      {f.kcal} kcal
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-4">
            <MacroBar
              icon={<Flame className="h-4 w-4" />}
              tone="from-emerald-500 to-teal-600"
              bar="bg-emerald-500"
              spark="#10b981"
              label="Kalori"
              value={totals.kcal}
              target={DEMO_TARGET.kcal}
              unit="kcal"
            />
            <MacroBar
              icon={<span className="text-xs font-bold">P</span>}
              tone="from-rose-400 to-pink-500"
              bar="bg-rose-400"
              spark="#fb7185"
              label="Protein"
              value={totals.protein}
              target={DEMO_TARGET.protein}
              unit="g"
            />
            <MacroBar
              icon={<span className="text-xs font-bold">K</span>}
              tone="from-amber-400 to-orange-500"
              bar="bg-amber-400"
              spark="#fbbf24"
              label="Karbohidrat"
              value={totals.carbs}
              target={DEMO_TARGET.carbs}
              unit="g"
            />
            <MacroBar
              icon={<span className="text-xs font-bold">L</span>}
              tone="from-sky-500 to-blue-600"
              bar="bg-sky-500"
              spark="#0ea5e9"
              label="Lemak"
              value={totals.fat}
              target={DEMO_TARGET.fat}
              unit="g"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MacroBar({
  icon,
  tone,
  bar,
  spark,
  label,
  value,
  target,
  unit,
}: {
  icon: React.ReactNode;
  tone: string;
  bar: string;
  spark: string;
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const full = target > 0 && value >= target;

  // Picu ledakan "kembang api" tiap kali target baru tercapai.
  const [burstId, setBurstId] = useState(0);
  const wasFull = useRef(false);
  useEffect(() => {
    if (full && !wasFull.current) setBurstId((n) => n + 1);
    wasFull.current = full;
  }, [full]);

  return (
    <div
      className={`relative rounded-2xl border bg-white p-4 shadow-sm transition ${
        full ? "border-transparent shadow-md ring-2" : "border-emerald-900/10"
      }`}
      style={
        full
          ? ({ "--tw-ring-color": `${spark}66` } as React.CSSProperties)
          : undefined
      }
    >
      {burstId > 0 && <Fireworks key={burstId} color={spark} />}

      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
          <span
            className={`grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br text-white ${tone}`}
          >
            {icon}
          </span>
          {label}
          {full && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: spark }}
            >
              <Sparkles className="h-3 w-3" /> Tercapai!
            </span>
          )}
        </span>
        <span className="text-sm tabular-nums text-emerald-900/60">
          <span className="font-bold text-emerald-950">
            {Math.round(value)}
          </span>{" "}
          / {target} {unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-900/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Ledakan partikel warna-warni dari tengah kartu (sekali main lalu hilang). */
function Fireworks({ color }: { color: string }) {
  // Sebaran deterministik (tanpa Math.random) agar perhitungan tetap murni,
  // namun tetap terlihat acak berkat variasi berbasis indeks.
  const particles = useMemo(() => {
    const count = 16;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (((i * 7) % 5) - 2) * 0.05;
      const dist = 48 + ((i * 53) % 17) * 2.2;
      return {
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 5 + ((i * 3) % 4),
        delay: ((i * 5) % 6) / 100,
      };
    });
  }, []);

  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 grid place-items-center overflow-visible"
    >
      <div className="relative h-0 w-0">
        {particles.map((p, i) => (
          <span
            key={i}
            className="peta-spark absolute left-0 top-0 rounded-full"
            style={
              {
                width: p.size,
                height: p.size,
                backgroundColor: color,
                animationDelay: `${p.delay}s`,
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Growth ------------------------------- */
interface GrowthStatData {
  id: string;
  label: string;
  value: string;
  percentile: number;
  range: string;
  detail: string;
}

const GROWTH_STATS: GrowthStatData[] = [
  {
    id: "berat",
    label: "Berat badan",
    value: "12,4 kg",
    percentile: 60,
    range: "Rentang sehat: 10,8 – 14,2 kg",
    detail:
      "Naik 0,4 kg dari bulan lalu. Berat berada sedikit di atas rata-rata anak seusianya — pertumbuhan yang baik.",
  },
  {
    id: "tinggi",
    label: "Tinggi badan",
    value: "87 cm",
    percentile: 55,
    range: "Rentang sehat: 84 – 92 cm",
    detail:
      "Bertambah 1,2 cm bulan ini. Tinggi badan sesuai untuk usia 30 bulan dan jauh dari ambang stunting.",
  },
  {
    id: "bmi",
    label: "BMI / IMT",
    value: "16,4",
    percentile: 58,
    range: "Rentang sehat: 14,5 – 18,2",
    detail:
      "Indeks massa tubuh terhadap usia. Status gizi tergolong normal — berat seimbang dengan tinggi badan.",
  },
];

function GrowthSection() {
  const [openStat, setOpenStat] = useState<string | null>("berat");
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Kurva WHO
          </p>
          <h2 className="mt-3 font-fraunces text-4xl font-semibold leading-tight text-emerald-950 sm:text-5xl">
            Tumbuh kembang{" "}
            <span className="text-emerald-600">di jalur sehat</span> ✨
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-emerald-900/70">
            Visualisasi otomatis berdasarkan standar Organisasi Kesehatan Dunia.
            Setiap pengukuran langsung diplot ke kurva pertumbuhan.
          </p>

          <div className="mt-6 space-y-3">
            {GROWTH_STATS.map((s) => (
              <GrowthStat
                key={s.id}
                stat={s}
                open={openStat === s.id}
                onToggle={() =>
                  setOpenStat((cur) => (cur === s.id ? null : s.id))
                }
              />
            ))}
            <p className="px-1 pt-1 text-xs text-emerald-900/50">
              Ketuk tiap kartu untuk melihat detail ukuran &amp; rentang
              sehatnya.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <GrowthCurve />
        </div>
      </div>
    </section>
  );
}

function GrowthStat({
  stat,
  open,
  onToggle,
}: {
  stat: GrowthStatData;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        open
          ? "border-emerald-300 shadow-md"
          : "border-emerald-900/10 hover:border-emerald-200"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-emerald-50/40"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-emerald-900/70">
          <ChevronDown
            className={`h-4 w-4 text-emerald-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
          {stat.label}
        </span>
        <span className="text-right">
          <span className="block text-lg font-bold text-emerald-950">
            {stat.value}
          </span>
          <span className="text-xs font-semibold text-emerald-600">
            Persentil {stat.percentile}
          </span>
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-emerald-900/10 px-5 py-4">
            {/* Bar persentil dengan penanda */}
            <div className="flex items-center justify-between text-[11px] font-medium text-emerald-900/50">
              <span>P0</span>
              <span>P100</span>
            </div>
            <div className="relative mt-1.5 h-2 rounded-full bg-emerald-100">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600"
                style={{ width: `${stat.percentile}%` }}
              />
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-600 bg-white shadow"
                style={{ left: `${stat.percentile}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold text-emerald-700">
              {stat.range}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-900/70">
              {stat.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthCurve() {
  // Data contoh (bulan vs berat). Dua garis batas + garis anak.
  const W = 460;
  const H = 280;
  const pad = 28;
  const months = [0, 6, 12, 18, 24, 30];
  const child = [3.3, 7.2, 9.0, 10.4, 11.6, 12.6];
  const upper = [4.4, 8.8, 10.9, 12.6, 14.1, 15.3];
  const lower = [2.5, 6.0, 7.5, 8.7, 9.7, 10.5];

  const maxY = 16;
  const x = (i: number) => pad + (i / (months.length - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / maxY) * (H - pad * 2);
  const line = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const band = `${line(upper)} L ${x(months.length - 1)} ${y(lower[lower.length - 1])} ${lower
    .map(
      (v, i) =>
        `L ${x(lower.length - 1 - i)} ${y(lower[lower.length - 1 - i])}`,
    )
    .join(" ")} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Kurva pertumbuhan WHO"
    >
      {/* gridlines */}
      {[4, 8, 12].map((v) => (
        <line
          key={v}
          x1={pad}
          x2={W - pad}
          y1={y(v)}
          y2={y(v)}
          stroke="#10b98122"
          strokeDasharray="4 4"
        />
      ))}
      {/* band sehat */}
      <path d={band} fill="#34d39922" />
      <path d={line(upper)} fill="none" stroke="#6ee7b7" strokeWidth={2} />
      <path d={line(lower)} fill="none" stroke="#6ee7b7" strokeWidth={2} />
      {/* garis anak */}
      <path
        d={line(child)}
        fill="none"
        stroke="#059669"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {child.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === 2 ? 5 : 3.5}
          fill="#059669"
        />
      ))}
      {/* tooltip contoh */}
      <g transform={`translate(${x(2)}, ${y(child[2]) - 26})`}>
        <rect x={-34} y={-14} width={68} height={22} rx={6} fill="#022c22" />
        <text x={0} y={1} textAnchor="middle" fontSize="10" fill="#fff">
          12bln · 9,0kg
        </text>
      </g>
      {/* label bulan */}
      {months.map((m, i) => (
        <text
          key={m}
          x={x(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="10"
          fill="#0f766e99"
        >
          {m}b
        </text>
      ))}
    </svg>
  );
}

/* --------------------------- Testimonials --------------------------- */
const TESTIMONIALS = [
  {
    quote:
      "Catat asupan jadi gampang banget, Anak saya lebih lahap karena ada progres yang kelihatan tiap hari",
    name: "Rina",
    role: "Bunda Aira (2 thn)",
    blob: "bg-emerald-200",
  },
  {
    quote:
      "Kurva WHO-nya bikin tenang, Tinggal tunjukkan grafiknya ke dokter anak saat kontrol",
    name: "Dimas",
    role: "Ayah Reza (8 bln)",
    blob: "bg-orange-200",
  },
  {
    quote:
      "Punya anak kembar berarti dua jadwal makan, App ini mengingatkan tepat waktu dan rapi banget catatannya",
    name: "Sari",
    role: "Bunda Kembar (3 thn)",
    blob: "bg-pink-200",
  },
];

function Testimonials() {
  return (
    <section id="testimoni" className="scroll-mt-20 bg-[#f7edd8] py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SectionHead
          kicker="TESTIMONI"
          title={
            <>
              Dipercaya orang tua di{" "}
              <span className="text-emerald-600">seluruh Indonesia</span>
            </>
          }
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="relative h-full overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <span
                  className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${t.blob}`}
                />
                <div className="relative">
                  <div className="flex gap-0.5 text-orange-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-emerald-900/80">
                    “{t.quote}”
                  </p>
                  <p className="mt-5 text-sm font-bold text-emerald-950">
                    {t.name}
                  </p>
                  <p className="text-xs text-emerald-900/50">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Pricing ------------------------------ */
const GRATIS_FEATURES = [
  "Profil anak & anggota keluarga",
  "Catat asupan makanan harian",
  "Kurva tumbuh berbasis WHO",
  "Database gizi makanan",
  "Artikel edukasi terkurasi",
  "Pengingat pengukuran",
];

function Pricing() {
  return (
    <section
      id="harga"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 lg:px-8"
    >
      <SectionHead
        kicker="HARGA"
        title={
          <>
            Semua fitur, <span className="text-orange-500">gratis</span> untuk
            keluarga
          </>
        }
        subtitle="Tanpa biaya tersembunyi, Cukup daftar dan langsung pantau gizi si kecil"
      />

      <Reveal className="mx-auto mt-16 max-w-lg">
        <div className="relative rounded-3xl border border-emerald-600/30 bg-linear-to-b from-emerald-50 to-white px-8 py-10 text-center shadow-sm ring-1 ring-emerald-600/10 sm:px-12 sm:py-12">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            100% Gratis
          </span>
          <h3 className="mt-3 font-fraunces text-2xl font-semibold text-emerald-950">
            Paket Gratis
          </h3>
          <p className="mt-0.5 text-sm text-emerald-900/55">
            Untuk semua orang tua Indonesia
          </p>
          <p className="mt-5 font-fraunces text-5xl font-bold text-emerald-950">
            Rp 0
            <span className="text-base font-medium text-emerald-900/50">
              {" "}
              selamanya
            </span>
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-950 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            Mulai Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
          <ul className="mt-7 space-y-3 text-left">
            {GRATIS_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-emerald-900/80"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------ Footer ------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-emerald-900/10 bg-[#fbf4e6]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center lg:flex-row lg:justify-between lg:text-left lg:px-8">
        <Brand />
        <p className="text-xs text-emerald-900/50">
          © {new Date().getFullYear()} PETA — Pencegahan stunting & tracker gizi
          keluarga.
        </p>
        <div className="flex gap-5 text-sm font-medium text-emerald-900/70">
          <Link href="/login" className="hover:text-emerald-700">
            Masuk
          </Link>
          <Link href="/register" className="hover:text-emerald-700">
            Daftar
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- Motion helper -------------------------- */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/* ---------------------------- Shared head --------------------------- */
function SectionHead({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
        {kicker}
      </p>
      <h2 className="mt-3 font-fraunces text-4xl font-semibold leading-tight text-emerald-950 sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-emerald-900/60">{subtitle}</p>
      )}
    </div>
  );
}
