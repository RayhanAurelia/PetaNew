"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { PasswordField } from "./passwordField";
import { PasswordStrength } from "./passwordStrength";

// Structural type — hindari React event types yang di-deprecate di React 19
type FormSubmitEvent = {
  preventDefault: () => void;
  currentTarget: HTMLFormElement;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    password.length >= 8 &&
    confirmPassword.length > 0 &&
    !passwordsMismatch;

  async function handleSubmit(e: FormSubmitEvent) {
    e.preventDefault();

    if (passwordsMismatch || !canSubmit) return;

    setIsLoading(true);
    setError(null);

    const result = await authApi.resetPassword({ password });

    if (!result.success) {
      setError(result.error?.message ?? "Gagal mengganti password.");
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    // Auto-redirect ke login setelah 2 detik
    setTimeout(() => {
      router.push("/login?reset=success");
      router.refresh();
    }, 2000);
  }

  if (success) {
    return (
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold text-slate-900">
          Password Berhasil Diubah
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Mengarahkan kamu ke halaman login...
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Login Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
        Buat Password Baru
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        Pilih password yang kuat untuk akun kamu.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <PasswordField
            id="password"
            name="password"
            label={
              <>
                Password Baru<span className="text-red-500">*</span>
              </>
            }
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={setPassword}
          />
          <PasswordStrength password={password} />
        </div>

        <div>
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label={
              <>
                Konfirmasi Password<span className="text-red-500">*</span>
              </>
            }
            autoComplete="new-password"
            placeholder="Ulangi password baru"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={passwordsMismatch ? "Password tidak sama" : undefined}
          />
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
          disabled={isLoading || !canSubmit}
          suppressHydrationWarning
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span>Menyimpan...</span>
          ) : (
            <>
              Ubah Password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}