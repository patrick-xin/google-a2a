import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NewsSkeletonProps {
  className?: string;
  articleCount?: number;
}

export function NewsSkeleton({
  className,
  articleCount = 6,
}: NewsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters skeleton */}
      <div className="bg-card rounded-xl border border-border/40 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-9 w-36 bg-muted" />
          <Skeleton className="h-9 w-52 bg-muted" />
          <Skeleton className="h-9 w-28 bg-muted" />
        </div>
      </div>

      {/* Articles grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: articleCount }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="group bg-card rounded-xl border border-border/40 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-border/60 backdrop-blur-sm">
      {/* Header with category and date */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24 bg-muted rounded-full" />
        <Skeleton className="h-4 w-16 bg-muted/60 rounded-full" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-6 w-full bg-muted" />
        <Skeleton className="h-6 w-4/5 bg-muted" />
      </div>

      {/* Content preview skeleton */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-3 w-full bg-muted/80" />
        <Skeleton className="h-3 w-5/6 bg-muted/80" />
        <Skeleton className="h-3 w-3/4 bg-muted/80" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 bg-muted rounded-full" />
          <Skeleton className="h-4 w-20 bg-muted/60" />
        </div>
        <Skeleton className="h-4 w-12 bg-muted/60 rounded-full" />
      </div>
    </div>
  );
}

// Alternative compact version
export function CompactNewsSkeleton({
  className,
  articleCount = 8,
}: NewsSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters skeleton */}
      <div className="bg-card rounded-lg border border-border/40 p-4">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-28 bg-muted" />
          <Skeleton className="h-8 w-40 bg-muted" />
          <Skeleton className="h-8 w-24 bg-muted" />
        </div>
      </div>

      {/* Compact articles list */}
      <div className="space-y-3">
        {Array.from({ length: articleCount }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg border border-border/40 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex gap-4">
              {/* Image skeleton */}
              <Skeleton className="h-16 w-24 bg-muted rounded-lg flex-shrink-0" />

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16 bg-muted/60 rounded-full" />
                  <Skeleton className="h-3 w-12 bg-muted/40 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-20 bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
