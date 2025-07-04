import { Suspense } from "react";
import { NewsSkeleton } from "./_components/news-skeleton";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import FiltersSection from "./_components/filter";
import NewsSection from "./_components/news";

// ✅ Improved: Better type safety for searchParams
type SearchParams = {
  page?: string;
  sort?: string;
  domain?: string;
};

interface NewsPageProps {
  searchParams: Promise<SearchParams>;
}

// ✅ Improved: Add input validation
function validateAndParseSearchParams(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page || "1"));
  const sort = ["relevance", "recent", "quality"].includes(params.sort || "")
    ? (params.sort as "relevance" | "recent" | "quality")
    : "relevance";
  const domain = params.domain || undefined;

  // Validate page isn't unreasonably high
  if (page > 1000) {
    notFound();
  }

  return { page, sort, domain };
}

export default async function NewsPage(props: NewsPageProps) {
  const searchParams = await props.searchParams;
  const { page, sort, domain } = validateAndParseSearchParams(searchParams);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Latest News on A2A Protocol
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest developments in Google&apos;s
            Agent-to-Agent Protocol
          </p>
        </header>

        <Suspense fallback={<FiltersSkeleton />}>
          <FiltersSection />
        </Suspense>

        <Suspense
          key={page + sort + domain}
          fallback={<NewsSkeleton articleCount={12} />}
        >
          <NewsSection page={page} sort={sort} domain={domain} />
        </Suspense>
      </div>
    </div>
  );
}

// ✅ New: Dedicated loading component for filters
function FiltersSkeleton() {
  return (
    <div className="rounded-lg p-4 mb-6 animate-pulse">
      <div className="flex flex-wrap gap-4 items-center">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-48" />
      </div>
    </div>
  );
}

// ✅ Improved: Better metadata generation with error handling
export async function generateMetadata(props: NewsPageProps) {
  try {
    const searchParams = await props.searchParams;
    const domain = searchParams.domain;

    const title = domain
      ? `A2A Protocol News from ${domain} | Your App Name`
      : "Latest A2A Protocol News | Your App Name";

    const description = domain
      ? `Latest A2A Protocol news and updates from ${domain}. Stay informed about Google's Agent-to-Agent Protocol developments.`
      : "Stay updated with the latest developments in Google's Agent-to-Agent Protocol. Breaking news, updates, and analysis.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      // ✅ Add canonical URL
      alternates: {
        canonical: domain ? `/news?domain=${domain}` : "/news",
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {
      title: "Latest A2A Protocol News",
      description:
        "Stay updated with the latest developments in Google's Agent-to-Agent Protocol",
    };
  }
}

// ✅ Add static generation hint (optional)
export const dynamic = "force-dynamic"; // Since we rely on searchParams
export const revalidate = 300; // 5 minutes
