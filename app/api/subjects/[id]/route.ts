import { NextRequest, NextResponse } from "next/server";
import { getSubjectUseCases } from "@/src/infrastructure/di/container";
import { updateSubjectSchema } from "@/src/application/validators/subjects/subjectSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = updateSubjectSchema.parse(body);

    const { getCurrentUser, updateSubject } = await getSubjectUseCases();
    const user = await getCurrentUser.execute();
    const subject = await updateSubject.execute(user.id, id, input);
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { getCurrentUser, deleteSubject } = await getSubjectUseCases();
    const user = await getCurrentUser.execute();
    await deleteSubject.execute(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
