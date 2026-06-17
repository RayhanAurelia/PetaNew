"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string | ReactNode;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  rightLabel?: React.ReactNode;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function PasswordField({
  id,
  name,
  label,
  placeholder = "••••••••",
  required = true,
  minLength,
  autoComplete = "current-password",
  rightLabel,
  error,
  value,
  onChange,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const isControlled = value !== undefined;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-900">
          {label}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900" />
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          suppressHydrationWarning
          {...(isControlled
            ? {
                value,
                onChange: (e) => onChange?.(e.target.value),
              }
            : {})}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 aria-invalid:border-red-400 aria-invalid:focus:ring-red-100"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          suppressHydrationWarning
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition hover:text-slate-700"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        >
          {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}