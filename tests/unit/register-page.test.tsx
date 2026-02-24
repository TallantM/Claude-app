import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/(auth)/register/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/register",
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should render all registration form fields", () => {
    // Arrange + Act
    render(<RegisterPage />);

    // Assert
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it("should redirect to login after successful registration", async () => {
    // Arrange
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Act
    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "newuser@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Assert
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
    });
  });

  it("should show error alert when API returns an error", async () => {
    // Arrange
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Email already exists" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Act
    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "existing@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Assert
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Email already exists");
    });
  });

  it("should not navigate away if passwords do not match", async () => {
    // Arrange — mismatched passwords fail Zod validation before fetch
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Act
    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "different456");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Assert — router.push not called (stays on register)
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should not show error alert before form is submitted", () => {
    // Arrange + Act
    render(<RegisterPage />);

    // Assert
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
