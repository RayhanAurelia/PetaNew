import { NextRequest, NextResponse } from "next/server";
import { getSearchUseCase } from "@/src/infrastructure/di/container";
import { handleApiError } from "../_utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    const { getCurrentUser, globalSearch } = await getSearchUseCase();
    const user = await getCurrentUser.execute();

    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const result = await globalSearch.execute(user.id, q);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
