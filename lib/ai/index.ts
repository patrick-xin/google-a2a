import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const chatModel = openrouter.chat("anthropic/claude-3.5-sonnet");
export const completionModel = openrouter.chat("openai/gpt-4-turbo");
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export { searchDocuments, searchForAgent, SEARCH_CONFIG } from "./search";

export type {
  SearchOptions,
  SearchResult,
  FormattedSearchResult,
  SearchResponse,
} from "./search";

// Embedding functionality
export {
  embedDocument,
  generateEmbeddings,
  generateSingleEmbedding,
  analyzeEmbeddingCost,
  clearAllEmbeddings,
  EMBEDDING_CONFIG,
} from "./embedding";

export type {
  EmbeddingVector,
  EmbeddingResult,
  EmbeddingOptions,
} from "./embedding";

// Chunking functionality
export { chunkMDXDocument, analyzeChunking, CHUNKING_CONFIG } from "./chunking";

export type {
  DocumentMetadata,
  DocumentChunk,
  ChunkMetadata,
  ChunkingOptions,
} from "./chunking";
