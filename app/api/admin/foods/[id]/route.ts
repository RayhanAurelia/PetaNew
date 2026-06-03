import { NextRequest, NextResponse } from "next/server";
import { getAdminFoodUseCases } from "@/src/infrastructure/di/container";
import { updateFoodSchema } from "@/src/application/validators/foods/adminFoodSchema";
import { handleApiError } from "../../../_utils/errorHandler";
import { requireAdmin } from "../../../_utils/requireAdmin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, getFoodById } = await getAdminFoodUseCases();
    await requireAdmin(getCurrentUser);

    const { id } = await params;
    const food = await getFoodById.execute(id);
    return NextResponse.json({ success: true, data: food });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, updateFood } = await getAdminFoodUseCases();
    const admin = await requireAdmin(getCurrentUser);

    const { id } = await params;
    const body = await req.json();
    const input = updateFoodSchema.parse(body);

    const food = await updateFood.execute(id, input, admin.id);
    return NextResponse.json({ success: true, data: food });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, deleteFood } = await getAdminFoodUseCases();
    await requireAdmin(getCurrentUser);

    const { id } = await params;
    await deleteFood.execute(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
