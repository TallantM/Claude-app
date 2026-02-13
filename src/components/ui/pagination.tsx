"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/pagination";
import { PAGE_SIZE_OPTIONS } from "@/types/pagination";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
  showPageSize?: boolean;
  showSummary?: boolean;
}

/**
 * Build array of page numbers to display with ellipsis gaps.
 * Always shows first, last, and a window around current page.
 */
function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  // Always include page 1
  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  // Window around current page
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  // Always include last page
  pages.push(total);

  return pages;
}

/**
 * Full-featured pagination bar with page numbers, first/last/prev/next buttons,
 * an optional page-size selector, and a responsive mobile layout.
 */
export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  className,
  showPageSize = true,
  showSummary = true,
}: PaginationProps) {
  const { page, pageSize, total, totalPages } = pagination;

  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Summary */}
      {showSummary && (
        <p className="text-sm text-muted-foreground">
          Showing {start}-{end} of {total}
        </p>
      )}

      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Rows per page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex items-center gap-1"
          aria-label="Pagination navigation"
        >
          {/* First page */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers — hidden on mobile, replaced by compact text */}
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((p, idx) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onPageChange(p)}
                  aria-label={`Go to page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            )}
          </div>

          {/* Mobile compact page indicator */}
          <span className="sm:hidden text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>

          {/* Next page */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
