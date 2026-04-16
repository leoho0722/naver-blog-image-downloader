import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
  Link: ({ children, ...props }: { children: React.ReactNode; to: string }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("../../../lib/stores/use-settings-store", () => ({
  useSettingsStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state = {
      theme: "system",
      locale: "zh-TW",
      updateTheme: vi.fn(),
      updateLocale: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

describe("RootLayout", () => {
  it("displays version string in v<semver> format", async () => {
    const { default: RootLayout } =
      await import("../../../components/layout/RootLayout");
    render(<RootLayout />);

    const versionText = screen.getByText(/^v\d+\.\d+\.\d+$/);
    expect(versionText).toBeInTheDocument();
  });
});
