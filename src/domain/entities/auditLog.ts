export type AuditAction = "create" | "update" | "delete";
export type AuditTargetType = "profile" | "subject" | "food" | "article";

export type JsonRecord = Record<string, unknown>;

/** Satu baris catatan audit (dari tabel `public.audit_log`). */
export class AuditLogEntry {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly action: AuditAction,
    public readonly targetType: AuditTargetType,
    public readonly targetId: string | null,
    public readonly actorId: string | null,
    public readonly actorEmail: string | null,
    public readonly actorName: string | null,
    public readonly actorRole: string | null,
    public readonly oldData: JsonRecord | null,
    public readonly newData: JsonRecord | null,
    public readonly description: string | null,
  ) {}
}
