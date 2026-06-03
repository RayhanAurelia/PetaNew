import type {
  AuditAction,
  AuditTargetType,
  JsonRecord,
} from "@/src/domain/entities/auditLog";

export interface AuditLogDTO {
  id: string;
  createdAt: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string | null;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string | null;
  oldData: JsonRecord | null;
  newData: JsonRecord | null;
  description: string | null;
}

export interface ListAuditLogsOutputDTO {
  items: AuditLogDTO[];
  total: number;
  page: number;
  pageSize: number;
}
