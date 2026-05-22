"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MailCheck, X } from "lucide-react";

interface VerificationModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
}

/**
 * Mapping domain email ke URL webmail.
 * Kalau provider tidak dikenal, fallback ke Gmail.
 */
function getMailProviderInfo(email: string): {
  url: string;
  label: string;
} {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const providers: Record<string, { url: string; label: string }> = {
    "gmail.com": { url: "https://mail.google.com", label: "Buka Gmail" },
    "googlemail.com": { url: "https://mail.google.com", label: "Buka Gmail" },
    "yahoo.com": { url: "https://mail.yahoo.com", label: "Buka Yahoo Mail" },
    "yahoo.co.id": { url: "https://mail.yahoo.com", label: "Buka Yahoo Mail" },
    "outlook.com": { url: "https://outlook.live.com", label: "Buka Outlook" },
    "hotmail.com": { url: "https://outlook.live.com", label: "Buka Outlook" },
    "live.com": { url: "https://outlook.live.com", label: "Buka Outlook" },
    "icloud.com": {
      url: "https://www.icloud.com/mail",
      label: "Buka iCloud Mail",
    },
    "proton.me": { url: "https://mail.proton.me", label: "Buka Proton Mail" },
    "protonmail.com": {
      url: "https://mail.proton.me",
      label: "Buka Proton Mail",
    },
  };
  return (
    providers[domain] ?? { url: "https://mail.google.com", label: "Buka Email" }
  );
}

export function VerificationModal({
  open,
  email,
  onClose,
}: VerificationModalProps) {
  const router = useRouter();

  // Lock body scroll saat modal terbuka
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // ESC untuk close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const provider = getMailProviderInfo(email);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <MailCheck className="h-7 w-7" />
        </div>

        {/* Title */}
        <h2
          id="verification-title"
          className="mt-5 text-center text-xl font-bold text-slate-900"
        >
          Cek Email Kamu
        </h2>

        {/* Description */}
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          Link konfirmasi telah dikirim ke{" "}
          <span className="font-semibold text-slate-900">{email}</span>.
          Klik link tersebut untuk aktivasi akun, lalu kembali untuk login.
        </p>

        {/* Step instructions */}
        <ol className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              1
            </span>
            Buka inbox email kamu
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              2
            </span>
            Klik tombol &ldquo;Confirm your mail&rdquo; dari Peta
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              3
            </span>
            Kembali ke halaman ini dan login dengan akun barumu
          </li>
        </ol>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
          >
            {provider.label}
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/login");
            }}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Sudah konfirmasi? Login di sini
          </button>
        </div>

        {/* Help text */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Tidak menerima email? Cek folder spam atau coba daftar ulang.
        </p>
      </div>
    </div>
  );
}
