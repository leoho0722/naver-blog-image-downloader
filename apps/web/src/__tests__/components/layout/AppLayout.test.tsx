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

  it("header brand link 指向 /app/web 而非 /", async () => {
    const { default: AppLayout } =
      await import("../../../components/layout/AppLayout");
    render(<AppLayout />);

    const links = screen.getAllByRole("link");
    const brand = links.find((a) => a.getAttribute("href") === "/app/web");
    expect(brand, "brand link 必須指向 /app/web").toBeDefined();
  });
});
