import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IAuthRepository,
  AuthResult,
} from "@/src/domain/repositories/IAuthRepository";
import { User } from "@/src/domain/entities/user";
import {
  AuthError,
  InvalidCredentialsError,
  WeakPasswordError,
  EmailAlreadyInUseError,
  ProfileNotFoundError,
  EmailVerificationRequiredError,
  InvalidResetTokenError,
  PasswordResetFailedError,
  PasswordUpdateFailedError,
  RateLimitExceededError,
} from "@/src/domain/errors/authErrors";
import { UserMapper, ProfileRow } from "../../mappers/userMapper";
import { SessionMapper } from "../../mappers/sessionMapper";

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResult> {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${appUrl}/login?confirmed=1`,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already exists")
      ) {
        throw new EmailAlreadyInUseError();
      }
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        throw new RateLimitExceededError();
      }
      // Built-in SMTP Supabase kena rate limit (~4 email/jam di free tier)
      // atau gagal connect ke SMTP provider. Disampaikan ke user dengan jelas.
      if (
        msg.includes("error sending confirmation email") ||
        msg.includes("error sending email") ||
        msg.includes("smtp") ||
        msg.includes("sending email")
      ) {
        throw new RateLimitExceededError();
      }
      if (msg.includes("password")) throw new WeakPasswordError();
      throw new AuthError(error.message, "REGISTER_FAILED");
    }

    if (!data.user) {
      throw new AuthError("User tidak dibuat", "NO_USER");
    }

    // Supabase anti-enumeration: kalau email SUDAH terdaftar & terkonfirmasi,
    // signUp tetap return success TANPA error, tapi `identities` jadi array
    // kosong dan tidak ada email konfirmasi yang dikirim. Deteksi di sini
    // supaya user dapat pesan jelas, bukan "cek email" yang misleading.
    // Ref: https://supabase.com/docs/reference/javascript/auth-signup
    const identities = (data.user as { identities?: unknown[] }).identities;
    if (Array.isArray(identities) && identities.length === 0) {
      throw new EmailAlreadyInUseError();
    }

    // Email confirmation required di Supabase → session belum ada.
    // Diperlakukan sebagai "next step", bukan error fatal.
    if (!data.session) {
      throw new EmailVerificationRequiredError();
    }

    const profile = await this.fetchProfile(data.user.id);
    return {
      user: UserMapper.toDomain(data.user, profile),
      session: SessionMapper.toDomain(data.session),
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new InvalidCredentialsError();
      }
      throw new AuthError(error.message, "LOGIN_FAILED");
    }

    if (!data.user || !data.session) {
      throw new AuthError("Login berhasil tapi session kosong", "NO_SESSION");
    }

    const profile = await this.fetchProfile(data.user.id);
    return {
      user: UserMapper.toDomain(data.user, profile),
      session: SessionMapper.toDomain(data.session),
    };
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw new AuthError(error.message, "LOGOUT_FAILED");
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();

    if (error || !user) return null;

    const profile = await this.fetchProfile(user.id);
    return UserMapper.toDomain(user, profile);
  }

  async requestPasswordReset(
    email: string,
    redirectUrl: string,
  ): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    // Catatan: Supabase tetap return success kalau email tidak ada
    // (anti-enumeration). Tapi tetap throw kalau ada network/server error.
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        throw new RateLimitExceededError();
      }
      throw new PasswordResetFailedError(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("password") && msg.includes("weak")) {
        throw new WeakPasswordError();
      }
      throw new PasswordUpdateFailedError(error.message);
    }
  }

  async exchangeCodeForSession(code: string): Promise<void> {
    const { error } = await this.client.auth.exchangeCodeForSession(code);
    if (error) {
      throw new InvalidResetTokenError();
    }
  }

  async updateProfile(input: {
    fullName?: string;
    avatarUrl?: string | null;
  }): Promise<User> {
    const {
      data: { user: authUser },
    } = await this.client.auth.getUser();
    if (!authUser) {
      throw new AuthError("Tidak ada session aktif", "NO_SESSION");
    }

    const patch: Record<string, unknown> = {};
    if (input.fullName !== undefined) patch.full_name = input.fullName;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;

    if (Object.keys(patch).length > 0) {
      const { error } = await this.client
        .from("profiles")
        .update(patch)
        .eq("id", authUser.id);
      if (error) {
        throw new AuthError(error.message, "PROFILE_UPDATE_FAILED");
      }
    }

    const profile = await this.fetchProfile(authUser.id);
    return UserMapper.toDomain(authUser, profile);
  }

  private async fetchProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from("profiles")
      .select("full_name, role, is_active, avatar_url, created_at")
      .eq("id", userId)
      .single();

    if (error || !data) throw new ProfileNotFoundError();
    return data as ProfileRow;
  }
}
