import { chatModel, searchForAgent } from "@/lib/ai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: chatModel,
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

          // Extract and format the content for the AI
          if (result.results && result.results.length > 0) {
            const formattedResults = result.results.map((item) => ({
              content: item.content,
              source: item.citation?.text || "Unknown source",
              url: item.citation?.url || "",
            }));

            return {
              found: true,
              query: query,
              results: formattedResults,
            };
          }

          return {
            found: false,
            query: query,
            message: "No relevant information found",
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
