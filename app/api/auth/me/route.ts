import { NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { handleApiError } from "../../_utils/errorHandler";

export async function GET() {
  try {
    const { getCurrentUser } = await getAuthUseCases();
    const result = await getCurrentUser.execute();

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
