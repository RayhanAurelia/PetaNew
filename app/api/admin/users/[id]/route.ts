import { NextRequest, NextResponse } from "next/server";
import { getAdminUserUseCases } from "@/src/infrastructure/di/container";
import { updateUserSchema } from "@/src/application/validators/users/adminUserSchema";
import { handleApiError } from "../../../_utils/errorHandler";
import { requireAdmin } from "../../../_utils/requireAdmin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, updateUser } = await getAdminUserUseCases();
    const admin = await requireAdmin(getCurrentUser);

    const { id } = await params;
    const body = await req.json();
    const input = updateUserSchema.parse(body);

    const user = await updateUser.execute(id, input, admin.id);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, deleteUser } = await getAdminUserUseCases();
    const admin = await requireAdmin(getCurrentUser);

    const { id } = await params;
    await deleteUser.execute(id, admin.id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
