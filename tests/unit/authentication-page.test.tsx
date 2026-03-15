import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. renders login form with email, password fields and Sign in button", () => {
    // Arrange + Act
    render(<LoginPage />);

    // Assert
    expect(document.getElementById("email")).toBeInTheDocument();
    expect(document.getElementById("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("2. submits credentials to signIn with correct arguments", async () => {
    // Arrange
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText("Email"), "tester@sdlchub.com");
    await user.type(screen.getByLabelText("Password"), "test1234");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "tester@sdlchub.com",
        password: "test1234",
      });
    });
  });

  it("3. shows \"Invalid email or password\" when signIn returns an error", async () => {
    // Arrange
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText("Email"), "tester@sdlchub.com");
    await user.type(screen.getByLabelText("Password"), "test1234");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    await waitFor(() => {
      const alert = document.querySelector('[role="alert"]:not(#__next-route-announcer__)');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Invalid email or password");
    });
  });

  it("4. redirects to /dashboard and calls router.refresh on success", async () => {
    // Arrange
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText("Email"), "tester@sdlchub.com");
    await user.type(screen.getByLabelText("Password"), "test1234");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("5. disables submit button and shows spinner while login is in progress", async () => {
    // Arrange
    mockSignIn.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginPage />);

    // Act
    await user.type(screen.getByLabelText("Email"), "tester@sdlchub.com");
    await user.type(screen.getByLabelText("Password"), "test1234");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    // Loader2 spinner is rendered as an SVG with animate-spin class
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("6. renders register form with name, email, password, confirmPassword fields", () => {
    // Arrange + Act
    render(<RegisterPage />);

    // Assert
    expect(document.getElementById("name")).toBeInTheDocument();
    expect(document.getElementById("email")).toBeInTheDocument();
    expect(document.getElementById("password")).toBeInTheDocument();
    expect(document.getElementById("confirmPassword")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("7. calls POST /api/auth/register with correct body on valid submission", async () => {
    // Arrange
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
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
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("newuser@example.com"),
        })
      );
    });
  });

  it("8. redirects to /login?registered=true after successful registration", async () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Act
    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "newuser2@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.type(screen.getByLabelText("Confirm Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Assert
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
    });
  });

  it("9. shows server error message when registration API returns error", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Email already in use" }),
      })
    );
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
      const alert = document.querySelector('[role="alert"]:not(#__next-route-announcer__)');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Email already in use");
    });
  });

  it("10. shows register link on login page and login link on register page", () => {
    // Arrange + Act (login page)
    const { unmount } = render(<LoginPage />);
    // Assert
    expect(document.querySelector('a[href="/register"]')).toBeInTheDocument();
    unmount();

    // Arrange + Act (register page)
    render(<RegisterPage />);
    // Assert
    expect(document.querySelector('a[href="/login"]')).toBeInTheDocument();
  });
});
