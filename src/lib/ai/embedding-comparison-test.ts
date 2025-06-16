import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { supabaseAdmin } from "../supabase/admin";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * ENHANCED: Multi-strategy search that adapts to different query types
 */
export async function enhancedSearchDocuments(
  query: string,
  options: {
    limit?: number;
    minThreshold?: number;
    strategy?: "adaptive" | "progressive" | "hybrid";
  } = {}
): Promise<{
  chunks: Array<{
    content: string;
    metadata: any;
    similarity: number;
    matchType: string;
  }>;
  strategy: string;
  totalFound: number;
}> {
  const { limit = 10, minThreshold = 0.2, strategy = "adaptive" } = options;

  console.log(`🔍 Enhanced search: "${query}" (strategy: ${strategy})`);

  try {
    // Generate embedding for query
    const { embedding: queryEmbedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // Strategy 1: Adaptive search based on query analysis
    if (strategy === "adaptive") {
      return await adaptiveSearch(query, queryEmbedding, {
        limit,
        minThreshold,
      });
    }

    // Strategy 2: Progressive threshold reduction
    if (strategy === "progressive") {
      return await progressiveSearch(queryEmbedding, { limit, minThreshold });
    }

    // Strategy 3: Hybrid multi-embedding search
    return await hybridSearch(queryEmbedding, { limit, minThreshold });
  } catch (error) {
    console.error("Enhanced search failed:", error);
    throw error;
  }
}

/**
 * Adaptive search: Choose strategy based on query characteristics
 */
async function adaptiveSearch(
  query: string,
  queryEmbedding: number[],
  options: { limit: number; minThreshold: number }
) {
  const { limit, minThreshold } = options;

  // Analyze query characteristics
  const isShortTitle = query.length < 50 && !query.includes("?");
  const isQuestion =
    query.includes("?") ||
    ["what", "how", "why", "when", "where"].some((w) =>
      query.toLowerCase().startsWith(w)
    );
  const hasKeywords = query.split(" ").length <= 4;

  console.log(
    `   Query analysis: shortTitle=${isShortTitle}, question=${isQuestion}, keywords=${hasKeywords}`
  );

  // Choose initial threshold based on query type
  let initialThreshold = 0.5;
  if (isShortTitle) initialThreshold = 0.4; // Lower for title matches
  if (isQuestion) initialThreshold = 0.6; // Higher for complex questions
  if (hasKeywords) initialThreshold = 0.45; // Medium for keyword searches

  // Try initial search
  let results = await searchWithThreshold(
    queryEmbedding,
    initialThreshold,
    limit
  );

  if (results.length >= 3) {
    return {
      chunks: results,
      strategy: `adaptive_initial_${initialThreshold}`,
      totalFound: results.length,
    };
  }

  // If not enough results, try progressively lower thresholds
  const fallbackThresholds = [0.4, 0.3, 0.2];
  for (const threshold of fallbackThresholds) {
    if (threshold >= initialThreshold) continue;

    results = await searchWithThreshold(queryEmbedding, threshold, limit);
    if (results.length >= 2) {
      return {
        chunks: results,
        strategy: `adaptive_fallback_${threshold}`,
        totalFound: results.length,
      };
    }
  }

  // Final fallback: text search
  const textResults = await textFallbackSearch(query, limit);
  return {
    chunks: textResults,
    strategy: "adaptive_text_fallback",
    totalFound: textResults.length,
  };
}

/**
 * Progressive search: Try multiple thresholds until we get good results
 */
async function progressiveSearch(
  queryEmbedding: number[],
  options: { limit: number; minThreshold: number }
) {
  const { limit, minThreshold } = options;
  const thresholds = [0.7, 0.6, 0.5, 0.4, 0.3, 0.2];

  for (const threshold of thresholds) {
    if (threshold < minThreshold) break;

    console.log(`   Trying threshold: ${threshold}`);
    const results = await searchWithThreshold(queryEmbedding, threshold, limit);

    if (results.length >= 3 || (threshold <= 0.3 && results.length >= 1)) {
      return {
        chunks: results,
        strategy: `progressive_${threshold}`,
        totalFound: results.length,
      };
    }
  }

  return {
    chunks: [],
    strategy: "progressive_failed",
    totalFound: 0,
  };
}

/**
 * Hybrid search: Use new hybrid function when available, fallback to original
 */
async function hybridSearch(
  queryEmbedding: number[],
  options: { limit: number; minThreshold: number }
) {
  const { limit, minThreshold } = options;

  try {
    // Try new hybrid search function
    const { data: hybridData, error: hybridError } = await supabaseAdmin.rpc(
      "hybrid_match_documents",
      {
        query_embedding: queryEmbedding,
        match_threshold: minThreshold,
        match_count: limit,
      }
    );

    if (!hybridError && hybridData && hybridData.length > 0) {
      const results = hybridData.map((item: any) => ({
        content: item.content,
        metadata:
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata,
        similarity: item.similarity,
        matchType: item.match_type,
      }));

      return {
        chunks: results,
        strategy: "hybrid_multi_embedding",
        totalFound: results.length,
      };
    }
  } catch (error) {
    console.log("   Hybrid search not available, using fallback");
  }

  // Fallback to original search
  const results = await searchWithThreshold(
    queryEmbedding,
    minThreshold,
    limit
  );
  return {
    chunks: results,
    strategy: "hybrid_fallback",
    totalFound: results.length,
  };
}

/**
 * Search with specific threshold
 */
async function searchWithThreshold(
  queryEmbedding: number[],
  threshold: number,
  limit: number
) {
  const { data, error } = await supabaseAdmin.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    content: item.content,
    metadata:
      typeof item.metadata === "string"
        ? JSON.parse(item.metadata)
        : item.metadata,
    similarity: item.similarity,
    matchType: "contextual",
  }));
}

/**
 * Text-based fallback search
 */
async function textFallbackSearch(query: string, limit: number) {
  console.log("   Using text-based fallback search");

  const keywords = query
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 2);
  const searchPattern = keywords.join("|");

  const { data, error } = await supabaseAdmin
    .from("document_embeddings")
    .select("content, metadata")
    .or(`content.ilike.%${query}%,metadata->>headingPath.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error("Text fallback search failed:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    content: item.content,
    metadata:
      typeof item.metadata === "string"
        ? JSON.parse(item.metadata)
        : item.metadata,
    similarity: 0.7, // Fixed similarity for text matches
    matchType: "text",
  }));
}

/**
 * BACKWARDS COMPATIBLE: Enhanced version of your original function
 */
export async function searchDocuments(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    documentFilter?: string;
  } = {}
): Promise<{
  chunks: Array<{
    content: string;
    metadata: any;
    similarity: number;
  }>;
}> {
  // Use enhanced search with progressive strategy
  const enhancedResult = await enhancedSearchDocuments(query, {
    limit: options.limit,
    minThreshold: options.threshold || 0.2,
    strategy: "progressive",
  });

  // Apply document filter if specified
  let chunks = enhancedResult.chunks;
  if (options.documentFilter) {
    chunks = chunks.filter(
      (chunk) => chunk.metadata.title === options.documentFilter
    );
  }

  return { chunks };
}

/**
 * Enhanced searchForAgent with better results
 */
export async function searchForAgent(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    contextWindow?: number;
  } = {}
) {
  const { limit = 5, threshold = 0.2, contextWindow = 2000 } = options;

  const searchResults = await enhancedSearchDocuments(query, {
    limit: limit * 2, // Get more results for better selection
    minThreshold: threshold,
    strategy: "adaptive",
  });

  // Format results for agent consumption
  const formattedResults = searchResults.chunks
    .slice(0, limit) // Take top N results
    .map((result, index) => {
      let content = result.content;
      if (content.length > contextWindow) {
        content = content.substring(0, contextWindow) + "...";
      }

      const title = result.metadata?.title || "Unknown Document";
      const section = result.metadata?.section || "";
      const subsection = result.metadata?.subsection || "";
      const url = result.metadata?.url || "";
      const anchor = result.metadata?.anchor || "";

      const sectionPath = [section, subsection].filter(Boolean).join(" > ");
      const citationText = sectionPath ? `${title} - ${sectionPath}` : title;
      const citationUrl = anchor ? `${url}${anchor}` : url;

      return {
        index: index + 1,
        content,
        citation: {
          text: citationText,
          url: citationUrl,
          title: title,
          section: sectionPath,
        },
        similarity: result.similarity,
        matchType: result.matchType,
        citationText: `[${citationText}](${citationUrl})`,
        originalContent: result.metadata?.originalContent || content,
      };
    });

  return {
    query,
    results: formattedResults,
    totalResults: searchResults.totalFound,
    searchStrategy: searchResults.strategy,
    summary: {
      queryHandled: formattedResults.length > 0,
      topSimilarity: formattedResults[0]?.similarity || 0,
      documentsFound: [
        ...new Set(formattedResults.map((r) => r.citation.title)),
      ].length,
      suggestedThreshold: threshold,
    },
  };
}


