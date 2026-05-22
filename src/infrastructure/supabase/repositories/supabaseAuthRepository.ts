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
      if (msg.includes("password")) throw new WeakPasswordError();
      throw new AuthError(error.message, "REGISTER_FAILED");
    }

    if (!data.user) {
      throw new AuthError("User tidak dibuat", "NO_USER");
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
