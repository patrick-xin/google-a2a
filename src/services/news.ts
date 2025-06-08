import { supabaseAdmin } from "@/lib/supabase/admin";
import { unstable_cache as cache } from "next/cache";

export interface NewsArticle {
  id: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  extracted_data: Record<string, unknown>;
  quality_score: number;
  relevance_score: number;
  first_seen: string;
  total_count: number;
}

export interface NewsFeedResponse {
  articles: NewsArticle[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

export interface GetNewsFeedParams {
  page?: number;
  limit?: number;
  sort?: "relevance" | "recent" | "quality";
  domain?: string;
  minQuality?: number;
}

/**
 * Get paginated news feed using database function
 */
export async function getNewsFeed({
  page = 1,
  limit = 20,
  sort = "relevance",
  domain,
  minQuality = 0.3,
}: GetNewsFeedParams = {}): Promise<NewsFeedResponse> {
  try {
    const offset = (page - 1) * limit;

    const { data, error } = await supabaseAdmin.rpc("get_news_feed", {
      p_limit: limit,
      p_offset: offset,
      p_min_quality: minQuality,
      p_domain: domain || null,
      p_sort_by: sort,
    });

    if (error) {
      console.error("Error fetching news feed:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        articles: [],
        totalCount: 0,
        hasMore: false,
        currentPage: page,
      };
    }

    const totalCount = data[0]?.total_count || 0;
    const hasMore = page * limit < totalCount;

    return {
      articles: data,
      totalCount,
      hasMore,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch news feed:", error);
    throw error;
  }
}

/**
 * Get available domains for filtering
 */
export async function getAvailableDomains(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("news_articles")
      .select("domain")
      .not("domain", "is", null)
      .gte("quality_score", 0.3);

    if (error) {
      console.error("Error fetching domains:", error);
      return [];
    }

    // Get unique domains and sort them
    const domains = [...new Set(data.map((item) => item.domain))]
      .filter(Boolean)
      .sort();

    return domains;
  } catch (error) {
    console.error("Failed to fetch domains:", error);
    return [];
  }
}

/**
 * Get article by ID (for individual article pages)
 */
export const getArticleById = cache(
  async (id: string): Promise<NewsArticle | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("news_articles")
        .select(
          `
          id,
          url,
          title,
          description,
          domain,
          extracted_data,
          quality_score,
          first_seen
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        ...data,
        relevance_score: 0, // Not needed for single article
        total_count: 1,
      };
    } catch (error) {
      console.error("Failed to fetch article:", error);
      return null;
    }
  },
  ["article-by-id"],
  {
    revalidate: 3600, // 1 hour
    tags: ["article"],
  }
);

/**
 * Update article analytics (track clicks)
 */
export async function trackArticleClick(
  articleId: string,
  userFingerprint?: string
) {
  try {
    const { error } = await supabaseAdmin.from("article_analytics").insert({
      article_id: articleId,
      event_type: "click",
      user_fingerprint: userFingerprint,
    });

    if (error) {
      console.error("Error tracking click:", error);
    }
  } catch (error) {
    console.error("Failed to track click:", error);
  }
}

/**
 * Get trending articles (most clicked in last 24h)
 */
export const getTrendingArticles = cache(
  async (limit: number = 10): Promise<NewsArticle[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("news_articles")
        .select(
          `
          id,
          url,
          title,
          description,
          domain,
          extracted_data,
          quality_score,
          first_seen,
          click_count
        `
        )
        .gte("quality_score", 0.5)
        .gte(
          "first_seen",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order("click_count", { ascending: false })
        .order("quality_score", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching trending articles:", error);
        return [];
      }

      return data.map((article) => ({
        ...article,
        relevance_score: 0,
        total_count: 0,
      }));
    } catch (error) {
      console.error("Failed to fetch trending articles:", error);
      return [];
    }
  },
  ["trending-articles"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["trending"],
  }
);
