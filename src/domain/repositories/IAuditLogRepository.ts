import type {
  AuditAction,
  AuditLogEntry,
  AuditTargetType,
} from "../entities/auditLog";

export interface AdminListAuditOptions {
  action?: AuditAction;
  targetType?: AuditTargetType;
  /** Pencarian pada email/nama aktor. */
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminListAuditResult {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IAuditLogRepository {
  list(options: AdminListAuditOptions): Promise<AdminListAuditResult>;
}
