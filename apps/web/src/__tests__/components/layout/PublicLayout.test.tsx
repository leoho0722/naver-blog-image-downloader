import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      key === "settingsThemeToggle" ? `${key}:${String(options?.theme)}` : key,
  }),
}));

vi.mock("react-router-dom", () => ({
  Outlet: () => <div data-testid="outlet">outlet</div>,
  useMatches: () => [
    {
      handle: {
        anchorLinks: [
          {
            href: "#features",
            labelKey: "intro.mobile.nav.features",
          },
        ],
      },
    },
  ],
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

describe("PublicLayout", () => {
  it("渲染 IntroNav、Outlet、IntroFooter 三個部分", async () => {
    const { default: PublicLayout } =
      await import("../../../components/layout/PublicLayout");
    render(<PublicLayout />);

    // Outlet 顯示子頁面
    expect(screen.getByTestId("outlet")).toBeInTheDocument();

    // IntroNav 會渲染 brand link 連到 "/" 與頁內 anchor link
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href") === "/")).toBe(true);
    expect(
      screen.getByRole("link", { name: "intro.mobile.nav.features" }),
    ).toHaveAttribute("href", "#features");

    // IntroFooter 會渲染 GitHub 連結
    expect(
      screen.getByText(/GitHub/i) || screen.getByText(/intro\.footer\.github/i),
    ).toBeInTheDocument();
  });
});
