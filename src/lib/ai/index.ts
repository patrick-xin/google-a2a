import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const completionModel = openrouter.chat(
  "deepseek/deepseek-chat-v3-0324:free",
  {}
);
