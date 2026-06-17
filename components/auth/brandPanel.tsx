import { BookOpen, LineChart, ShieldCheck } from "lucide-react";
import { PetaLogo } from "../icons/petaLogo";

interface BrandPanelProps {
  kicker?: string;
  headline?: string;
  tagline?: string;
  heroImage?: string;
  heroAlt?: string;
}

export function BrandPanel({
  kicker = "PENCEGAHAN STUNTING DAN PEMANTAUAN GIZI",
  headline = "",
  tagline = "",
  heroImage = "/login-image.gif",
  heroAlt = "Animasi visualisasi pertumbuhan anak",
}: BrandPanelProps) {
  const isVideo = /\.(mp4|webm|ogv)$/i.test(heroImage);

  return (
    <div className="relative hidden lg:flex flex-col bg-linear-to-br from-emerald-600 via-emerald-700 to-green-800 p-10 overflow-hidden">
      {/* Subtle radial glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-green-400/20 blur-3xl"
      />

      {/* Top content */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="shrink-0 text-white">
          <PetaLogo />
        </div>

        <div className="shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {kicker}
          </p>
          <h2 className="mt-4 text-2xl xl:text-3xl font-bold leading-tight text-white">
            {headline}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-emerald-100">
            {tagline}
          </p>
        </div>

        <div className="shrink-0 grid grid-cols-3 gap-2">
          <CompactFeature
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Standar WHO"
          />
          <CompactFeature
            icon={<LineChart className="h-4 w-4" />}
            label="Tracking"
          />
          <CompactFeature
            icon={<BookOpen className="h-4 w-4" />}
            label="Edukasi"
          />
        </div>
      </div>

      {/* Hero image / video — flush against bottom-left corner.
          object-cover + object-bottom-left memaksa konten visual rapat ke
          pojok kiri-bawah meskipun file GIF/video punya area kosong di dalamnya. */}
      <div className="pointer-events-none absolute -bottom-px -left-px z-0  w-[40%] max-w-md overflow-hidden">
        {isVideo ? (
          <video
            src={heroImage}
            autoPlay
            loop
            muted
            playsInline
            className="block h-full w-full object-cover object-bottom-left select-none"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={heroAlt}
            className="block h-full w-full object-cover object-bottom-left select-none"
            loading="eager"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}

function CompactFeature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      tabIndex={0}
      className="group mt-2 flex cursor-default items-center gap-2 rounded-lg border border-white/15 bg-white px-3 py-2 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
    >
      <span className="text-emerald-500 font-semibold transition-colors group-hover:text-emerald-600">
        {icon}
      </span>
      <span className="text-xs font-mono font-bold text-emerald-600 truncate transition-colors group-hover:text-emerald-700">
        {label}
      </span>
    </div>
  );
}
