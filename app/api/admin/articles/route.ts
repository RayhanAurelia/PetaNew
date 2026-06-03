import { NextRequest, NextResponse } from "next/server";
import { getAdminArticleUseCases } from "@/src/infrastructure/di/container";
import {
  adminListArticlesQuerySchema,
  createArticleSchema,
} from "@/src/application/validators/articles/articleSchema";
import { handleApiError } from "../../_utils/errorHandler";
import { requireAdmin } from "../../_utils/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    const { getCurrentUser, adminListArticles } =
      await getAdminArticleUseCases();
    await requireAdmin(getCurrentUser);

    const url = new URL(req.url);
    const input = adminListArticlesQuerySchema.parse({
      status: url.searchParams.get("status") ?? undefined,
      lifeStage: url.searchParams.get("lifeStage") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });

    const result = await adminListArticles.execute(input);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getCurrentUser, createArticle } = await getAdminArticleUseCases();
    const admin = await requireAdmin(getCurrentUser);

    const body = await req.json();
    const input = createArticleSchema.parse(body);

    const article = await createArticle.execute(input, admin.id);
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
