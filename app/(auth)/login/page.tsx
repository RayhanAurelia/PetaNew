import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/authShell";
import { LoginForm } from "@/components/auth/loginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Peta untuk lanjutkan tracking gizi keluarga",
};

export default function LoginPage() {
  return (
    <AuthShell
      brandHeadline="Pantau Gizi Keluarga, Cegah Stunting Sejak Dini"
      brandTagline="Akses dashboard untuk pantau pertumbuhan & gizi keluargamu"
    >
      <LoginForm />
    </AuthShell>
  );
}
