import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      key === "settingsThemeToggle" ? `${key}:${String(options?.theme)}` : key,
  }),
}));

vi.mock("../lib/stores/use-settings-store", () => ({
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

// HomePage / GalleryPage 有複雜副作用，用 stub 取代
vi.mock("../pages/HomePage", () => ({
  default: () => <div data-testid="home-page">HOME</div>,
}));
vi.mock("../pages/GalleryPage", () => ({
  default: () => <div data-testid="gallery-page">GALLERY</div>,
}));
vi.mock("../components/onboarding/OnboardingCard", () => ({
  default: () => null,
}));

async function renderAt(path: string) {
  const { appRoutes } = await import("../routes");
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("routes.tsx 路由與 redirect 行為", () => {
  it("/ 渲染 IntroRootPage（PublicLayout 底下）", async () => {
    await renderAt("/");
    expect(await screen.findByText("intro.root.title")).toBeInTheDocument();
  });

  it("/intro/mobile 渲染 IntroMobilePage", async () => {
    await renderAt("/intro/mobile");
    expect(
      await screen.findByText("intro.mobile.hero.title"),
    ).toBeInTheDocument();
  });

  it("/intro/mobile 會透過正式 route config 顯示頁內 anchor nav", async () => {
    await renderAt("/intro/mobile");
    expect(
      screen.getByRole("link", { name: "intro.mobile.nav.features" }),
    ).toHaveAttribute("href", "#features");
    expect(
      screen.getByRole("link", { name: "intro.mobile.nav.howItWorks" }),
    ).toHaveAttribute("href", "#how-it-works");
  });

  it("/intro/web 渲染 IntroWebPage", async () => {
    await renderAt("/intro/web");
    expect(await screen.findByText("intro.web.title")).toBeInTheDocument();
  });

  it("/app/web 渲染 HomePage（AppLayout 底下）", async () => {
    await renderAt("/app/web");
    expect(await screen.findByTestId("home-page")).toBeInTheDocument();
  });

  it("/app/web/gallery/abc 渲染 GalleryPage", async () => {
    await renderAt("/app/web/gallery/abc");
    expect(await screen.findByTestId("gallery-page")).toBeInTheDocument();
  });

  it("/web redirect 到 /intro/web", async () => {
    const router = await renderAt("/web");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/intro/web"),
    );
  });

  it("/web/app redirect 到 /app/web", async () => {
    const router = await renderAt("/web/app");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/app/web"),
    );
  });

  it("/web/app/gallery/abc123 redirect 到 /app/web（不帶 blogId）", async () => {
    const router = await renderAt("/web/app/gallery/abc123");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/app/web"),
    );
  });

  it("/nonexistent 渲染 NotFoundPage（含 notFound.title）", async () => {
    await renderAt("/nonexistent");
    expect(await screen.findByText("notFound.title")).toBeInTheDocument();
  });
});
