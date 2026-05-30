import { NextRequest, NextResponse } from "next/server";
import { getSubjectUseCases } from "@/src/infrastructure/di/container";
import { createSubjectSchema } from "@/src/application/validators/subjects/subjectSchema";
import { handleApiError } from "../_utils/errorHandler";

export async function GET() {
  try {
    const { getCurrentUser, listSubjects } = await getSubjectUseCases();
    const user = await getCurrentUser.execute();
    const subjects = await listSubjects.execute(user.id);
    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createSubjectSchema.parse(body);

    const { getCurrentUser, createSubject } = await getSubjectUseCases();
    const user = await getCurrentUser.execute();
    const subject = await createSubject.execute(user.id, {
      ...input,
      heightCm: input.heightCm ?? null,
    });
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
