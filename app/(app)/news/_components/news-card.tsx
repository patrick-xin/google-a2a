import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/services/news";
import { Clock } from "lucide-react";
import { memo } from "react"; // ✅ Memoize for better performance

interface NewsCardProps {
  article: NewsArticle;
}

// ✅ Memoize the component to prevent unnecessary re-renders
export const NewsCard = memo(function NewsCard({ article }: NewsCardProps) {
  // ✅ Improved: Better date formatting with error handling
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date unavailable";
      }

      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return "Date unavailable";
    }
  };

  const publishedDate = formatDate(article.first_seen);

  return (
    <article className="group rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 p-6 bg-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
          {article.domain}
        </span>
      </div>

      {/* Title */}
      <h2 className="mb-2">
        <Button
          variant={"link"}
          className="inline-block whitespace-pre-line px-0"
          asChild
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className=""
            aria-label={`Read article: ${article.title}`}
          >
            {article.title}
          </a>
        </Button>
      </h2>

      {/* Description */}
      {article.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-border/30">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock
            size={12}
            className="mr-1.5 flex-shrink-0"
            aria-hidden="true"
          />
          <time
            dateTime={article.first_seen}
            title={`Published: ${publishedDate}`}
          >
            {publishedDate}
          </time>
        </div>
      </div>
    </article>
  );
});

// ✅ Add display name for debugging
NewsCard.displayName = "NewsCard";
