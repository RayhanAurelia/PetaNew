import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { changePasswordSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = changePasswordSchema.parse(body);

    const { changePassword } = await getAuthUseCases();
    const result = await changePassword.execute({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
