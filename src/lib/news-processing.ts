import { supabaseAdmin } from "./supabase/admin";

// Types
interface FirecrawlArticle {
  title: string;
  description: string;
  url: string;
}

interface TavilyArticle {
  title: string;
  description: string;
  url: string;
}

interface NormalizedArticle {
  title: string;
  description: string;
  url: string;
  source: "firecrawl" | "tavily";
  position: number;
}

interface ArticleForDB {
  url: string;
  title: string;
  description: string;
  raw_data: Record<string, unknown>;
  extracted_data: Record<string, unknown>;
  quality_score: number;
  search_query: string;
  position: number;
}

/**
 * Normalize articles from different sources into a common format
 */
export function normalizeArticles(
  firecrawlData: FirecrawlArticle[],
  tavilyData: TavilyArticle[]
): NormalizedArticle[] {
  const normalized: NormalizedArticle[] = [];

  // Add Firecrawl articles
  firecrawlData.forEach((article, index) => {
    normalized.push({
      title: article.title || "",
      description: article.description || "",
      url: article.url,
      source: "firecrawl",
      position: index,
    });
  });

  // Add Tavily articles (continue position numbering)
  tavilyData.forEach((article, index) => {
    normalized.push({
      title: article.title || "",
      description: article.description || "",
      url: article.url,
      source: "tavily",
      position: firecrawlData.length + index,
    });
  });

  return normalized;
}

/**
 * Clean and validate URLs
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    const paramsToRemove = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    paramsToRemove.forEach((param) => urlObj.searchParams.delete(param));

    // Remove fragment
    urlObj.hash = "";

    return urlObj.toString();
  } catch {
    return url; // Return original if URL parsing fails
  }
}

/**
 * Simple deduplication based on URL similarity
 */
export function deduplicateArticles(
  articles: NormalizedArticle[]
): NormalizedArticle[] {
  const seen = new Set<string>();
  const deduplicated: NormalizedArticle[] = [];

  for (const article of articles) {
    const cleanedUrl = cleanUrl(article.url);
    const dedupeKey = `${cleanedUrl}|${article.title.toLowerCase().trim()}`;

    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      deduplicated.push({
        ...article,
        url: cleanedUrl, // Use cleaned URL
      });
    }
  }

  return deduplicated;
}

/**
 * Calculate basic quality score
 */
export function calculateQualityScore(article: NormalizedArticle): number {
  let score = 0.3; // Base score

  // Add points for having content
  if (article.title && article.title.length > 10) score += 0.3;
  if (article.description && article.description.length > 20) score += 0.3;
  if (article.url && article.url.startsWith("https://")) score += 0.1;

  return Math.min(1.0, score);
}

/**
 * Transform normalized articles for database insertion
 */
export function prepareForDatabase(
  articles: NormalizedArticle[],
  searchQuery: string = "google a2a protocol"
): ArticleForDB[] {
  return articles.map((article) => ({
    url: article.url,
    title: article.title,
    description: article.description,
    raw_data: {}, // Empty for now, can store original API response later
    extracted_data: {
      source: article.source,
      original_position: article.position,
    },
    quality_score: calculateQualityScore(article),
    search_query: searchQuery,
    position: article.position,
  }));
}

/**
 * Save articles to database using the upsert function
 */
export async function saveArticlesToDB(
  articles: ArticleForDB[]
): Promise<number> {
  let successCount = 0;
  const errors: string[] = [];

  console.log(
    `Starting database save operation for ${articles.length} articles...`
  );

  for (const [index, article] of articles.entries()) {
    try {
      const { error } = await supabaseAdmin.rpc("upsert_article", {
        p_url: article.url,
        p_title: article.title,
        p_description: article.description,
        p_raw_data: article.raw_data,
        p_extracted_data: article.extracted_data,
        p_quality_score: article.quality_score,
        p_search_query: article.search_query,
        p_position: article.position,
      });

      if (error) {
        console.error(
          `❌ Error saving article ${index + 1}:`,
          article.url,
          error
        );
        errors.push(`${article.url}: ${error.message}`);
        continue;
      }

      successCount++;
      if (successCount % 5 === 0) {
        console.log(`✓ Saved ${successCount}/${articles.length} articles...`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to save article ${index + 1}:`,
        article.url,
        error
      );
      errors.push(
        `${article.url}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  console.log(
    `Database save completed: ${successCount}/${articles.length} articles saved successfully`
  );

  if (errors.length > 0) {
    console.warn(
      `⚠️  ${errors.length} articles failed to save:`,
      errors.slice(0, 3)
    ); // Show first 3 errors
  }

  return successCount;
}

/**
 * Main processing pipeline - combines all steps
 */
export async function processNewsArticles(
  firecrawlData: FirecrawlArticle[],
  tavilyData: TavilyArticle[]
): Promise<{ processed: number; duplicates_removed: number; saved: number }> {
  try {
    console.log("Starting news processing pipeline...");
    console.log(
      `Input: ${firecrawlData.length} Firecrawl + ${tavilyData.length} Tavily articles`
    );

    // Step 1: Normalize data from both sources
    const normalized = normalizeArticles(firecrawlData, tavilyData);
    console.log(`✓ Normalized ${normalized.length} articles from both sources`);

    // Step 2: Remove duplicates
    const deduplicated = deduplicateArticles(normalized);
    const duplicatesRemoved = normalized.length - deduplicated.length;
    console.log(
      `✓ Removed ${duplicatesRemoved} duplicates, ${deduplicated.length} unique articles remaining`
    );

    // Step 3: Prepare for database
    const forDB = prepareForDatabase(deduplicated);
    console.log(`✓ Prepared ${forDB.length} articles for database insertion`);

    // Step 4: Save to database
    const savedCount = await saveArticlesToDB(forDB);
    console.log(`✓ Successfully saved ${savedCount} articles to database`);
    console.log("News processing pipeline completed successfully");

    return {
      processed: normalized.length,
      duplicates_removed: duplicatesRemoved,
      saved: savedCount,
    };
  } catch (error) {
    console.error("❌ Error in processing pipeline:", error);
    throw error;
  }
}

/**
 * Utility function to refresh the materialized view
 */
export async function refreshNewsFeed(): Promise<void> {
  try {
    console.log("🔄 Refreshing news feed materialized view...");
    const startTime = Date.now();

    const { error } = await supabaseAdmin.rpc("refresh_news_feed");

    if (error) {
      console.error("❌ Error refreshing news feed materialized view:", error);
      throw error;
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ News feed materialized view refreshed successfully (${duration}ms)`
    );

    // Optional: Verify the refresh worked by checking row count
    const { data: countData, error: countError } = await supabaseAdmin
      .from("news_feed_ranked")
      .select("*", { count: "exact", head: true });

    if (!countError && countData !== null) {
      console.log(
        `📊 Materialized view now contains ${countData.length || 0} articles`
      );
    }
  } catch (error) {
    console.error("❌ Failed to refresh news feed materialized view:", error);
    throw error;
  }
}

interface FirecrawlArticle {
  title: string;
  description: string;
  url: string;
}
interface FirecrawlResponse {
  success: boolean;
  data: FirecrawlArticle[];
  error?: string;
}

interface TavilyArticle {
  title: string;
  description: string;
  url: string;
}

const QUERY = "google a2a protocol";

export async function getFirecrawlData() {
  const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      limit: 5,
      tbs: "qdr:d",
      lang: "en",
      timeout: 60000,
      ignoreInvalidURLs: true,
    }),
  });

  if (!firecrawlResponse.ok) {
    throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
  }

  const firecrawlData: FirecrawlResponse = await firecrawlResponse.json();
  return firecrawlData.data;
}

export async function getTavilyData() {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      limit: 5,
      search_depth: "advanced",
      time_range: "day",
      max_results: 10,
      include_raw_content: false,
      exclude_domains: ["https://www.youtube.com/", "https://github.com/"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error`);
  }

  const data = await response.json();

  return data.results as TavilyArticle[];
}
