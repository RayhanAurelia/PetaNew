import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { updateProfileSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../_utils/errorHandler";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const input = updateProfileSchema.parse(body);

    const { getCurrentUser, updateProfile } = await getAuthUseCases();
    // Auth gate — pastikan ada session aktif.
    await getCurrentUser.execute();
    const updated = await updateProfile.execute(input);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
