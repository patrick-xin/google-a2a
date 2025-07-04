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
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface NewsFiltersProps {
  availableDomains: string[];
}

export function NewsFilters({ availableDomains }: NewsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || "relevance";
  const currentDomain = searchParams.get("domain") || "all";

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

        const newUrl = params.toString()
          ? `/news?${params.toString()}`
          : "/news";
        router.replace(newUrl);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="py-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium" htmlFor="sort-select">
            Sort by:
          </Label>
          <Select
            value={currentSort}
            onValueChange={(value) => updateFilter("sort", value)}
            disabled={isPending}
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
          <Label className="text-sm font-medium" htmlFor="domain-select">
            Source:
          </Label>
          <Select
            value={currentDomain}
            onValueChange={(value) => updateFilter("domain", value)}
            disabled={isPending}
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
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
