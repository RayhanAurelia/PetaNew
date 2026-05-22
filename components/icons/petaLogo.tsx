interface PetaLogoProps {
  className?: string;
  showText?: boolean;
}

export function PetaLogo({ className = "", showText = true }: PetaLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Peta logo"
      >
        <path
          d="M16 4 C12 11, 8 14, 8 19 C8 23.4, 11.6 27, 16 27 C20.4 27, 24 23.4, 24 19 C24 14, 20 11, 16 4 Z"
          fill="currentColor"
        />
        <circle cx="16" cy="19" r="3" fill="white" />
      </svg>
      {showText && (
        <div>
          <span className="text-xl tracking-tight text-white font-bold">
            Pe
          </span>
          <span className="text-xl tracking-tight text-cyan-300 font-bold">
            TA
          </span>
        </div>
      )}
    </div>
  );
}
