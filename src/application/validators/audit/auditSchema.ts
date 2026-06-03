import { z } from "zod";

export const auditActionEnum = z.enum(["create", "update", "delete"]);
export const auditTargetEnum = z.enum([
  "profile",
  "subject",
  "food",
  "article",
]);

export const adminListAuditQuerySchema = z.object({
  action: auditActionEnum.optional(),
  targetType: auditTargetEnum.optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(30),
});
export type AdminListAuditQuery = z.infer<typeof adminListAuditQuerySchema>;
