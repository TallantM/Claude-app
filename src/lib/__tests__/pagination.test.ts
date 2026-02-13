// Tests for the server-side pagination utilities shared by all paginated API routes.

import { describe, it, expect } from "vitest";
import {
  parsePaginationParams,
  getPrismaPageArgs,
  buildPaginatedResponse,
} from "@/lib/pagination";

// ─── Query String Parsing ───

describe("parsePaginationParams", () => {
  it("returns defaults when no params provided", () => {
    const sp = new URLSearchParams();
    expect(parsePaginationParams(sp)).toEqual({ page: 1, pageSize: 20 });
  });

  it("parses valid page and pageSize", () => {
    const sp = new URLSearchParams({ page: "3", pageSize: "50" });
    expect(parsePaginationParams(sp)).toEqual({ page: 3, pageSize: 50 });
  });

  it("clamps page to 1 when negative or zero", () => {
    expect(parsePaginationParams(new URLSearchParams({ page: "0" }))).toMatchObject({ page: 1 });
    expect(parsePaginationParams(new URLSearchParams({ page: "-5" }))).toMatchObject({ page: 1 });
  });

  it("clamps pageSize to maxPageSize", () => {
    const sp = new URLSearchParams({ pageSize: "500" });
    expect(parsePaginationParams(sp)).toMatchObject({ pageSize: 100 });
  });

  it("clamps pageSize to 1 minimum when zero or negative", () => {
    expect(parsePaginationParams(new URLSearchParams({ pageSize: "0" }))).toMatchObject({ pageSize: 20 });
    expect(parsePaginationParams(new URLSearchParams({ pageSize: "-10" }))).toMatchObject({ pageSize: 20 });
  });

  it("handles non-numeric values gracefully", () => {
    const sp = new URLSearchParams({ page: "abc", pageSize: "xyz" });
    expect(parsePaginationParams(sp)).toEqual({ page: 1, pageSize: 20 });
  });

  it("handles partial params", () => {
    const sp = new URLSearchParams({ page: "5" });
    expect(parsePaginationParams(sp)).toEqual({ page: 5, pageSize: 20 });
  });
});

// ─── Prisma Skip/Take Conversion ───

describe("getPrismaPageArgs", () => {
  it("returns skip 0, take 20 for page 1 pageSize 20", () => {
    expect(getPrismaPageArgs({ page: 1, pageSize: 20 })).toEqual({
      skip: 0,
      take: 20,
    });
  });

  it("calculates correct skip for page 3 pageSize 10", () => {
    expect(getPrismaPageArgs({ page: 3, pageSize: 10 })).toEqual({
      skip: 20,
      take: 10,
    });
  });

  it("calculates correct skip for page 2 pageSize 50", () => {
    expect(getPrismaPageArgs({ page: 2, pageSize: 50 })).toEqual({
      skip: 50,
      take: 50,
    });
  });

  it("handles page 1 pageSize 1", () => {
    expect(getPrismaPageArgs({ page: 1, pageSize: 1 })).toEqual({
      skip: 0,
      take: 1,
    });
  });
});

// ─── Response Builder ───

describe("buildPaginatedResponse", () => {
  it("wraps data with correct pagination meta", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = buildPaginatedResponse(data, 47, { page: 1, pageSize: 20 });

    expect(result).toEqual({
      data,
      pagination: {
        page: 1,
        pageSize: 20,
        total: 47,
        totalPages: 3,
      },
    });
  });

  it("calculates totalPages correctly for exact division", () => {
    const result = buildPaginatedResponse([], 100, { page: 1, pageSize: 10 });
    expect(result.pagination.totalPages).toBe(10);
  });

  it("calculates totalPages correctly with remainder", () => {
    const result = buildPaginatedResponse([], 101, { page: 1, pageSize: 10 });
    expect(result.pagination.totalPages).toBe(11);
  });

  it("returns totalPages 0 for empty dataset", () => {
    const result = buildPaginatedResponse([], 0, { page: 1, pageSize: 20 });
    expect(result.pagination.totalPages).toBe(0);
  });

  it("preserves the data array as-is", () => {
    const data = [{ name: "Alice" }, { name: "Bob" }];
    const result = buildPaginatedResponse(data, 2, { page: 1, pageSize: 20 });
    expect(result.data).toBe(data);
  });

  it("uses provided params in the response", () => {
    const result = buildPaginatedResponse([], 50, { page: 3, pageSize: 10 });
    expect(result.pagination.page).toBe(3);
    expect(result.pagination.pageSize).toBe(10);
  });
});
