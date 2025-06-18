import { NewsPagination } from "./news-pagination";
import { NewsCard } from "./news-card";
import { NewsArticle } from "@/services/news";

export function NewsGrid({
  articles,
  totalCount,
  hasMore,
  currentPage,
}: {
  articles: NewsArticle[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">
          No articles found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {articles.length} of {totalCount} articles
        </p>
        <div className="text-sm text-muted-foreground">Page {currentPage}</div>
      </div>

      {/* Articles grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      <NewsPagination
        currentPage={currentPage}
        hasMore={hasMore}
        totalCount={totalCount}
      />
    </div>
  );
}
