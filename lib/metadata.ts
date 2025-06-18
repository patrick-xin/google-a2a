import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "https://google-a2a.vercel.app",
      images: "/banner.png",
      siteName: "A2A",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@money_is_shark",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "/banner.png",
      ...override.twitter,
    },
    alternates: {
      types: {
        "application/rss+xml": [
          {
            title: "A2A Blog",
            url: "https://fumadocs.dev/blog/rss.xml",
          },
        ],
      },
      ...override.alternates,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_BASE_URL
    ? new URL("http://localhost:3000")
    : new URL(`https://${process.env.NEXT_PUBLIC_BASE_URL}`);
