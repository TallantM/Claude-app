import type { PaginationParams, PaginatedResponse } from "@/types/pagination";
import { PAGINATION_DEFAULTS } from "@/types/pagination";

/**
 * Parse page and pageSize from URL query params.
 * Clamps values to safe ranges and falls back to defaults if the input is garbage.
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  const rawPage = parseInt(searchParams.get("page") ?? "", 10);
  const rawPageSize = parseInt(searchParams.get("pageSize") ?? "", 10);

  const page = Number.isFinite(rawPage) && rawPage >= 1
    ? rawPage
    : PAGINATION_DEFAULTS.page;

  const pageSize = Number.isFinite(rawPageSize) && rawPageSize >= 1
    ? Math.min(rawPageSize, PAGINATION_DEFAULTS.maxPageSize)
    : PAGINATION_DEFAULTS.pageSize;

  return { page, pageSize };
}

/**
 * Convert pagination params to Prisma-compatible skip/take arguments.
 */
export function getPrismaPageArgs(params: PaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: (params.page - 1) * params.pageSize, // zero-indexed offset for Prisma
    take: params.pageSize,
  };
}

/**
 * Wrap query results in the standard paginated response envelope.
 * Automatically calculates totalPages from the count and page size.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  };
}
