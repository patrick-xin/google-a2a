import { embed } from "ai";
import { supabaseAdmin } from "../supabase/admin";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const SEARCH_CONFIG = {
  embedding: {
    model: openai.embedding("text-embedding-3-small"),
    maxRetries: 2,
  },
  supabase: {
    tableName: "document_embeddings",
    functions: {
      match: "match_documents",
      matchAdvanced: "match_documents_advanced",
      hybridMatch: "hybrid_match_documents",
    },
  },
  defaults: {
    limit: 10,
    threshold: 0.2,
    contextWindow: 2000,
  },
} as const;

// ========================================
// TYPES
// ========================================
export interface SearchOptions {
  limit?: number;
  threshold?: number;
  documentFilter?: string;
  sectionFilter?: string;
  chunkTypeFilter?: string;
  strategy?: "adaptive" | "progressive" | "hybrid";
  contextWindow?: number;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  similarity: number;
  matchType: string;
}

export interface FormattedSearchResult extends SearchResult {
  index: number;
  citation: {
    text: string;
    url: string;
    title: string;
    section: string;
  };
  citationText: string;
  originalContent: string;
}

export interface SearchResponse<T = SearchResult> {
  query: string;
  results: T[];
  totalResults: number;
  strategy: string;
  summary: {
    queryHandled: boolean;
    topSimilarity: number;
    documentsFound: number;
    suggestedThreshold: number;
  };
}

// ========================================
// CORE SEARCH FUNCTIONS
// ========================================

/**
 * Generate embedding for search query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: SEARCH_CONFIG.embedding.model,
      value: query,
      maxRetries: SEARCH_CONFIG.embedding.maxRetries,
    });

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Invalid embedding format generated");
    }

    return embedding;
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw error;
  }
}

/**
 * Execute vector similarity search with threshold
 */
async function executeVectorSearch(
  queryEmbedding: number[],
  threshold: number,
  limit: number,
  filters: Record<string, any> = {}
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      SEARCH_CONFIG.supabase.functions.match,
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      }
    );

    if (error) throw error;

    return (data || []).map((item: any) => ({
      content: item.content,
      metadata:
        typeof item.metadata === "string"
          ? JSON.parse(item.metadata)
          : item.metadata,
      similarity: item.similarity,
      matchType: "vector",
    }));
  } catch (error) {
    console.error("Vector search error:", error);
    throw error;
  }
}

/**
 * Execute hybrid search (multiple embedding types)
 */
async function executeHybridSearch(
  queryEmbedding: number[],
  threshold: number,
  limit: number
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      SEARCH_CONFIG.supabase.functions.hybridMatch,
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      }
    );

    if (error) throw error;

    return (data || []).map((item: any) => ({
      content: item.content,
      metadata:
        typeof item.metadata === "string"
          ? JSON.parse(item.metadata)
          : item.metadata,
      similarity: item.similarity,
      matchType: item.match_type || "hybrid",
    }));
  } catch (error) {
    console.error("Hybrid search error:", error);
    throw error;
  }
}

/**
 * Execute text-based fallback search
 */
async function executeTextSearch(
  query: string,
  limit: number
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(SEARCH_CONFIG.supabase.tableName)
      .select("content, metadata")
      .or(`content.ilike.%${query}%,metadata->>headingPath.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      content: item.content,
      metadata:
        typeof item.metadata === "string"
          ? JSON.parse(item.metadata)
          : item.metadata,
      similarity: 0.7, // Fixed similarity for text matches
      matchType: "text",
    }));
  } catch (error) {
    console.error("Text search error:", error);
    return [];
  }
}

// ========================================
// SEARCH STRATEGIES
// ========================================

/**
 * Adaptive search: Choose strategy based on query characteristics
 */
async function adaptiveSearch(
  query: string,
  queryEmbedding: number[],
  options: Required<Pick<SearchOptions, "limit" | "threshold">>
): Promise<{ results: SearchResult[]; strategy: string }> {
  const { limit, threshold } = options;

  // Analyze query characteristics
  const isShortQuery = query.length < 50 && !query.includes("?");
  const isQuestion =
    query.includes("?") ||
    ["what", "how", "why", "when", "where"].some((w) =>
      query.toLowerCase().startsWith(w)
    );
  const hasKeywords = query.split(" ").length <= 4;

  // Choose initial threshold based on query type
  let initialThreshold = 0.5;
  if (isShortQuery) initialThreshold = 0.4;
  if (isQuestion) initialThreshold = 0.6;
  if (hasKeywords) initialThreshold = 0.45;

  console.log(
    `🔍 Adaptive search analysis: shortQuery=${isShortQuery}, question=${isQuestion}, keywords=${hasKeywords}, threshold=${initialThreshold}`
  );

  // Try initial search
  let results = await executeVectorSearch(
    queryEmbedding,
    initialThreshold,
    limit
  );

  if (results.length >= 3) {
    return { results, strategy: `adaptive_initial_${initialThreshold}` };
  }

  // Progressive fallback
  const fallbackThresholds = [0.4, 0.3, 0.2];
  for (const fallbackThreshold of fallbackThresholds) {
    if (fallbackThreshold >= initialThreshold) continue;

    results = await executeVectorSearch(
      queryEmbedding,
      fallbackThreshold,
      limit
    );
    if (results.length >= 2) {
      return { results, strategy: `adaptive_fallback_${fallbackThreshold}` };
    }
  }

  // Final text fallback
  const textResults = await executeTextSearch(query, limit);
  return { results: textResults, strategy: "adaptive_text_fallback" };
}

/**
 * Progressive search: Try multiple thresholds
 */
async function progressiveSearch(
  queryEmbedding: number[],
  options: Required<Pick<SearchOptions, "limit" | "threshold">>
): Promise<{ results: SearchResult[]; strategy: string }> {
  const { limit, threshold: minThreshold } = options;
  const thresholds = [0.7, 0.6, 0.5, 0.4, 0.3, 0.2];

  for (const threshold of thresholds) {
    if (threshold < minThreshold) break;

    console.log(`   Trying threshold: ${threshold}`);
    const results = await executeVectorSearch(queryEmbedding, threshold, limit);

    if (results.length >= 3 || (threshold <= 0.3 && results.length >= 1)) {
      return { results, strategy: `progressive_${threshold}` };
    }
  }

  return { results: [], strategy: "progressive_failed" };
}

/**
 * Hybrid search: Use multiple embedding types when available
 */
async function hybridSearch(
  queryEmbedding: number[],
  options: Required<Pick<SearchOptions, "limit" | "threshold">>
): Promise<{ results: SearchResult[]; strategy: string }> {
  const { limit, threshold } = options;

  try {
    const results = await executeHybridSearch(queryEmbedding, threshold, limit);
    if (results.length > 0) {
      return { results, strategy: "hybrid_multi_embedding" };
    }
  } catch (error) {
    console.log("Hybrid search not available, using fallback");
  }

  // Fallback to vector search
  const results = await executeVectorSearch(queryEmbedding, threshold, limit);
  return { results, strategy: "hybrid_fallback" };
}

// ========================================
// PUBLIC API
// ========================================

/**
 * Enhanced search with multiple strategies
 */
export async function searchDocuments(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse<SearchResult>> {
  const {
    limit = SEARCH_CONFIG.defaults.limit,
    threshold = SEARCH_CONFIG.defaults.threshold,
    strategy = "adaptive",
    documentFilter,
  } = options;

  console.log(`🔍 Enhanced search: "${query}" (strategy: ${strategy})`);

  try {
    const queryEmbedding = await generateQueryEmbedding(query);

    let searchResult: { results: SearchResult[]; strategy: string };

    switch (strategy) {
      case "adaptive":
        searchResult = await adaptiveSearch(query, queryEmbedding, {
          limit,
          threshold,
        });
        break;
      case "progressive":
        searchResult = await progressiveSearch(queryEmbedding, {
          limit,
          threshold,
        });
        break;
      case "hybrid":
        searchResult = await hybridSearch(queryEmbedding, { limit, threshold });
        break;
      default:
        throw new Error(`Unknown search strategy: ${strategy}`);
    }

    // Apply document filter if specified
    let results = searchResult.results;
    if (documentFilter) {
      results = results.filter(
        (result) => result.metadata.title === documentFilter
      );
    }

    return {
      query,
      results,
      totalResults: results.length,
      strategy: searchResult.strategy,
      summary: {
        queryHandled: results.length > 0,
        topSimilarity: results[0]?.similarity || 0,
        documentsFound: [...new Set(results.map((r) => r.metadata.title))]
          .length,
        suggestedThreshold:
          results.length === 0 ? Math.max(0.1, threshold - 0.1) : threshold,
      },
    };
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}

/**
 * Search optimized for agent responses with formatted citations
 */
export async function searchForAgent(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse<FormattedSearchResult>> {
  const {
    limit = 5,
    threshold = SEARCH_CONFIG.defaults.threshold,
    contextWindow = SEARCH_CONFIG.defaults.contextWindow,
  } = options;

  const searchResults = await searchDocuments(query, {
    ...options,
    limit: limit * 2, // Get more results for better selection
    strategy: "adaptive",
  });

  // Format results for agent consumption
  const formattedResults = searchResults.results
    .slice(0, limit)
    .map((result, index) => {
      // Truncate content if too long
      let content = result.content;
      if (content.length > contextWindow) {
        content = content.substring(0, contextWindow) + "...";
      }

      // Extract citation information
      const title = result.metadata?.title || "Unknown Document";
      const section = result.metadata?.section || "";
      const subsection = result.metadata?.subsection || "";
      const url = result.metadata?.url || "";
      const anchor = result.metadata?.anchor || "";

      const sectionPath = [section, subsection].filter(Boolean).join(" > ");
      const citationText = sectionPath ? `${title} - ${sectionPath}` : title;
      const citationUrl = anchor ? `${url}${anchor}` : url;

      return {
        ...result,
        index: index + 1,
        content,
        citation: {
          text: citationText,
          url: citationUrl,
          title: title,
          section: sectionPath,
        },
        citationText: `[${citationText}](${citationUrl})`,
        originalContent: result.metadata?.originalContent || content,
      };
    });

  return {
    query: searchResults.query,
    results: formattedResults,
    totalResults: searchResults.totalResults,
    strategy: searchResults.strategy,
    summary: {
      ...searchResults.summary,
      documentsFound: [
        ...new Set(formattedResults.map((r) => r.citation.title)),
      ].length,
    },
  };
}
