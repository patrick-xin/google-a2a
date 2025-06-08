"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

  const currentSort = searchParams.get("sort") || "relevance";
  const currentDomain = searchParams.get("domain") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || value === "relevance") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/news?${params.toString()}`);
  };

  return (
    <div className="rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <Select
            value={currentSort}
            onValueChange={(value) => updateFilter("sort", value)}
          >
            <SelectTrigger className="w-32">
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
          <label className="text-sm font-medium">Source:</label>
          <Select
            value={currentDomain}
            onValueChange={(value) => updateFilter("domain", value)}
          >
            <SelectTrigger className="w-48">
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
      </div>
    </div>
  );
}
