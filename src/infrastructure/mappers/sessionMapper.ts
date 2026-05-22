import { Session } from "@/src/domain/entities/session";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

export class SessionMapper {
  static toDomain(s: SupabaseSession): Session {
    return new Session(
      s.access_token,
      s.refresh_token,
      new Date((s.expires_at ?? 0) * 1000),
      s.user.id,
    );
  }
}
