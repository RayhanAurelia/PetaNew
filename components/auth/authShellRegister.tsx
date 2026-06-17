import { BrandPanelRegister } from "./brandPanelRegister";

interface AuthShellProps {
  children: React.ReactNode;
  brandKicker?: string;
  brandHeadline?: string;
  brandTagline?: string;
  heroImage?: string;
  heroAlt?: string;
}

export function AuthShellRegister({
  children,
  brandKicker,
  brandHeadline,
  brandTagline,
  heroImage,
  heroAlt,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-6xl">
        {/* Outer glow — ambient color halo behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[28px] bg-linear-to-br from-emerald-500 via-green-500 to-emerald-600 opacity-25 blur-3xl"
        />

        {/* The card itself */}
        <div className="relative grid min-h-160 grid-cols-1 lg:grid-cols-[5fr_6fr] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-emerald-900/10">
          <BrandPanelRegister
            kicker={brandKicker}
            headline={brandHeadline}
            tagline={brandTagline}
            heroImage={heroImage}
            heroAlt={heroAlt}
          />
          <div className="flex items-center p-8 md:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
