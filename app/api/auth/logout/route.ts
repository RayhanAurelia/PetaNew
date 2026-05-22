import { NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST() {
  try {
    const { logout } = await getAuthUseCases();
    await logout.execute();
    return NextResponse.json(
      { success: true, message: "Logout berhasil" },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}