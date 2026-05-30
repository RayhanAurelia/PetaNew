import { NextRequest, NextResponse } from "next/server";
import { getGrowthLogUseCases } from "@/src/infrastructure/di/container";
import { handleApiError } from "../../../../_utils/errorHandler";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    const { id, logId } = await params;
    const { getCurrentUser, deleteGrowthLog } = await getGrowthLogUseCases();
    const user = await getCurrentUser.execute();
    await deleteGrowthLog.execute(user.id, id, logId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
