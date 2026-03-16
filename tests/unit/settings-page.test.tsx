import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/(app)/settings/page";

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

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "u1",
        name: "Test User",
        email: "test@example.com",
        role: "developer",
      },
    },
    status: "authenticated",
    update: vi.fn(),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page heading 'Settings'", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
  });

  it("renders Profile, Appearance, and Security tabs", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("tab", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /security/i })).toBeInTheDocument();
  });

  it("Profile tab is active by default showing profile name input", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("profile-name-input")).toBeInTheDocument();
  });

  it("profile name input shows user's name from session", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      const input = screen.getByTestId("profile-name-input") as HTMLInputElement;
      expect(input.value).toBe("Test User");
    });
  });

  it("email field is disabled with helper text", () => {
    render(<SettingsPage />);
    const emailInput = screen.getByDisplayValue("test@example.com") as HTMLInputElement;
    expect(emailInput).toBeDisabled();
    expect(screen.getByText("Email cannot be changed")).toBeInTheDocument();
  });

  it("Save Changes button is present in Profile tab", () => {
    render(<SettingsPage />);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("switching to Appearance tab shows theme picker", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /appearance/i }));

    await waitFor(() => {
      expect(screen.getByText("Light")).toBeInTheDocument();
    });
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("switching to Security tab shows password fields", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /security/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
  });

  it("Update Password button is present in Security tab", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("tab", { name: /security/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
    });
  });

  it("profile name input is editable", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const input = screen.getByTestId("profile-name-input") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "New Name");

    expect(input.value).toBe("New Name");
  });
});
