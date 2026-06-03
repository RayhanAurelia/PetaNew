import type { User } from "../entities/user";
import type { Session } from "../entities/session";

export interface AuthResult {
  user: User;
  session: Session;
}

export interface IAuthRepository {
  register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;

  /**
   * Kirim email reset password ke user (jika email terdaftar).
   * Selalu return void supaya tidak bocorin info user-existence.
   */
  requestPasswordReset(email: string, redirectUrl: string): Promise<void>;

  /**
   * Update password user yang sedang authenticated.
   * Dipakai setelah user klik link reset (session ter-set lewat exchangeCodeForSession).
   */
  updatePassword(newPassword: string): Promise<void>;

  /**
   * Tukar kode (PKCE) dari URL recovery jadi session di cookie.
   * Throw kalau code invalid/expired.
   */
  exchangeCodeForSession(code: string): Promise<void>;

  /**
   * Update kolom yang dimiliki user (full_name / avatar_url) di tabel profiles.
   * Field yang tidak dikirim akan dibiarkan apa adanya.
   * Return User yang sudah diperbarui.
   */
  updateProfile(input: {
    fullName?: string;
    avatarUrl?: string | null;
  }): Promise<User>;
}