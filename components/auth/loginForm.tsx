"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { PasswordField } from "./passwordField";

// Structural type — hindari import React event types yang di-deprecate di React 19
type FormSubmitEvent = {
  preventDefault: () => void;
  currentTarget: HTMLFormElement;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "mounted" pattern: hindari hydration mismatch dari useSearchParams.
  // Banner sukses cuma di-render setelah komponen mount di client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const resetSuccess =
    mounted && searchParams.get("reset") === "success";
  const justConfirmed = mounted && searchParams.get("confirmed") === "1";

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await authApi.login({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("remember") === "on",
    });

    if (!result.success) {
      setError(result.error?.message ?? "Login gagal");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-black">Selamat Datang</h1>
        <p className="mt-2 text-slate-500">
          Masuk untuk lanjutkan tracking gizi keluarga
        </p>
      </div>

      {/* Success banners from redirects (mounted = true setelah hydrate) */}
      {resetSuccess && (
        <div
          role="status"
          className="mt-6 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Password berhasil diubah. Silakan login dengan password baru.
          </span>
        </div>
      )}

      {justConfirmed && (
        <div
          role="status"
          className="mt-6 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Email berhasil dikonfirmasi. Silakan login.</span>
        </div>
      )}

      {/* suppressHydrationWarning di form → defend dari password manager
          (LastPass/Bitwarden/1Password) yang inject attribute sebelum hydrate */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
        noValidate
        suppressHydrationWarning
      >
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
              placeholder="YourEmail@gmail.com"
              suppressHydrationWarning
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          rightLabel={
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Lupa password?
            </Link>
          }
        />

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            suppressHydrationWarning
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-sm text-slate-700">Ingat saya</span>
        </label>

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
          {isLoading ? <span>Memproses...</span> : <>Masuk</>}
        </button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}