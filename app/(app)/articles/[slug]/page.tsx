import { notFound, redirect } from "next/navigation";
import { ArticleDetailView } from "@/components/dashboard/articles/articleDetailView";
import {
  getArticleUseCases,
  getAuthUseCases,
} from "@/src/infrastructure/di/container";
import { ArticleError } from "@/src/domain/errors/articleErrors";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Auth gate — selaras layout (app)/layout.tsx tapi tetap aman jika dipanggil terisolasi.
  const { getCurrentUser } = await getAuthUseCases();
  try {
    await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  const { getArticleBySlug } = await getArticleUseCases();
  try {
    const article = await getArticleBySlug.execute(slug);
    return <ArticleDetailView article={article} />;
  } catch (err) {
    if (err instanceof ArticleError && err.code === "ARTICLE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }
}
