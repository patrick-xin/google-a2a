import { chunkMDXDocument, type DocumentChunk } from "./chunking"; // Import from our chunking module
import { embedMany, embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { supabaseAdmin } from "../supabase/admin";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Types for our embedding system
interface EmbeddingVector {
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
  usage?: { tokens: number }; // Add usage info from Vercel AI SDK
}

interface StoredDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
  created_at: string;
}

// Configuration
const EMBEDDING_CONFIG = {
  model: openai.embedding("text-embedding-3-small"), // Vercel AI SDK model
  batchSize: 100, // Process chunks in batches
  maxRetries: 2, // Default retries
};

const SUPABASE_CONFIG = {
  tableName: "document_embeddings", // Your table name
  matchFunction: "match_documents", // Your matching function name
};

/**
 * Generate embeddings for multiple text chunks using Vercel AI SDK
 */
async function generateEmbeddings(
  texts: string[]
): Promise<{ embeddings: number[][]; totalTokens: number }> {
  try {
    const { embeddings, usage } = await embedMany({
      model: EMBEDDING_CONFIG.model,
      values: texts,
      maxRetries: EMBEDDING_CONFIG.maxRetries,
    });

    return {
      embeddings,
      totalTokens: usage?.tokens || 0,
    };
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

/**
 * Generate single embedding using Vercel AI SDK
 */
export async function generateSingleEmbedding(
  text: string
): Promise<{ embedding: number[]; tokens: number }> {
  try {
    const { embedding, usage } = await embed({
      model: EMBEDDING_CONFIG.model,
      value: text,
      maxRetries: EMBEDDING_CONFIG.maxRetries,
    });

    return {
      embedding,
      tokens: usage?.tokens || 0,
    };
  } catch (error) {
    console.error("Error generating single embedding:", error);
    throw error;
  }
}

/**
 * Process chunks in batches for efficient embedding generation
 */
async function processChunksInBatches(
  chunks: DocumentChunk[]
): Promise<EmbeddingVector[]> {
  const results: EmbeddingVector[] = [];
  let totalTokensUsed = 0;

  for (let i = 0; i < chunks.length; i += EMBEDDING_CONFIG.batchSize) {
    const batch = chunks.slice(i, i + EMBEDDING_CONFIG.batchSize);

    console.log(
      `Processing batch ${
        Math.floor(i / EMBEDDING_CONFIG.batchSize) + 1
      }/${Math.ceil(chunks.length / EMBEDDING_CONFIG.batchSize)}`
    );

    // Use contextual content for better embeddings
    const texts = batch.map((chunk) => chunk.contextualContent);

    try {
      const { embeddings, totalTokens } = await generateEmbeddings(texts);
      totalTokensUsed += totalTokens;

      // Combine chunks with their embeddings
      const batchResults = batch.map((chunk, index) => ({
        embedding: embeddings[index],
        content: chunk.contextualContent,
        metadata: {
          ...chunk.metadata,
          // Add additional metadata for better retrieval
          originalContent: chunk.content, // Store original without context
          embedding_model: "text-embedding-3-small",
          processed_at: new Date().toISOString(),
        },
        usage: { tokens: Math.floor(totalTokens / batch.length) }, // Approximate tokens per chunk
      }));

      results.push(...batchResults);

      console.log(`Batch completed. Tokens used: ${totalTokens}`);

      // Small delay to respect rate limits
      if (i + EMBEDDING_CONFIG.batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
      throw error;
    }
  }

  console.log(`Total tokens used for embedding: ${totalTokensUsed}`);
  return results;
}

/**
 * Store embeddings in Supabase with correct vector format
 */
async function storeEmbeddings(
  embeddingVectors: EmbeddingVector[]
): Promise<void> {
  try {
    // Prepare data for insertion - ensure embeddings are arrays, not strings
    const insertData = embeddingVectors.map((vector) => ({
      content: vector.content,
      metadata: vector.metadata, // Keep as object, Supabase will handle JSONB conversion
      embedding: vector.embedding, // Ensure this is number[], not string
    }));

    // Insert in batches to avoid payload size limits
    const batchSize = 50;
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);

      // Validate that embeddings are arrays before inserting
      const validBatch = batch.filter((item) => {
        if (!Array.isArray(item.embedding)) {
          console.warn(
            "Skipping item with invalid embedding format:",
            typeof item.embedding
          );
          return false;
        }
        return true;
      });

      if (validBatch.length === 0) {
        console.warn(
          `Batch ${
            Math.floor(i / batchSize) + 1
          } has no valid embeddings, skipping`
        );
        continue;
      }

      const { error } = await supabaseAdmin
        .from(SUPABASE_CONFIG.tableName)
        .insert(validBatch);

      if (error) {
        console.error("Supabase insertion error:", error);
        throw error;
      }

      console.log(
        `Stored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          insertData.length / batchSize
        )} (${validBatch.length} items)`
      );
    }

    console.log(`Successfully stored ${embeddingVectors.length} embeddings`);
  } catch (error) {
    console.error("Error storing embeddings:", error);
    throw error;
  }
}

/**
 * Enhanced main function with better validation and error handling
 */
export async function embedDocument(
  content: string,
  baseUrl: string = "https://google-a2a.vercel.app",
  options: {
    skipExisting?: boolean;
    validateEmbeddings?: boolean;
  } = {}
): Promise<{
  documentMetadata: any;
  chunksProcessed: number;
  embeddingsGenerated: number;
  tokensUsed: number;
  skipped?: number;
}> {
  console.log("Starting document embedding process...");
  const { skipExisting = false, validateEmbeddings = true } = options;

  try {
    // Step 1: Chunk the document
    console.log("Chunking document...");
    const { metadata, chunks, headingStructure } = chunkMDXDocument(
      content,
      baseUrl
    );

    console.log(`Document: ${metadata.title}`);
    console.log(`Generated ${chunks.length} chunks`);
    console.log(`Heading structure: ${headingStructure.length} main sections`);

    // Step 2: Check for existing embeddings if skipExisting is true
    let chunksToProcess = chunks;
    let skippedCount = 0;

    if (skipExisting) {
      console.log("Checking for existing embeddings...");
      const { data: existing } = await supabaseAdmin
        .from(SUPABASE_CONFIG.tableName)
        .select("metadata")
        .eq("metadata->title", metadata.title);

      if (existing && existing.length > 0) {
        console.log(
          `Found ${existing.length} existing chunks for this document`
        );
        // For now, skip the entire document if any chunks exist
        // You could implement more sophisticated logic here
        if (existing.length > 0) {
          console.log("Document already has embeddings, skipping...");
          return {
            documentMetadata: metadata,
            chunksProcessed: 0,
            embeddingsGenerated: 0,
            tokensUsed: 0,
            skipped: existing.length,
          };
        }
      }
    }

    // Step 3: Generate embeddings
    console.log("Generating embeddings...");
    const embeddingVectors = await processChunksInBatches(chunksToProcess);

    // Step 4: Validate embeddings if requested
    if (validateEmbeddings) {
      console.log("Validating embeddings...");
      const invalidEmbeddings = embeddingVectors.filter(
        (vector) =>
          !Array.isArray(vector.embedding) ||
          vector.embedding.length === 0 ||
          vector.embedding.some((val) => typeof val !== "number" || isNaN(val))
      );

      if (invalidEmbeddings.length > 0) {
        throw new Error(
          `Generated ${invalidEmbeddings.length} invalid embeddings`
        );
      }
      console.log("✅ All embeddings validated successfully");
    }

    // Step 5: Store in Supabase
    console.log("Storing embeddings in Supabase...");
    await storeEmbeddings(embeddingVectors);

    // Calculate total tokens used
    const totalTokens = embeddingVectors.reduce(
      (sum, vector) => sum + (vector.usage?.tokens || 0),
      0
    );

    console.log("Document embedding completed successfully!");
    console.log(`Total tokens used: ${totalTokens}`);

    return {
      documentMetadata: metadata,
      chunksProcessed: chunks.length,
      embeddingsGenerated: embeddingVectors.length,
      tokensUsed: totalTokens,
      skipped: skippedCount,
    };
  } catch (error) {
    console.error("Error in embedding pipeline:", error);
    throw error;
  }
}

/**
 * Enhanced search function with better error handling and debugging
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
  const { limit = 10, threshold = 0.1, documentFilter } = options;

  try {
    // Generate embedding for the query using Vercel AI SDK
    const { embedding: queryEmbedding } = await generateSingleEmbedding(query);

    // Validate embedding format
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      throw new Error("Invalid query embedding format");
    }

    // Search using Supabase's vector similarity
    let queryBuilder = supabaseAdmin.rpc(SUPABASE_CONFIG.matchFunction, {
      query_embedding: queryEmbedding, // Ensure this is a number[] array
      match_threshold: threshold,
      match_count: limit,
    });

    // Add document filter if specified
    if (documentFilter) {
      queryBuilder = queryBuilder.filter(
        "metadata->title",
        "eq",
        documentFilter
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Search error:", error);
      throw error;
    }

    const results = {
      chunks: (data || []).map((item: any) => ({
        content: item.content,
        metadata:
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata,
        similarity: item.similarity,
      })),
    };

    return results;
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
}

/**
 * Utility function to clear all embeddings (for testing)
 */
export async function clearAllEmbeddings(): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from(SUPABASE_CONFIG.tableName)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

    if (error) {
      console.error("Error clearing embeddings:", error);
      throw error;
    }

    console.log("All embeddings cleared successfully");
  } catch (error) {
    console.error("Error clearing embeddings:", error);
    throw error;
  }
}

/**
 * Advanced search with multiple options and result formatting
 */
export async function advancedSearch(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    documentFilter?: string;
    sectionFilter?: string;
    chunkTypeFilter?: string;
    includeMetadata?: boolean;
    formatCitations?: boolean;
  } = {}
) {
  const {
    limit = 10,
    threshold = 0.7,
    documentFilter,
    sectionFilter,
    chunkTypeFilter,
    includeMetadata = true,
    formatCitations = true,
  } = options;

  try {
    const { embedding: queryEmbedding } = await generateSingleEmbedding(query);

    // Use the advanced search function if available, otherwise fall back to basic
    const queryBuilder = supabaseAdmin.rpc("match_documents_advanced", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_metadata: (() => {
        const filters: any = {};
        if (documentFilter) filters.title = documentFilter;
        if (sectionFilter) filters.section = sectionFilter;
        if (chunkTypeFilter) filters.chunkType = chunkTypeFilter;
        return Object.keys(filters).length > 0 ? filters : {};
      })(),
    });

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Advanced search error:", error);
      throw error;
    }

    const results = (data || []).map((item: any) => {
      const metadata =
        typeof item.metadata === "string"
          ? JSON.parse(item.metadata)
          : item.metadata;

      const result: any = {
        content: item.content,
        similarity: item.similarity,
      };

      if (includeMetadata) {
        result.metadata = metadata;
      }

      if (formatCitations) {
        const title = metadata?.title || "Unknown Document";
        const section = metadata?.section || "";
        const subsection = metadata?.subsection || "";
        const url = metadata?.url || "";
        const anchor = metadata?.anchor || "";

        // Create citation text
        const sectionPath = [section, subsection].filter(Boolean).join(" > ");
        const citationText = sectionPath ? `${title} - ${sectionPath}` : title;
        const citationUrl = anchor ? `${url}${anchor}` : url;

        result.citation = {
          text: citationText,
          url: citationUrl,
          title: title,
          section: sectionPath,
        };
      }

      return result;
    });

    return {
      query,
      results,
      count: results.length,
      threshold,
    };
  } catch (error) {
    console.error("Error in advanced search:", error);
    throw error;
  }
}

/**
 * Search with automatic citation formatting for agent responses
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

  const searchResults = await advancedSearch(query, {
    limit,
    threshold,
    formatCitations: true,
    includeMetadata: true,
  });

  // Format results for agent consumption
  const formattedResults = searchResults.results.map((result, index) => {
    // Truncate content if too long
    let content = result.content;
    if (content.length > contextWindow) {
      content = content.substring(0, contextWindow) + "...";
    }

    return {
      index: index + 1,
      content,
      citation: result.citation,
      similarity: result.similarity,
      // Create a formatted citation for the agent to use
      citationText: `[${result.citation.text}](${result.citation.url})`,
      // Extract original content without context prefix if it exists
      originalContent: result.metadata?.originalContent || content,
    };
  });

  return {
    query,
    results: formattedResults,
    totalResults: searchResults.count,
    // Create a summary for the agent
    summary: {
      queryHandled: searchResults.count > 0,
      topSimilarity: formattedResults[0]?.similarity || 0,
      documentsFound: [
        ...new Set(formattedResults.map((r) => r.citation.title)),
      ].length,
      suggestedThreshold:
        searchResults.count === 0 ? Math.max(0.5, threshold - 0.1) : threshold,
    },
  };
}

// Export configuration for external use
export { EMBEDDING_CONFIG, SUPABASE_CONFIG };

// Additional utility function for testing with cost tracking
export async function analyzeEmbeddingCost(chunks: DocumentChunk[]) {
  const texts = chunks.map((chunk) => chunk.contextualContent);

  // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = texts.reduce(
    (total, text) => total + Math.ceil(text.length / 4),
    0
  );

  console.log(`Estimated tokens: ${estimatedTokens}`);
  console.log(
    `Estimated cost (text-embedding-3-small): ${(
      estimatedTokens * 0.00002
    ).toFixed(6)}`
  );

  return { estimatedTokens, estimatedCost: estimatedTokens * 0.00002 };
}

export async function testSearchDocuments(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
  } = {}
): Promise<
  Array<{
    content: string;
    metadata: any;
    similarity: number;
  }>
> {
  const { limit = 10, threshold = 0.1 } = options;

  // Generate embedding for query
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  console.log("Query embedding:", embedding);

  // Search using the embedding
  const { data, error } = await supabaseAdmin.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  console.log("Search data:", data);

  console.log("Search error:", error);

  if (error) throw error;

  // Return formatted results
  return (data || []).map((item: any) => ({
    content: item.content,
    metadata:
      typeof item.metadata === "string"
        ? JSON.parse(item.metadata)
        : item.metadata,
    similarity: item.similarity,
  }));
}
