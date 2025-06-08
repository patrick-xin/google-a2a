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

  // ✅ Improved: More nuanced quality indicators
  const getQualityInfo = (score: number) => {
    if (score >= 0.8) {
      return {
        color:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
        label: "High Quality",
        percentage: Math.round(score * 100),
      };
    } else if (score >= 0.6) {
      return {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        label: "Good Quality",
        percentage: Math.round(score * 100),
      };
    } else if (score >= 0.4) {
      return {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        label: "Fair Quality",
        percentage: Math.round(score * 100),
      };
    } else {
      return {
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        label: "Basic",
        percentage: Math.round(score * 100),
      };
    }
  };

  const qualityInfo = getQualityInfo(article.quality_score);

  return (
    <article className="group rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 p-6 bg-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
          {article.domain}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${qualityInfo.color}`}
          title={`${qualityInfo.label} - ${qualityInfo.percentage}% quality score`}
          aria-label={`Quality score: ${qualityInfo.percentage}%`}
        >
          {qualityInfo.percentage}%
        </span>
      </div>

      {/* Title */}
      <h2 className="mb-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          aria-label={`Read article: ${article.title}`}
        >
          {article.title}
        </a>
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
