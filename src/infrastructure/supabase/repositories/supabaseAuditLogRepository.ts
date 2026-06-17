import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AuditLogEntry,
  type AuditAction,
  type AuditTargetType,
  type JsonRecord,
} from "@/src/domain/entities/auditLog";
import type {
  AdminListAuditOptions,
  AdminListAuditResult,
  IAuditLogRepository,
} from "@/src/domain/repositories/IAuditLogRepository";
import { AuditOperationFailedError } from "@/src/domain/errors/auditErrors";

const TABLE = "audit_log";

// Tabel dasar audit_log dipakai langsung (RLS `audit_select_admin_only`
// membatasi ke admin), bukan view audit_log_detailed yang berpotensi
// mem-bypass RLS. Nama aktor diambil via embed dari profiles.
const SELECT_WITH_ACTOR =
  "id, created_at, action, target_type, target_id, actor_id, actor_email, actor_role, old_data, new_data, description, actor:profiles!actor_id(full_name)";

interface AuditRow {
  id: string;
  created_at: string;
  action: AuditAction;
  target_type: AuditTargetType;
  target_id: string | null;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  old_data: JsonRecord | null;
  new_data: JsonRecord | null;
  description: string | null;
  actor?: { full_name?: string | null } | null;
}

function toDomain(row: AuditRow): AuditLogEntry {
  return new AuditLogEntry(
    row.id,
    new Date(row.created_at),
    row.action,
    row.target_type,
    row.target_id,
    row.actor_id,
    row.actor_email,
    row.actor?.full_name ?? null,
    row.actor_role,
    row.old_data,
    row.new_data,
    row.description,
  );
}

export class SupabaseAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(options: AdminListAuditOptions): Promise<AdminListAuditResult> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 30;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Audit log ini khusus aktivitas ADMIN — aksi user biasa (menambah subjek,
    // catatan gizi, edit profil sendiri) sengaja tidak ditampilkan. `actor_role`
    // disnapshot saat aksi terjadi, jadi filter ini akurat secara historis.
    let query = this.client
      .from(TABLE)
      .select(SELECT_WITH_ACTOR, { count: "exact" })
      .eq("actor_role", "admin")
      // Hanya objek yang dikelola admin. Ini juga menyaring hapus-subjek yang
      // ikut ter-cascade saat admin menghapus pengguna (noise, bukan aksi inti).
      .in("target_type", ["profile", "food", "article"]);

    if (options.action) query = query.eq("action", options.action);
    if (options.targetType)
      query = query.eq("target_type", options.targetType);
    if (options.search)
      query = query.ilike("actor_email", `%${options.search}%`);

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw new AuditOperationFailedError(error.message);

    const items = (data ?? []).map((r) =>
      toDomain(r as unknown as AuditRow),
    );
    return { items, total: count ?? items.length, page, pageSize };
  }
}
