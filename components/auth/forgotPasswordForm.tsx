"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    const result = await authApi.forgotPassword({ email });

    if (!result.success) {
      setError(result.error?.message ?? "Gagal mengirim email reset.");
      setIsLoading(false);
      return;
    }

    setSubmittedEmail(email);
    setSuccess(true);
    setIsLoading(false);
  }

  if (success) {
    return (
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold text-slate-900">
          Email Terkirim
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          Jika{" "}
          <span className="font-semibold text-slate-900">{submittedEmail}</span>{" "}
          terdaftar, link reset password telah dikirim. Cek inbox kamu dan klik
          link tersebut untuk lanjut.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Belum dapat email?</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-600">
            <li>Cek folder spam/junk</li>
            <li>Pastikan email kamu benar</li>
            <li>Tunggu 1-2 menit, lalu refresh inbox</li>
          </ul>
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setSubmittedEmail("");
            }}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Kirim ulang ke email lain
          </button>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Lupa Password?</h1>
        <p className="mt-2 text-slate-600">
          Masukkan email akunmu, kami akan kirim link reset password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-900"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@example.com"
              suppressHydrationWarning
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          suppressHydrationWarning
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <span>Mengirim...</span> : <>Kirim Link Reset</>}
        </button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
