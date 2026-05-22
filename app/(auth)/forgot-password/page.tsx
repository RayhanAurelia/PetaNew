import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/authShellForgotPassword";
import { ForgotPasswordForm } from "@/components/auth/forgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Reset password akun Peta lewat email",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      brandKicker="RESET PASSWORD"
      brandHeadline="Lupa Password? Tenang, Kami Bantu."
      brandTagline="Kami akan kirim link reset ke email kamu. Klik link tersebut untuk membuat password baru."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
