import { NextRequest, NextResponse } from "next/server";
import { getAdminUserUseCases } from "@/src/infrastructure/di/container";
import { adminListUsersQuerySchema } from "@/src/application/validators/users/adminUserSchema";
import { handleApiError } from "../../_utils/errorHandler";
import { requireAdmin } from "../../_utils/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    const { getCurrentUser, adminListUsers } = await getAdminUserUseCases();
    await requireAdmin(getCurrentUser);

    const url = new URL(req.url);
    const input = adminListUsersQuerySchema.parse({
      search: url.searchParams.get("search") ?? undefined,
      role: url.searchParams.get("role") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });

    const active =
      input.status === "active"
        ? true
        : input.status === "inactive"
          ? false
          : undefined;

    const result = await adminListUsers.execute({
      search: input.search,
      role: input.role,
      active,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
