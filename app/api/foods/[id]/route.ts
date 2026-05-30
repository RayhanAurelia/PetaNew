import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUseCases,
  getFoodUseCases,
} from "@/src/infrastructure/di/container";
import { handleApiError } from "../../_utils/errorHandler";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser } = await getAuthUseCases();
    await getCurrentUser.execute();

    const { id } = await params;
    const { getFood } = getFoodUseCases();
    const food = await getFood.execute(id);
    return NextResponse.json({ success: true, data: food });
  } catch (error) {
    return handleApiError(error);
  }
}
