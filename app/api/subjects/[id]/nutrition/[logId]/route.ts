import { NextRequest, NextResponse } from "next/server";
import { getNutritionLogUseCases } from "@/src/infrastructure/di/container";
import { handleApiError } from "../../../../_utils/errorHandler";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    const { id, logId } = await params;
    const { getCurrentUser, deleteNutritionLog } =
      await getNutritionLogUseCases();
    const user = await getCurrentUser.execute();
    await deleteNutritionLog.execute(user.id, id, logId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
