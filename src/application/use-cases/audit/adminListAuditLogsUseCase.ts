import type { AuditLogEntry } from "@/src/domain/entities/auditLog";
import type {
  AdminListAuditOptions,
  IAuditLogRepository,
} from "@/src/domain/repositories/IAuditLogRepository";
import type {
  AuditLogDTO,
  ListAuditLogsOutputDTO,
} from "../../dtos/audit/auditLogDTO";

export class AdminListAuditLogsUseCase {
  constructor(private readonly repo: IAuditLogRepository) {}

  async execute(
    options: AdminListAuditOptions,
  ): Promise<ListAuditLogsOutputDTO> {
    const result = await this.repo.list(options);
    return {
      items: result.items.map(toDTO),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}

function toDTO(e: AuditLogEntry): AuditLogDTO {
  return {
    id: e.id,
    createdAt: e.createdAt.toISOString(),
    action: e.action,
    targetType: e.targetType,
    targetId: e.targetId,
    actorId: e.actorId,
    actorEmail: e.actorEmail,
    actorName: e.actorName,
    actorRole: e.actorRole,
    oldData: e.oldData,
    newData: e.newData,
    description: e.description,
  };
}
