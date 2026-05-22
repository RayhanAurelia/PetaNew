import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/auth/authShell";
import { ResetPasswordForm } from "@/components/auth/resetPasswordForm";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Buat password baru untuk akun Peta",
};

interface PageProps {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Kalau ada error dari Supabase (link expired, dll)
  if (params.error) {
    return (
      <AuthShell
        brandKicker="LINK TIDAK VALID"
        brandHeadline="Sepertinya Ada yang Tidak Beres."
        brandTagline="Coba minta link reset password baru dari halaman lupa password."
      >
        <InvalidLinkView
          message={
            params.error_description ?? "Link reset password tidak valid."
          }
        />
      </AuthShell>
    );
  }

  // Code exchange & cookie setting sudah dilakukan di /auth/callback.
  // Sekarang cuma cek apakah session valid → render form.
  const { getCurrentUser } = await getAuthUseCases();
  try {
    await getCurrentUser.execute();
  } catch {
    return (
      <AuthShell
        brandKicker="AKSES DITOLAK"
        brandHeadline="Belum Bisa Reset Password."
        brandTagline="Untuk reset password, klik link yang dikirim ke email kamu. Belum dapat? Minta link baru."
      >
        <InvalidLinkView message="Sesi tidak ditemukan. Minta link reset password baru." />
      </AuthShell>
    );
  }

  // Session valid → render form
  return (
    <AuthShell
      brandKicker="BUAT PASSWORD BARU"
      brandHeadline="Amankan Akunmu dengan Password Baru."
      brandTagline="Pilih password yang kuat dan unik. Password lama akan langsung dinonaktifkan."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}

function InvalidLinkView({ message }: { message: string }) {
  return (
    <div>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-center text-2xl font-bold text-slate-900">
        Link Tidak Valid
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
      <div className="mt-6 space-y-2">
        <Link
          href="/forgot-password"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Minta Link Baru
        </Link>
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}