import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMemoryRouter, Navigate, RouterProvider } from "react-router-dom";

/**
 * 用 createMemoryRouter 驗證 routes.tsx 的路由配置、redirect 與 NotFoundPage。
 * 這裡重建一份與 src/routes.tsx 等價的路由定義，避免 createBrowserRouter
 * 在 jsdom 測試環境下觸發 window.history 的副作用。
 */

// Stub 各頁面以可識別文字呈現
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

function buildRouter(initial: string) {
  const lazy = async (path: string) => {
    const mod = await import(/* @vite-ignore */ path);
    return { Component: mod.default };
  };

  return createMemoryRouter(
    [
      {
        lazy: () => lazy("../components/layout/PublicLayout"),
        children: [
          { path: "/", lazy: () => lazy("../pages/intro/IntroRootPage") },
          {
            path: "/intro/mobile",
            lazy: () => lazy("../pages/intro/IntroMobilePage"),
          },
          {
            path: "/intro/web",
            lazy: () => lazy("../pages/intro/IntroWebPage"),
          },
          { path: "/web", element: <Navigate to="/intro/web" replace /> },
          { path: "*", lazy: () => lazy("../pages/NotFoundPage") },
        ],
      },
      {
        lazy: () => lazy("../components/layout/AppLayout"),
        children: [
          { path: "/app/web", lazy: () => lazy("../pages/HomePage") },
          {
            path: "/app/web/gallery/:blogId",
            lazy: () => lazy("../pages/GalleryPage"),
          },
        ],
      },
      { path: "/web/app", element: <Navigate to="/app/web" replace /> },
      {
        path: "/web/app/gallery/:blogId",
        element: <Navigate to="/app/web" replace />,
      },
    ],
    { initialEntries: [initial] },
  );
}

async function renderAt(path: string) {
  const router = buildRouter(path);
  render(<RouterProvider router={router} />);
  // 給 lazy loader 與 effect 一些 microtask
  await new Promise((resolve) => setTimeout(resolve, 0));
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
