import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("react-router-dom", () => ({
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

async function renderLandingPage() {
  const { default: LandingPage } = await import("../../pages/LandingPage");
  render(<LandingPage />);
}

describe("LandingPage", () => {
  it("渲染 hero 標題與雙行 tagline", async () => {
    await renderLandingPage();

    expect(screen.getByText("intro.root.title")).toBeInTheDocument();

    // tagline 由 <br /> 拆成兩行，兩段文字落在同一個 <p> 裡
    const tagline = screen.getByText(/intro\.root\.taglineLine1/, {
      selector: "p",
    });
    expect(tagline).toHaveTextContent("intro.root.taglineLine2");
  });

  it("渲染四張 feature card", async () => {
    await renderLandingPage();

    for (const key of [
      "intro.root.featureUrl.title",
      "intro.root.featureGrid.title",
      "intro.root.featureBatch.title",
      "intro.root.featureI18n.title",
    ]) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it("主 CTA 以同站連結指向 /app", async () => {
    await renderLandingPage();

    const cta = screen.getByRole("link", { name: /intro\.root\.cta/ });
    expect(cta).toHaveAttribute("href", "/app");
  });

  it("不含返回連結、平台選擇卡與 App 介紹入口", async () => {
    await renderLandingPage();

    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href") ?? "");
    // 根頁面沒有父層可回，也不該再出現 mobile／web 的平台分流
    expect(hrefs).toEqual(["/app"]);
    expect(screen.queryByText("intro.web.back")).not.toBeInTheDocument();
    expect(
      screen.queryByText("intro.root.cardAppTitle"),
    ).not.toBeInTheDocument();
  });

  it("渲染技術棧說明", async () => {
    await renderLandingPage();

    expect(screen.getByText("intro.root.tech")).toBeInTheDocument();
  });
});
