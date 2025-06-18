import { embedMany, embed } from "ai";

import { supabaseAdmin } from "../supabase/admin";
import { chunkMDXDocument, type DocumentChunk } from "./chunking";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const EMBEDDING_CONFIG = {
  model: openai.embedding("text-embedding-3-small"),
  batchSize: 100,
  maxRetries: 2,
  tableName: "document_embeddings",
} as const;

// ========================================
// TYPES
// ========================================
export interface EmbeddingVector {
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
  usage?: { tokens: number };
}

export interface EmbeddingResult {
  documentMetadata: any;
  chunksProcessed: number;
  embeddingsGenerated: number;
  tokensUsed: number;
  skipped?: number;
}

export interface EmbeddingOptions {
  skipExisting?: boolean;
  validateEmbeddings?: boolean;
  baseUrl?: string;
}

// ========================================
// CORE EMBEDDING FUNCTIONS
// ========================================

/**
 * Generate embeddings for multiple text chunks
 */
export async function generateEmbeddings(
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
 * Generate single embedding
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
    const batchNumber = Math.floor(i / EMBEDDING_CONFIG.batchSize) + 1;
    const totalBatches = Math.ceil(chunks.length / EMBEDDING_CONFIG.batchSize);

    console.log(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} chunks)`
    );

    // Use contextual content for better embeddings
    const texts = batch.map((chunk) => chunk.contextualContent);

    try {
      const { embeddings, totalTokens } = await generateEmbeddings(texts);
      totalTokensUsed += totalTokens;

      // Combine chunks with their embeddings
      const batchResults: EmbeddingVector[] = batch.map((chunk, index) => ({
        embedding: embeddings[index],
        content: chunk.contextualContent,
        metadata: {
          ...chunk.metadata,
          originalContent: chunk.content,
          embedding_model: "text-embedding-3-small",
          processed_at: new Date().toISOString(),
        },
        usage: { tokens: Math.floor(totalTokens / batch.length) },
      }));

      results.push(...batchResults);
      console.log(
        `✅ Batch ${batchNumber} completed. Tokens used: ${totalTokens}`
      );

      // Rate limiting delay
      if (i + EMBEDDING_CONFIG.batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`❌ Error processing batch ${batchNumber}:`, error);
      throw error;
    }
  }

  console.log(`🎉 Total tokens used for embedding: ${totalTokensUsed}`);
  return results;
}

/**
 * Store embeddings in Supabase with validation
 */
async function storeEmbeddings(
  embeddingVectors: EmbeddingVector[]
): Promise<void> {
  try {
    const insertData = embeddingVectors.map((vector) => ({
      content: vector.content,
      metadata: vector.metadata,
      embedding: vector.embedding,
    }));

    // Validate embeddings before insertion
    const validData = insertData.filter((item) => {
      if (!Array.isArray(item.embedding) || item.embedding.length === 0) {
        console.warn("Skipping item with invalid embedding format");
        return false;
      }
      return true;
    });

    if (validData.length === 0) {
      throw new Error("No valid embeddings to store");
    }

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(validData.length / batchSize);

      const { error } = await supabaseAdmin
        .from(EMBEDDING_CONFIG.tableName)
        .insert(batch);

      if (error) {
        console.error(
          `❌ Supabase insertion error (batch ${batchNumber}):`,
          error
        );
        throw error;
      }

      console.log(
        `✅ Stored batch ${batchNumber}/${totalBatches} (${batch.length} items)`
      );
    }

    console.log(`🎉 Successfully stored ${validData.length} embeddings`);
  } catch (error) {
    console.error("❌ Error storing embeddings:", error);
    throw error;
  }
}

/**
 * Check for existing embeddings
 */
async function checkExistingEmbeddings(title: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from(EMBEDDING_CONFIG.tableName)
      .select("id", { count: "exact" })
      .eq("metadata->title", title);

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error("Error checking existing embeddings:", error);
    return 0;
  }
}

// ========================================
// PUBLIC API
// ========================================

/**
 * Main embedding pipeline for documents
 */
export async function embedDocument(
  content: string,
  options: EmbeddingOptions = {}
): Promise<EmbeddingResult> {
  const {
    skipExisting = false,
    validateEmbeddings = true,
    baseUrl = "https://google-a2a.vercel.app",
  } = options;

  console.log("🚀 Starting document embedding process...");

  try {
    // Step 1: Chunk the document
    console.log("📄 Chunking document...");
    const { metadata, chunks, headingStructure } = chunkMDXDocument(
      content,
      baseUrl
    );

    console.log(`📋 Document: ${metadata.title}`);
    console.log(`🔧 Generated ${chunks.length} chunks`);
    console.log(
      `📑 Heading structure: ${headingStructure.length} main sections`
    );

    // Step 2: Check for existing embeddings
    if (skipExisting) {
      console.log("🔍 Checking for existing embeddings...");
      const existingCount = await checkExistingEmbeddings(metadata.title);

      if (existingCount > 0) {
        console.log(`⏭️ Found ${existingCount} existing chunks, skipping...`);
        return {
          documentMetadata: metadata,
          chunksProcessed: 0,
          embeddingsGenerated: 0,
          tokensUsed: 0,
          skipped: existingCount,
        };
      }
    }

    // Step 3: Generate embeddings
    console.log("🔮 Generating embeddings...");
    const embeddingVectors = await processChunksInBatches(chunks);

    // Step 4: Validate embeddings
    if (validateEmbeddings) {
      console.log("✅ Validating embeddings...");
      const invalidCount = embeddingVectors.filter(
        (vector) =>
          !Array.isArray(vector.embedding) ||
          vector.embedding.length === 0 ||
          vector.embedding.some((val) => typeof val !== "number" || isNaN(val))
      ).length;

      if (invalidCount > 0) {
        throw new Error(`Generated ${invalidCount} invalid embeddings`);
      }
      console.log("✅ All embeddings validated successfully");
    }

    // Step 5: Store in Supabase
    console.log("💾 Storing embeddings in Supabase...");
    await storeEmbeddings(embeddingVectors);

    const totalTokens = embeddingVectors.reduce(
      (sum, vector) => sum + (vector.usage?.tokens || 0),
      0
    );

    console.log("🎉 Document embedding completed successfully!");
    return {
      documentMetadata: metadata,
      chunksProcessed: chunks.length,
      embeddingsGenerated: embeddingVectors.length,
      tokensUsed: totalTokens,
    };
  } catch (error) {
    console.error("❌ Error in embedding pipeline:", error);
    throw error;
  }
}

/**
 * Estimate embedding cost before processing
 */
export async function analyzeEmbeddingCost(chunks: DocumentChunk[]): Promise<{
  estimatedTokens: number;
  estimatedCost: number;
  chunkCount: number;
}> {
  const texts = chunks.map((chunk) => chunk.contextualContent);

  // Rough approximation: 1 token ≈ 4 characters
  const estimatedTokens = texts.reduce(
    (total, text) => total + Math.ceil(text.length / 4),
    0
  );

  const estimatedCost = estimatedTokens * 0.00002; // text-embedding-3-small pricing

  console.log(`📊 Embedding cost analysis:`);
  console.log(`   Chunks: ${chunks.length}`);
  console.log(`   Estimated tokens: ${estimatedTokens.toLocaleString()}`);
  console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);

  return {
    estimatedTokens,
    estimatedCost,
    chunkCount: chunks.length,
  };
}

/**
 * Clear all embeddings (utility function)
 */
export async function clearAllEmbeddings(): Promise<void> {
  try {
    console.log("🗑️ Clearing all embeddings...");

    const { error } = await supabaseAdmin
      .from(EMBEDDING_CONFIG.tableName)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) throw error;

    console.log("✅ All embeddings cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing embeddings:", error);
    throw error;
  }
}
