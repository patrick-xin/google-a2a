"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewsPaginationProps {
  currentPage: number;
  hasMore: boolean;
  totalCount: number;
}

export function NewsPagination({
  currentPage,
  hasMore,
  totalCount,
}: NewsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/news?${params.toString()}`);
  };

  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft size={16} className="mr-1" />
        Previous
      </Button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={!hasMore}
      >
        Next
        <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  );
}
