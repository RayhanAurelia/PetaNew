import { NextResponse, NextRequest } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const { logout } = await getAuthUseCases();
    await logout.execute();
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  } catch (error) {
    return handleApiError(error);
  }
}