"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react"; // ✅ Add useTransition for better UX
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsFiltersProps {
  availableDomains: string[];
}

export function NewsFilters({ availableDomains }: NewsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // ✅ Better loading states

  const currentSort = searchParams.get("sort") || "relevance";
  const currentDomain = searchParams.get("domain") || "all";

  // ✅ Improved: Memoize the update function
  const updateFilter = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);

        if (value === "all" || value === "relevance") {
          params.delete(key);
        } else {
          params.set(key, value);
        }

        params.delete("page"); // Reset to page 1 when filtering

        // ✅ Improved: Use replace for filter changes to avoid cluttering history
        const newUrl = params.toString()
          ? `/news?${params.toString()}`
          : "/news";
        router.replace(newUrl);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="rounded-lg p-4 mb-6 border bg-card">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium"
            htmlFor="sort-select" // ✅ Better accessibility
          >
            Sort by:
          </label>
          <Select
            value={currentSort}
            onValueChange={(value) => updateFilter("sort", value)}
            disabled={isPending} // ✅ Disable during transitions
          >
            <SelectTrigger
              className="w-32"
              id="sort-select"
              aria-label="Sort articles by"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium"
            htmlFor="domain-select" // ✅ Better accessibility
          >
            Source:
          </label>
          <Select
            value={currentDomain}
            onValueChange={(value) => updateFilter("domain", value)}
            disabled={isPending} // ✅ Disable during transitions
          >
            <SelectTrigger
              className="w-48"
              id="domain-select"
              aria-label="Filter by news source"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {availableDomains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ✅ Add loading indicator */}
        {isPending && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}
