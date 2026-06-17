import { NextRequest, NextResponse } from "next/server";
import { getAdminAuditUseCases } from "@/src/infrastructure/di/container";
import { adminListAuditQuerySchema } from "@/src/application/validators/audit/auditSchema";
import { handleApiError } from "../../_utils/errorHandler";
import { requireAdmin } from "../../_utils/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    const { getCurrentUser, adminListAuditLogs } =
      await getAdminAuditUseCases();
    await requireAdmin(getCurrentUser);

    const url = new URL(req.url);
    const input = adminListAuditQuerySchema.parse({
      action: url.searchParams.get("action") ?? undefined,
      targetType: url.searchParams.get("targetType") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });

    const result = await adminListAuditLogs.execute(input);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
