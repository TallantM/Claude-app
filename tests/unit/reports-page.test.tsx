/**
 * Reports unit tests matching spec scenarios 1-10.
 * Reports page uses chart.js — we mock the chart components.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportsPage from "@/app/(app)/reports/page";

// Mock chart.js components to avoid canvas rendering issues in jsdom
vi.mock("react-chartjs-2", () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Bar: () => <canvas data-testid="bar-chart" />,
  Doughnut: () => <canvas data-testid="doughnut-chart" />,
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  ArcElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/reports",
}));

describe("ReportsPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. renders Reports page heading", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByRole("heading", { name: /reports & analytics/i })).toBeInTheDocument();
  });

  it("2. renders Sprint Burndown chart card", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByText("Sprint Burndown")).toBeInTheDocument();
    expect(screen.getByText("Track remaining work in the current sprint")).toBeInTheDocument();
  });

  it("3. renders Team Velocity chart card", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByText("Team Velocity")).toBeInTheDocument();
    expect(screen.getByText("Story points completed per sprint")).toBeInTheDocument();
  });

  it("4. renders Issue Distribution chart card", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByText("Issue Distribution")).toBeInTheDocument();
    expect(screen.getByText("Issues categorized by severity")).toBeInTheDocument();
  });

  it("5. renders Task Completion Trend chart card", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByText("Task Completion Trend")).toBeInTheDocument();
    expect(screen.getByText("Monthly task creation vs completion")).toBeInTheDocument();
  });

  it("6. all four Export buttons are rendered", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    const exportButtons = screen.getAllByRole("button", { name: /export/i });
    expect(exportButtons).toHaveLength(4);
  });

  it("7. clicking Export button triggers the alert (placeholder)", async () => {
    // Arrange
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ReportsPage />);

    // Act
    await user.click(screen.getAllByRole("button", { name: /export/i })[0]);

    // Assert
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Exporting"));
    alertSpy.mockRestore();
  });

  it("8. page renders without any API calls (static mock data)", () => {
    // Arrange
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    // Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByText("Reports & Analytics")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("9. chart container divs have height class for canvas rendering", () => {
    // Arrange + Act
    const { container } = render(<ReportsPage />);

    // Assert — div.h-[300px] elements are present
    const chartContainers = container.querySelectorAll('.h-\\[300px\\]');
    expect(chartContainers.length).toBeGreaterThan(0);
  });

  it("10. page subtitle is visible", () => {
    // Arrange + Act
    render(<ReportsPage />);

    // Assert
    expect(screen.getByText(/track your team's performance and project health/i)).toBeInTheDocument();
  });
});
