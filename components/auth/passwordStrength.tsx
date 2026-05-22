"use client";

import { CheckCircle2, Circle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const conditions = [
    {
      label: "Minimal 8 karakter",
      check: password.length >= 8,
    },
    {
      label: "Kombinasi huruf & angka",
      check: /[a-zA-Z]/.test(password) && /\d/.test(password),
    },
  ];

  const score = conditions.filter((c) => c.check).length;
  const total = conditions.length;
  const percentage = password.length === 0 ? 0 : (score / total) * 100;

  let strengthLabel: "Lemah" | "Sedang" | "Kuat" = "Lemah";
  let barColor = "bg-red-500";
  let textColor = "text-red-600";

  if (score === total) {
    strengthLabel = "Kuat";
    barColor = "bg-emerald-500";
    textColor = "text-emerald-600";
  } else if (score === 1) {
    strengthLabel = "Sedang";
    barColor = "bg-amber-500";
    textColor = "text-amber-600";
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Progress bar — hanya muncul kalau user mulai mengetik */}
      {password.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Kekuatan password</span>
            <span className={`font-semibold ${textColor}`}>
              {strengthLabel}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist conditions */}
      <ul className="space-y-1 text-xs">
        {conditions.map((cond) => (
          <li key={cond.label} className="flex items-center gap-1.5">
            {cond.check ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            )}
            <span
              className={
                cond.check ? "font-medium text-slate-700" : "text-slate-500"
              }
            >
              {cond.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
