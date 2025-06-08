import { Suspense } from "react";
import { unstable_cache as cache } from "next/cache";
import { NewsGrid } from "./_components/news-grid";
import { NewsFilters } from "./_components/news-filters";
import { NewsSkeleton } from "./_components/news-skeleton";
import { getAvailableDomains, getNewsFeed } from "@/services/news";
import { notFound } from "next/navigation";

// Cache the news data for 5 minutes
const getCachedNewsFeed = cache(
  async (
    page: number,
    sort?: "relevance" | "recent" | "quality",
    domain?: string
  ) => {
    return await getNewsFeed({ page, sort, domain });
  },
  ["news-feed"],
  {
    revalidate: 300, // 5 minutes
    tags: ["news-feed"],
  }
);

const getCachedDomains = cache(
  async () => {
    return await getAvailableDomains();
  },
  ["news-domains"],
  {
    revalidate: 3600, // 1 hour
    tags: ["news-domains"],
  }
);

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

        {/* ✅ Improved: Better Suspense boundaries with fallback components */}
        <Suspense fallback={<FiltersSkeleton />}>
          <FiltersSection />
        </Suspense>

        {/* ✅ Improved: More specific loading state */}
        <Suspense fallback={<NewsSkeleton articleCount={12} />}>
          <NewsSection page={page} sort={sort} domain={domain} />
        </Suspense>
      </div>
    </div>
  );
}

// ✅ Improved: Error boundaries and better error handling
async function FiltersSection() {
  try {
    const domains = await getCachedDomains();
    return <NewsFilters availableDomains={domains} />;
  } catch (error) {
    console.error("Failed to load domains:", error);
    // ✅ Graceful fallback
    return <NewsFilters availableDomains={[]} />;
  }
}

// ✅ Improved: Better error handling and type safety
async function NewsSection({
  page,
  sort,
  domain,
}: {
  page: number;
  sort: "relevance" | "recent" | "quality";
  domain?: string;
}) {
  try {
    const newsData = await getCachedNewsFeed(page, sort, domain);

    // ✅ Handle empty results
    if (!newsData || newsData.articles.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later.
          </p>
        </div>
      );
    }

    return <NewsGrid {...newsData} currentPage={page} />;
  } catch (error) {
    console.error("Failed to load news:", error);
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Failed to load news
        </h3>
        <p className="text-gray-600">
          Please try refreshing the page or check back later.
        </p>
      </div>
    );
  }
}

// ✅ New: Dedicated loading component for filters
function FiltersSkeleton() {
  return (
    <div className="rounded-lg p-4 mb-6 animate-pulse">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="h-9 w-32 bg-gray-200 rounded"></div>
        <div className="h-9 w-48 bg-gray-200 rounded"></div>
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
