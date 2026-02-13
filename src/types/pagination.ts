// ─── Pagination Types ─────────────────────────────────────

/** The page number and size needed to fetch a slice of results. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Metadata returned alongside paginated data so the UI can render page controls. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Standard envelope for any paginated API response. */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── Pagination Constants ─────────────────────────────────

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
} as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
