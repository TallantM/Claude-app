"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PaginationMeta } from "@/types/pagination";
import { PAGINATION_DEFAULTS } from "@/types/pagination";

interface UsePaginationOptions {
  /** API endpoint URL (e.g. "/api/issues") */
  url: string;
  /** Initial page size (defaults to PAGINATION_DEFAULTS.pageSize) */
  initialPageSize?: number;
  /** Key-value filter params appended to the URL. Values of "all" are skipped. */
  params?: Record<string, string | undefined>;
  /** Whether fetching is enabled (defaults to true) */
  enabled?: boolean;
}

interface UsePaginationReturn<T> {
  data: T[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

/**
 * Generic data-fetching hook with built-in pagination, filtering, and auto-refetch.
 * Handles loading/error state so page components don't have to wire that up manually.
 */
export function usePagination<T>(
  options: UsePaginationOptions
): UsePaginationReturn<T> {
  const {
    url,
    initialPageSize = PAGINATION_DEFAULTS.pageSize,
    params,
    enabled = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Track the serialised params so we can auto-reset page on filter change
  const paramsRef = useRef<string>("");

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.set("page", String(page));
      queryParams.set("pageSize", String(pageSize));

      // Append any extra filters, skipping "all" since that means "no filter"
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value && value !== "all") {
            queryParams.set(key, value);
          }
        }
      }

      const res = await fetch(`${url}?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);

      const json = await res.json();
      setData(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [url, page, pageSize, params, enabled]);

  // Bounce back to page 1 whenever filters change, so you don't land on an empty page
  useEffect(() => {
    const serialised = JSON.stringify(params ?? {});
    if (paramsRef.current && paramsRef.current !== serialised) {
      setPage(1);
    }
    paramsRef.current = serialised;
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Changing page size also resets to page 1 to avoid out-of-range pages
  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize: handleSetPageSize,
    refetch: fetchData,
  };
}
