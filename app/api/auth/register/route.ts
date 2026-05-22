import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { registerSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);

    const { register } = await getAuthUseCases();
    const result = await register.execute(input);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
