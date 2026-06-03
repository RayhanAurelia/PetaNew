import { NextRequest, NextResponse } from "next/server";
import {
  getArticleUseCases,
  getAuthUseCases,
} from "@/src/infrastructure/di/container";
import { handleApiError } from "../../_utils/errorHandler";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { getCurrentUser } = await getAuthUseCases();
    await getCurrentUser.execute();

    const { slug } = await params;
    const { getArticleBySlug } = await getArticleUseCases();
    const article = await getArticleBySlug.execute(slug);
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    return handleApiError(error);
  }
}
