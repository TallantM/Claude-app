import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatRelativeTime,
  generateKey,
  getInitials,
  getStatusColor,
  getPriorityColor,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2025-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-06-01"));
    expect(result).toContain("Jun");
    expect(result).toContain("1");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for recent dates", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });
});

describe("generateKey", () => {
  it("generates uppercase key from name", () => {
    expect(generateKey("My Project")).toBe("MYPROJ");
  });

  it("strips non-alphanumeric characters", () => {
    expect(generateKey("Hello World!")).toBe("HELLOW");
  });

  it("limits to 6 characters", () => {
    expect(generateKey("Very Long Project Name")).toBe("VERYLO");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for one name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("limits to 2 characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });
});

describe("getStatusColor", () => {
  it("returns correct color for todo", () => {
    expect(getStatusColor("todo")).toContain("gray");
  });

  it("returns correct color for in_progress", () => {
    expect(getStatusColor("in_progress")).toContain("blue");
  });

  it("returns correct color for done", () => {
    expect(getStatusColor("done")).toContain("green");
  });

  it("returns default color for unknown status", () => {
    expect(getStatusColor("unknown")).toContain("gray");
  });
});

describe("getPriorityColor", () => {
  it("returns green for low priority", () => {
    expect(getPriorityColor("low")).toContain("green");
  });

  it("returns red for critical priority", () => {
    expect(getPriorityColor("critical")).toContain("red");
  });
});
