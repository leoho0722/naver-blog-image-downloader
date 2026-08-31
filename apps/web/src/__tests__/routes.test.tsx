import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      // 支援 returnObjects（PrivacyPolicyPage 會讀 privacy.sections / privacy.contact）
      if (options && options.returnObjects === true) {
        if (key === "privacy.sections") {
          return [];
        }
        if (key === "privacy.contact") {
          return {
            title: "privacy.contact.title",
            body: "privacy.contact.body",
            issueLinkLabel: "privacy.contact.issueLinkLabel",
            issueUrl:
              "https://github.com/leoho0722/naver-blog-image-downloader/issues",
          };
        }
        return {};
      }
      if (key === "settingsThemeToggle") {
        return `${key}:${String(options?.theme)}`;
      }
      return key;
    },
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
  it("/ 渲染 LandingPage（PublicLayout 底下）", async () => {
    await renderAt("/");
    expect(await screen.findByText("intro.root.title")).toBeInTheDocument();
    // 主 CTA 直接把使用者送進 Web App
    expect(
      screen.getByRole("link", { name: "intro.root.cta" }),
    ).toHaveAttribute("href", "/app");
  });

  it("/ 不再出現任何指向舊 intro 路徑的連結", async () => {
    await renderAt("/");
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href") ?? "");
    expect(hrefs.some((h) => h.startsWith("/intro"))).toBe(false);
  });

  it("/app 渲染 HomePage（AppLayout 底下）", async () => {
    await renderAt("/app");
    expect(await screen.findByTestId("home-page")).toBeInTheDocument();
  });

  it("/app/gallery/abc 渲染 GalleryPage", async () => {
    await renderAt("/app/gallery/abc");
    expect(await screen.findByTestId("gallery-page")).toBeInTheDocument();
  });

  it("/privacy 渲染 PrivacyPolicyPage（PublicLayout 底下）", async () => {
    await renderAt("/privacy");
    // 頁面會渲染 privacy.pageTitle 作為 h1
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "privacy.pageTitle",
      }),
    ).toBeInTheDocument();
  });

  it("/nonexistent 渲染 NotFoundPage（含 notFound.title）", async () => {
    await renderAt("/nonexistent");
    expect(await screen.findByText("notFound.title")).toBeInTheDocument();
  });

  it("NotFoundPage 只剩兩顆 CTA，且不含 App 介紹入口", async () => {
    await renderAt("/nonexistent");
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href") ?? "");
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/app");
    expect(hrefs).not.toContain("/intro/mobile");
  });

  // 舊 URL 相容：可冷啟入口 → 對應新路徑；依賴 SPA state 的深連結 → 退回 /app
  describe.each([
    ["/web", "/"],
    ["/intro/web", "/"],
    ["/intro/mobile", "/"],
    ["/web/app", "/app"],
    ["/app/web", "/app"],
    ["/web/app/gallery/abc123def456", "/app"],
    ["/app/web/gallery/abc123def456", "/app"],
  ])("legacy redirect", (from, to) => {
    it(`${from} redirect 到 ${to}`, async () => {
      const router = await renderAt(from);
      await waitFor(() => expect(router.state.location.pathname).toBe(to));
    });
  });

  it("gallery 舊深連結不得把 blogId 帶進新路徑", async () => {
    const router = await renderAt("/app/web/gallery/abc123def456");
    await waitFor(() =>
      expect(router.state.location.pathname).not.toBe(
        "/app/gallery/abc123def456",
      ),
    );
    expect(router.state.location.pathname).toBe("/app");
  });
});
