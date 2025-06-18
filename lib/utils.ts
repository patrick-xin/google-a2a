import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const env = {
  // Required environment variables
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,

  // Supabase environment variables
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // Optional environment variables with defaults
  NODE_ENV: process.env.NODE_ENV || "development",
  MODEL_NAME: process.env.MODEL_NAME || "openai/gpt-4o-mini",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Deployment-specific
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  PORT: process.env.PORT || "3000",
} as const;

/**
 * Gets the base URL for the application
 */
export function getBaseUrl(req?: Request): string {
  // In production on Vercel
  if (env.NEXT_PUBLIC_BASE_URL) {
    return `https://${env.NEXT_PUBLIC_BASE_URL}`;
  }

  // From request URL
  if (req) {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  }

  // Fallback for development
  return `http://localhost:${env.PORT}`;
}
