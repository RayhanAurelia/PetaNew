import { NextRequest, NextResponse } from "next/server";
import {
  getArticleUseCases,
  getAuthUseCases,
} from "@/src/infrastructure/di/container";
import { listArticlesQuerySchema } from "@/src/application/validators/articles/articleSchema";
import { handleApiError } from "../_utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    const { getCurrentUser } = await getAuthUseCases();
    await getCurrentUser.execute();

    const url = new URL(req.url);
    const input = listArticlesQuerySchema.parse({
      lifeStage: url.searchParams.get("lifeStage") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });

    const { listArticles } = await getArticleUseCases();
    const result = await listArticles.execute(
      input.lifeStage,
      input.page,
      input.pageSize,
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
