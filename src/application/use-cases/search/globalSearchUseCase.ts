import type { SupabaseClient } from "@supabase/supabase-js";
import type { SearchOutputDTO } from "../../dtos/search/searchDTO";

const MAX_PER_GROUP = 5;

/**
 * Global search ringan untuk topbar — query ILIKE ke beberapa tabel terkait.
 * Tidak butuh repository abstraction karena ini purely view-layer aggregator.
 */
export class GlobalSearchUseCase {
  constructor(private readonly client: SupabaseClient) {}

  async execute(profileId: string, query: string): Promise<SearchOutputDTO> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { query: trimmed, subjects: [], articles: [] };
    }
    // Escape % dan _ supaya tidak jadi wildcard liar.
    const safe = trimmed.replace(/[%_]/g, "\\$&");
    const pattern = `%${safe}%`;

    const [subjectsResult, articlesResult] = await Promise.all([
      this.client
        .from("subjects_enriched")
        .select("id, name, relationship, life_stage")
        .eq("profile_id", profileId)
        .ilike("name", pattern)
        .limit(MAX_PER_GROUP),
      this.client
        .from("articles")
        .select("id, slug, title, excerpt, target_life_stage")
        .eq("is_published", true)
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(MAX_PER_GROUP),
    ]);

    const subjectRows = subjectsResult.data ?? [];
    const articleRows = articlesResult.data ?? [];

    return {
      query: trimmed,
      subjects: subjectRows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        relationship: r.relationship as SearchOutputDTO["subjects"][number]["relationship"],
        lifeStage: r.life_stage as SearchOutputDTO["subjects"][number]["lifeStage"],
      })),
      articles: articleRows.map((r) => ({
        id: r.id as string,
        slug: r.slug as string,
        title: r.title as string,
        excerpt: (r.excerpt as string | null) ?? null,
        targetLifeStage: r.target_life_stage as SearchOutputDTO["articles"][number]["targetLifeStage"],
      })),
    };
  }
}
