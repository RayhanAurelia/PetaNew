import {
  Food,
  type FoodCategory,
} from "@/src/domain/entities/food";
import type {
  IFoodRepository,
  SearchFoodsOptions,
  SearchFoodsResult,
} from "@/src/domain/repositories/IFoodRepository";
import {
  FoodExternalApiError,
  FoodSearchFailedError,
} from "@/src/domain/errors/foodErrors";

/**
 * Adapter ke OpenFoodFacts (open & gratis, no API key).
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */
const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v0/product";
const USER_AGENT = "PETA-Stunting-Tracker/0.1 (educational; contact@peta.local)";

const SEARCH_TIMEOUT_MS = 15_000;
const DETAIL_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1; // total = 1 + retry = 2 attempts
const RETRY_BASE_DELAY_MS = 600;

interface OffNutriments {
  "energy-kcal_100g"?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
}

interface OffProduct {
  code?: string;
  _id?: string;
  product_name?: string;
  product_name_en?: string;
  product_name_id?: string;
  generic_name?: string;
  brands?: string;
  image_url?: string;
  image_front_url?: string;
  image_small_url?: string;
  categories?: string;
  categories_tags?: string[];
  nutriments?: OffNutriments;
}

interface OffSearchResponse {
  products?: OffProduct[];
  count?: number;
  page?: number;
  page_size?: number;
}

interface OffProductResponse {
  status?: number;
  product?: OffProduct;
}

interface FetchOffOptions {
  timeoutMs: number;
  revalidate: number;
  context: string;
  /** Kalau true, status 404 dianggap valid (untuk findById). */
  allow404?: boolean;
}

/**
 * Wrapper fetch yang tahan terhadap kelambatan & flakiness OpenFoodFacts:
 * - AbortController dengan timeout eksplisit (cgi/search.pl bisa hang 30s+).
 * - Retry 1x dengan backoff untuk network error & 5xx.
 * - Logging server-side biar gampang debug saat insiden.
 */
async function fetchOff(
  url: string,
  opts: FetchOffOptions,
  attempt = 0,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: opts.revalidate },
    });
    clearTimeout(timeoutId);

    if (opts.allow404 && res.status === 404) return res;

    // Retry untuk 5xx (transient server error)
    if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES) {
      console.warn(
        `[OFF] ${opts.context} attempt ${attempt + 1} → status ${res.status}, retrying...`,
      );
      await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
      return fetchOff(url, opts, attempt + 1);
    }

    if (!res.ok) {
      console.error(
        `[OFF] ${opts.context} failed permanently: status ${res.status}`,
      );
      throw new FoodSearchFailedError(
        `OpenFoodFacts merespons dengan status ${res.status}. Coba lagi sebentar lagi.`,
      );
    }

    return res;
  } catch (err) {
    clearTimeout(timeoutId);

    const isAbort = err instanceof Error && err.name === "AbortError";
    const isFoodError =
      err instanceof FoodSearchFailedError ||
      err instanceof FoodExternalApiError;

    if (isFoodError) throw err;

    // Retry untuk network error (bukan abort)
    if (!isAbort && attempt < MAX_RETRIES) {
      console.warn(
        `[OFF] ${opts.context} attempt ${attempt + 1} → network error: ${describeError(err)}. Retrying...`,
      );
      await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
      return fetchOff(url, opts, attempt + 1);
    }

    if (isAbort) {
      console.error(
        `[OFF] ${opts.context} timed out after ${opts.timeoutMs}ms`,
      );
      throw new FoodExternalApiError(
        `OpenFoodFacts merespons terlalu lama (>${Math.round(opts.timeoutMs / 1000)}s). Coba kata kunci lain atau ulangi.`,
      );
    }

    console.error(`[OFF] ${opts.context} failed: ${describeError(err)}`);
    throw new FoodExternalApiError(
      `Gagal terhubung ke OpenFoodFacts: ${describeError(err)}`,
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class OpenFoodFactsRepository implements IFoodRepository {
  async search(options: SearchFoodsOptions): Promise<SearchFoodsResult> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;

    const params = new URLSearchParams({
      search_terms: options.query,
      search_simple: "1",
      action: "process",
      json: "1",
      page: String(page),
      page_size: String(pageSize),
      // Field filter biar payload kecil
      fields:
        "code,product_name,product_name_en,product_name_id,brands,image_url,image_small_url,categories_tags,nutriments",
    });

    const url = `${SEARCH_URL}?${params.toString()}`;
    const res = await fetchOff(url, {
      timeoutMs: SEARCH_TIMEOUT_MS,
      revalidate: 300,
      context: `search "${options.query}" page=${page}`,
    });

    let json: OffSearchResponse;
    try {
      json = (await res.json()) as OffSearchResponse;
    } catch {
      throw new FoodSearchFailedError("Format respons OpenFoodFacts tidak valid");
    }

    const rawProducts = json.products ?? [];
    const items = rawProducts
      .map((p) => mapProductToFood(p))
      .filter((f): f is Food => f !== null);

    return {
      items,
      total: json.count ?? items.length,
      page: json.page ?? page,
      pageSize: json.page_size ?? pageSize,
    };
  }

  async findById(id: string): Promise<Food | null> {
    const res = await fetchOff(
      `${PRODUCT_URL}/${encodeURIComponent(id)}.json`,
      {
        timeoutMs: DETAIL_TIMEOUT_MS,
        revalidate: 3600,
        allow404: true,
        context: `product ${id}`,
      },
    );

    if (res.status === 404) return null;

    const json = (await res.json()) as OffProductResponse;
    if (json.status !== 1 || !json.product) return null;

    return mapProductToFood(json.product);
  }
}

function mapProductToFood(p: OffProduct): Food | null {
  const id = p.code ?? p._id;
  if (!id) return null;

  const name =
    p.product_name_id?.trim() ||
    p.product_name?.trim() ||
    p.product_name_en?.trim() ||
    p.generic_name?.trim();
  if (!name) return null;

  const nutr = p.nutriments ?? {};
  const kcal =
    nutr["energy-kcal_100g"] ??
    (nutr.energy_100g != null ? nutr.energy_100g / 4.184 : 0);

  // OFF kadang tidak punya kalori sama sekali → skip
  if (kcal == null || Number.isNaN(kcal)) return null;

  return new Food(
    String(id),
    name,
    p.brands?.split(",")[0]?.trim() || null,
    inferCategory(p.categories_tags ?? []),
    null,
    p.image_small_url ?? p.image_url ?? null,
    roundTo(kcal, 1),
    roundTo(nutr.proteins_100g ?? 0, 2),
    roundTo(nutr.carbohydrates_100g ?? 0, 2),
    roundTo(nutr.fat_100g ?? 0, 2),
    nutr.fiber_100g != null ? roundTo(nutr.fiber_100g, 2) : null,
    "openfoodfacts",
    String(id),
    false,
  );
}

function inferCategory(tags: string[]): FoodCategory {
  const t = tags.map((s) => s.toLowerCase());
  if (t.some((x) => x.includes("beverages") || x.includes("drinks")))
    return "beverage";
  if (t.some((x) => x.includes("dairies") || x.includes("milks")))
    return "dairy";
  if (t.some((x) => x.includes("meats") || x.includes("fishes")))
    return "protein_animal";
  if (t.some((x) => x.includes("legumes") || x.includes("nuts") || x.includes("tofu")))
    return "protein_plant";
  if (t.some((x) => x.includes("vegetables"))) return "vegetable";
  if (t.some((x) => x.includes("fruits"))) return "fruit";
  if (
    t.some(
      (x) =>
        x.includes("rice") ||
        x.includes("cereals") ||
        x.includes("pasta") ||
        x.includes("breads"),
    )
  )
    return "staple";
  if (t.some((x) => x.includes("snacks") || x.includes("biscuits") || x.includes("chocolates")))
    return "snack";
  return "other";
}

function roundTo(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
