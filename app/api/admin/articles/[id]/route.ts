import { NextRequest, NextResponse } from "next/server";
import { getAdminArticleUseCases } from "@/src/infrastructure/di/container";
import { updateArticleSchema } from "@/src/application/validators/articles/articleSchema";
import { handleApiError } from "../../../_utils/errorHandler";
import { requireAdmin } from "../../../_utils/requireAdmin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, getArticleById } = await getAdminArticleUseCases();
    await requireAdmin(getCurrentUser);

    const { id } = await params;
    const article = await getArticleById.execute(id);
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, updateArticle } = await getAdminArticleUseCases();
    const admin = await requireAdmin(getCurrentUser);

    const { id } = await params;
    const body = await req.json();
    const input = updateArticleSchema.parse(body);

    const article = await updateArticle.execute(id, input, admin.id);
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { getCurrentUser, deleteArticle } = await getAdminArticleUseCases();
    await requireAdmin(getCurrentUser);

    const { id } = await params;
    await deleteArticle.execute(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
