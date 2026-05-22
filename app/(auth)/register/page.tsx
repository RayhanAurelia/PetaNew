import type { Metadata } from "next";
import { AuthShellRegister } from "@/components/auth/authShellRegister";
import { RegisterForm } from "@/components/auth/registerForm";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Daftar akun Peta untuk mulai tracking gizi keluarga",
};

export default function RegisterPage() {
  return (
    <AuthShellRegister
      brandKicker="MULAI HARI INI"
      brandHeadline="Cegah Stunting, Sejak 1000 Hari Pertama"
      brandTagline="Mulai perjalanan gizi keluarga yang lebih sehat"
    >
      <RegisterForm />
    </AuthShellRegister>
  );
}
