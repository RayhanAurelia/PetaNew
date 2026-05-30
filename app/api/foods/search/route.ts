import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUseCases,
  getFoodUseCases,
} from "@/src/infrastructure/di/container";
import { searchFoodsSchema } from "@/src/application/validators/foods/foodSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    // Auth gate — hanya user login yang boleh akses (selaras RLS pola lain).
    const { getCurrentUser } = await getAuthUseCases();
    await getCurrentUser.execute();

    const url = new URL(req.url);
    const input = searchFoodsSchema.parse({
      q: url.searchParams.get("q") ?? "",
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });

    const { searchFoods } = getFoodUseCases();
    const result = await searchFoods.execute(input.q, input.page, input.pageSize);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
