interface PetaLogoProps {
  className?: string;
}

/**
 * Logo teks "PeTa" (font Bungee) — sama dengan logo di topbar dashboard.
 * "Pe" mengikuti warna teks induk (currentColor), "Ta" memakai warna aksen.
 */
export function PetaLogo({ className = "" }: PetaLogoProps) {
  return (
    <span
      className={`font-bungee text-2xl leading-none transition-transform group-hover:scale-105 ${className}`}
    >
      Pe<span className="text-brand-accent">Ta</span>
    </span>
  );
}
