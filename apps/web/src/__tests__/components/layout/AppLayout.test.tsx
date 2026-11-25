import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet" />,
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
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

describe("AppLayout", () => {
  it("顯示版本字串為 v<semver>", async () => {
    const { default: AppLayout } =
      await import("../../../components/layout/AppLayout");
    render(<AppLayout />);

    const versionText = screen.getByText(/^v\d+\.\d+\.\d+$/);
    expect(versionText).toBeInTheDocument();
  });

  it("header brand link 指向 /app 而非 /", async () => {
    const { default: AppLayout } =
      await import("../../../components/layout/AppLayout");
    render(<AppLayout />);

    const links = screen.getAllByRole("link");
    const brand = links.find((a) => a.getAttribute("href") === "/app");
    expect(brand, "brand link 必須指向 /app").toBeDefined();
  });

  // spectra-scenario: web-settings / Accessible name describes the action
  it("主題鈕的名稱描述按下去的動作（系統為亮色時：切換為暗色）", async () => {
    const { default: AppLayout } =
      await import("../../../components/layout/AppLayout");
    render(<AppLayout />);

    const themeButton = screen.getByRole("button", {
      name: "settingsSwitchToDark",
    });
    expect(themeButton).toHaveAttribute("title", "settingsSwitchToDark");
  });
});
