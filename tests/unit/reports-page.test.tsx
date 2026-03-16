import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportsPage from "@/app/(app)/reports/page";

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

// Mock Chart.js and react-chartjs-2 — canvas not available in jsdom
vi.mock("react-chartjs-2", () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Bar: () => <canvas data-testid="bar-chart" />,
  Doughnut: () => <canvas data-testid="doughnut-chart" />,
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {},
  LinearScale: class {},
  PointElement: class {},
  LineElement: class {},
  BarElement: class {},
  ArcElement: class {},
  Title: class {},
  Tooltip: class {},
  Legend: class {},
  Filler: class {},
}));

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading 'Reports & Analytics'", () => {
    render(<ReportsPage />);
    expect(screen.getByRole("heading", { name: /Reports & Analytics/i })).toBeInTheDocument();
  });

  it("renders Sprint Burndown chart card", () => {
    render(<ReportsPage />);
    expect(screen.getByText("Sprint Burndown")).toBeInTheDocument();
  });

  it("renders Team Velocity chart card", () => {
    render(<ReportsPage />);
    expect(screen.getByText("Team Velocity")).toBeInTheDocument();
  });

  it("renders Issue Distribution chart card", () => {
    render(<ReportsPage />);
    expect(screen.getByText("Issue Distribution")).toBeInTheDocument();
  });

  it("renders Task Completion Trend chart card", () => {
    render(<ReportsPage />);
    expect(screen.getByText("Task Completion Trend")).toBeInTheDocument();
  });

  it("renders four Export buttons (one per chart)", () => {
    render(<ReportsPage />);
    const exportButtons = screen.getAllByRole("button", { name: /export/i });
    expect(exportButtons).toHaveLength(4);
  });

  it("renders chart canvas elements", () => {
    const { container } = render(<ReportsPage />);
    expect(container.querySelectorAll("canvas").length).toBeGreaterThan(0);
  });

  it("renders subtitle text describing the page purpose", () => {
    render(<ReportsPage />);
    expect(
      screen.getByText(/track your team.s performance and project health/i)
    ).toBeInTheDocument();
  });
});
