import { NewsArticle } from "@/services/news";
import { Clock } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const publishedDate = new Date(article.first_seen).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const qualityColor =
    article.quality_score >= 0.7
      ? "bg-green-100 text-green-800"
      : article.quality_score >= 0.5
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";

  return (
    <article className="rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-secondary-foreground">
          {article.domain}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${qualityColor}`}>
          {Math.round(article.quality_score * 100)}%
        </span>
      </div>
      {/* Title */}

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold mb-2 text-primary line-clamp-2 inline-flex items-center transition-colors"
      >
        {article.title}
      </a>

      {/* Description */}
      {article.description && (
        <p className="text-sm mb-4 line-clamp-3">{article.description}</p>
      )}
      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={12} className="mr-1" />
          {publishedDate}
        </div>
      </div>
    </article>
  );
}
