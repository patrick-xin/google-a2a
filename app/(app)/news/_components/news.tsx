import { getNewsFeed, GetNewsFeedParams } from "@/services/news";
import { NewsGrid } from "./news-grid";

const NewsSection = async ({ page, sort, domain }: GetNewsFeedParams) => {
  const newsData = await getNewsFeed({ page, sort, domain });

  if (!newsData || newsData.articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No articles found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return <NewsGrid {...newsData} currentPage={page ?? 1} />;
};

export default NewsSection;
