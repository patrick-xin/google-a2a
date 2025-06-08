import { Suspense } from "react";
import { unstable_cache as cache } from "next/cache";
import { NewsGrid } from "../news/_components/news-grid";
import { NewsFilters } from "../news/_components/news-filters";
import { NewsSkeleton } from "../news/_components/news-skeleton";
import { getAvailableDomains, getNewsFeed } from "@/services/news";

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

interface NewsPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    domain?: string;
  }>;
}

export default async function NewsPage(props: NewsPageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const sort =
    (searchParams.sort as "relevance" | "recent" | "quality") || "relevance";
  const domain = searchParams.domain;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Latest News on A2A Protocol
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest developments in Google&lsquo;s
            Agent-to-Agent Protocol
          </p>
        </div>

        {/* Filters - Can be cached separately */}
        <Suspense
          fallback={<div className="h-16 rounded-lg animate-pulse mb-6" />}
        >
          <FiltersSection />
        </Suspense>

        {/* News Content */}
        <Suspense fallback={<NewsSkeleton />}>
          <NewsSection page={page} sort={sort} domain={domain} />
        </Suspense>
      </div>
    </div>
  );
}

// Separate component for filters (can be cached independently)
async function FiltersSection() {
  const domains = await getCachedDomains();
  return <NewsFilters availableDomains={domains} />;
}

// Separate component for news content
async function NewsSection({
  page,
  sort,
  domain,
}: {
  page: number;
  sort?: "relevance" | "recent" | "quality";
  domain?: string;
}) {
  const newsData = await getCachedNewsFeed(page, sort, domain);
  return <NewsGrid {...newsData} currentPage={page} />;
}

// Generate metadata
export async function generateMetadata(props: NewsPageProps) {
  const searchParams = await props.searchParams;
  const domain = searchParams.domain;
  const title = domain
    ? `A2A Protocol News from ${domain}`
    : "Latest A2A Protocol News";

  return {
    title,
    description:
      "Stay updated with the latest developments in Google's Agent-to-Agent Protocol",
  };
}
