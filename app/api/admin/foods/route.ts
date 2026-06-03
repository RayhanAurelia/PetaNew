import { NextRequest, NextResponse } from "next/server";
import { getAdminFoodUseCases } from "@/src/infrastructure/di/container";
import {
  adminListFoodsQuerySchema,
  createFoodSchema,
} from "@/src/application/validators/foods/adminFoodSchema";
import { handleApiError } from "../../_utils/errorHandler";
import { requireAdmin } from "../../_utils/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    const { getCurrentUser, adminListFoods } = await getAdminFoodUseCases();
    await requireAdmin(getCurrentUser);

    const url = new URL(req.url);
    const input = adminListFoodsQuerySchema.parse({
      search: url.searchParams.get("search") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      verified: url.searchParams.get("verified") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });

    const result = await adminListFoods.execute(input);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getCurrentUser, createFood } = await getAdminFoodUseCases();
    const admin = await requireAdmin(getCurrentUser);

    const body = await req.json();
    const input = createFoodSchema.parse(body);

    const food = await createFood.execute(input, admin.id);
    return NextResponse.json({ success: true, data: food }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
