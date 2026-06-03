import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "@/src/domain/entities/article";
import type {
  AdminListArticlesOptions,
  CreateArticleInput,
  IArticleRepository,
  ListArticlesOptions,
  ListArticlesResult,
  UpdateArticleInput,
} from "@/src/domain/repositories/IArticleRepository";
import {
  ArticleNotFoundError,
  ArticleOperationFailedError,
  ArticleSlugTakenError,
} from "@/src/domain/errors/articleErrors";
import { ArticleMapper, type ArticleRow } from "../../mappers/articleMapper";

const TABLE = "articles";

const SELECT_WITH_AUTHOR =
  "id, title, slug, excerpt, content, cover_image_url, target_life_stage, author_id, is_published, published_at, view_count, created_at, updated_at, author:profiles!author_id(full_name)";

export class SupabaseArticleRepository implements IArticleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listPublished(
    options: ListArticlesOptions,
  ): Promise<ListArticlesResult> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 12;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.client
      .from(TABLE)
      .select(SELECT_WITH_AUTHOR, { count: "exact" })
      .eq("is_published", true);

    if (options.lifeStage) {
      query = query.eq("target_life_stage", options.lifeStage);
    }

    query = query
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw new ArticleOperationFailedError(error.message);

    const items = (data ?? []).map((r) =>
      ArticleMapper.toDomain(r as unknown as ArticleRow),
    );

    return {
      items,
      total: count ?? items.length,
      page,
      pageSize,
    };
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_WITH_AUTHOR)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new ArticleOperationFailedError(error.message);
    if (!data) return null;
    return ArticleMapper.toDomain(data as unknown as ArticleRow);
  }

  async incrementViewCount(id: string): Promise<void> {
    // Fetch + write race-prone tapi cukup untuk MVP. Production sebaiknya pakai
    // RPC `increment_article_view_count` (SECURITY DEFINER) supaya atomic.
    const { data, error: readErr } = await this.client
      .from(TABLE)
      .select("view_count")
      .eq("id", id)
      .maybeSingle();
    if (readErr || !data) return;
    const current = Number(
      (data as { view_count?: number | string }).view_count ?? 0,
    );
    const { error: updErr } = await this.client
      .from(TABLE)
      .update({ view_count: current + 1 })
      .eq("id", id);
    if (updErr) {
      console.warn(
        `[ArticleRepository] failed to increment view_count: ${updErr.message}`,
      );
    }
  }

  // --- Admin ---

  async listAll(options: AdminListArticlesOptions): Promise<ListArticlesResult> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.client
      .from(TABLE)
      .select(SELECT_WITH_AUTHOR, { count: "exact" });

    if (options.status === "published") {
      query = query.eq("is_published", true);
    } else if (options.status === "draft") {
      query = query.eq("is_published", false);
    }

    if (options.lifeStage) {
      query = query.eq("target_life_stage", options.lifeStage);
    }

    if (options.search) {
      query = query.ilike("title", `%${options.search}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw new ArticleOperationFailedError(error.message);

    const items = (data ?? []).map((r) =>
      ArticleMapper.toDomain(r as unknown as ArticleRow),
    );

    return { items, total: count ?? items.length, page, pageSize };
  }

  async findById(id: string): Promise<Article | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_WITH_AUTHOR)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new ArticleOperationFailedError(error.message);
    if (!data) return null;
    return ArticleMapper.toDomain(data as unknown as ArticleRow);
  }

  async create(input: CreateArticleInput): Promise<Article> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert(toRow(input))
      .select(SELECT_WITH_AUTHOR)
      .single();

    if (error) {
      if (isUniqueViolation(error)) throw new ArticleSlugTakenError();
      throw new ArticleOperationFailedError(error.message);
    }
    return ArticleMapper.toDomain(data as unknown as ArticleRow);
  }

  async update(id: string, input: UpdateArticleInput): Promise<Article> {
    const patch = toRow(input);
    const { data, error } = await this.client
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select(SELECT_WITH_AUTHOR)
      .maybeSingle();

    if (error) {
      if (isUniqueViolation(error)) throw new ArticleSlugTakenError();
      throw new ArticleOperationFailedError(error.message);
    }
    if (!data) throw new ArticleNotFoundError();
    return ArticleMapper.toDomain(data as unknown as ArticleRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new ArticleOperationFailedError(error.message);
  }
}

/** Deteksi pelanggaran UNIQUE Postgres (mis. slug duplikat). */
function isUniqueViolation(error: { code?: string }): boolean {
  return error.code === "23505";
}

/** Map field domain (camelCase) → kolom tabel (snake_case), hanya yang terdefinisi. */
function toRow(
  input: CreateArticleInput | UpdateArticleInput,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.excerpt !== undefined) row.excerpt = input.excerpt;
  if (input.content !== undefined) row.content = input.content;
  if (input.coverImageUrl !== undefined)
    row.cover_image_url = input.coverImageUrl;
  if (input.targetLifeStage !== undefined)
    row.target_life_stage = input.targetLifeStage;
  if (input.authorId !== undefined) row.author_id = input.authorId;
  if (input.isPublished !== undefined) row.is_published = input.isPublished;
  if (input.publishedAt !== undefined)
    row.published_at = input.publishedAt ? input.publishedAt.toISOString() : null;
  return row;
}
