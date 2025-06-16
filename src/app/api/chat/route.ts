import { searchForAgent } from "@/lib/ai/embedding-comparison-test";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    messages,
    maxSteps: 3,
    tools: {
      searchDocuments: tool({
        description: "Search the knowledge base for relevant information.",
        parameters: z.object({
          query: z.string().describe("The search query from user"),
        }),
        execute: async (params) => {
          const { query } = params;
          const result = await searchForAgent(query);
          return JSON.stringify(result.results);
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
