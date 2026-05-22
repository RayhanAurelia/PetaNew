import { User, UserRole } from "@/src/domain/entities/user";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { boolean } from "zod";

export interface ProfileRow {
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export class UserMapper {
  static toDomain(supabaseUser: SupabaseUser, profile: ProfileRow): User {
    return new User(
      supabaseUser.id,
      supabaseUser.email ?? "",
      profile.full_name,
      profile.role,
      profile.is_active,
      profile.avatar_url,
      new Date(profile.created_at),
    );
  }
}
