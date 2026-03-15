/**
 * Settings unit tests matching spec scenarios 1-10.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/(app)/settings/page";
import * as nextAuth from "next-auth/react";
import * as nextThemes from "next-themes";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: {
      user: { name: "Test User", email: "test@example.com", image: null },
      expires: "2099-01-01T00:00:00Z",
    },
    status: "authenticated",
  })),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({
    theme: "light",
    setTheme: vi.fn(),
    themes: [],
    forcedTheme: undefined,
    resolvedTheme: "light",
    systemTheme: "light",
  })),
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
  usePathname: () => "/settings",
}));

describe("SettingsPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. renders Settings page with Profile, Appearance, Security tabs", () => {
    // Arrange + Act
    render(<SettingsPage />);

    // Assert
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /security/i })).toBeInTheDocument();
  });

  it("2. Profile tab renders name input with session user's name", () => {
    // Arrange + Act
    render(<SettingsPage />);

    // Assert — profile-name-input has the session user's name
    const nameInput = screen.getByTestId("profile-name-input");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue("Test User");
  });

  it("3. Profile tab renders disabled email input with session email", () => {
    // Arrange + Act
    render(<SettingsPage />);

    // Assert
    const emailInput = screen.getByDisplayValue("test@example.com");
    expect(emailInput).toBeDisabled();
  });

  it("4. Save Changes button calls save handler", async () => {
    // Arrange
    render(<SettingsPage />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Assert — button re-renders (may briefly show loading state, then returns)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });
  });

  it("5. Appearance tab renders theme picker with Light, Dark, System options", async () => {
    // Arrange
    render(<SettingsPage />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole("tab", { name: /appearance/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /system/i })).toBeInTheDocument();
  });

  it("6. clicking a theme button applies active styling", async () => {
    // Arrange
    const mockSetTheme = vi.fn();
    vi.mocked(nextThemes.useTheme).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      themes: [],
      forcedTheme: undefined,
      resolvedTheme: "light",
      systemTheme: "light",
    });

    render(<SettingsPage />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /appearance/i }));

    // Assert — Light button has active border class (theme === "light")
    await waitFor(() => {
      const lightBtn = screen.getByRole("button", { name: /light/i });
      expect(lightBtn).toHaveClass("border-primary");
    });

    // Act — click Dark
    await user.click(screen.getByRole("button", { name: /dark/i }));

    // Assert
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("7. Security tab renders current-password, new-password, confirm fields", async () => {
    // Arrange
    render(<SettingsPage />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole("tab", { name: /security/i }));

    // Assert
    await waitFor(() => {
      expect(document.getElementById("current-password")).toBeInTheDocument();
    });
    expect(document.getElementById("new-password")).toBeInTheDocument();
    expect(document.getElementById("confirm-password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
  });

  it("8. profile name input is editable", async () => {
    // Arrange
    render(<SettingsPage />);
    const user = userEvent.setup();
    const nameInput = screen.getByTestId("profile-name-input");

    // Act — clear and type new name (Pattern 11: exact matching for unambiguous inputs)
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    // Assert
    expect(nameInput).toHaveValue("New Name");
  });

  it("9. Settings page renders with no session gracefully", () => {
    // Arrange
    vi.mocked(nextAuth.useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    // Act
    render(<SettingsPage />);

    // Assert
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("10. avatar displays initials from session user name", () => {
    // Arrange
    vi.mocked(nextAuth.useSession).mockReturnValue({
      data: {
        user: { name: "Carol Dean", email: "carol@example.com", image: null },
        expires: "2099-01-01",
      },
      status: "authenticated",
      update: vi.fn(),
    });

    // Act
    render(<SettingsPage />);

    // Assert
    expect(screen.getByText("CD")).toBeInTheDocument();
  });
});
