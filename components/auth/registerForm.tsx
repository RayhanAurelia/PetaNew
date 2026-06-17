"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Mail, User } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { PasswordField } from "./passwordField";
import { PasswordStrength } from "./passwordStrength";
import { VerificationModal } from "./verificationModal";

// Structural type — hindari import React event types yang di-deprecate di React 19
type FormSubmitEvent = {
  preventDefault: () => void;
  currentTarget: HTMLFormElement;
};

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State untuk verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Validasi password match (cuma tampil kalau confirm sudah diisi)
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  // Tombol disable kalau password tidak match atau kosong
  const canSubmit =
    password.length > 0 && confirmPassword.length > 0 && !passwordsMismatch;

  async function handleSubmit(e: FormSubmitEvent) {
    e.preventDefault();

    if (passwordsMismatch) {
      setFieldErrors({ confirmPassword: ["Password tidak sama"] });
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const emailValue = String(formData.get("email") ?? "").trim();

    const result = await authApi.register({
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: emailValue,
      password,
    });

    if (!result.success) {
      // Email verification required → tampilkan modal, BUKAN error
      if (result.error?.code === "EMAIL_VERIFICATION_REQUIRED") {
        setRegisteredEmail(emailValue);
        setShowVerificationModal(true);
        setIsLoading(false);
        return;
      }

      if (result.error?.code === "VALIDATION_ERROR" && result.error.details) {
        setFieldErrors(result.error.details);
      }
      setError(result.error?.message ?? "Registrasi gagal");
      setIsLoading(false);
      return;
    }

    // Session aktif (email verification disabled) → langsung ke dashboard
    router.push("/dashboard");
    router.refresh();
  }

  const showGeneralError = error && Object.keys(fieldErrors).length === 0;

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Buat Akun Baru</h1>
        <p className="mt-2 text-slate-600">
          Mulai pantau gizi keluarga dalam 1 menit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-slate-900"
          >
            Nama Lengkap<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="Nama"
              aria-invalid={!!fieldErrors.fullName}
              suppressHydrationWarning
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 aria-invalid:border-red-400"
            />
          </div>
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-900"
          >
            Email<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email@gmail.com"
              aria-invalid={!!fieldErrors.email}
              suppressHydrationWarning
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 aria-invalid:border-red-400"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <PasswordField
            id="password"
            name="password"
            label={
              <>
                Password<span className="text-red-500">*</span>
              </>
            }
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password?.[0]}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
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
            placeholder="Ulangi password kamu"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={
              passwordsMismatch
                ? "Password tidak sama"
                : fieldErrors.confirmPassword?.[0]
            }
          />
        </div>

        {/* General Error */}
        {showGeneralError && (
          <div
            role="alert"
            className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          suppressHydrationWarning
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <span>Mendaftarkan...</span> : <>Daftar Sekarang</>}
        </button>
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      <VerificationModal
        open={showVerificationModal}
        email={registeredEmail}
        onClose={() => setShowVerificationModal(false)}
      />
    </>
  );
}
