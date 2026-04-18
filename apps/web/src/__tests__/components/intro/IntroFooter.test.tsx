import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import IntroFooter from "../../../components/intro/IntroFooter";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("IntroFooter", () => {
  it("渲染 footer 版權宣告與 GitHub 連結", () => {
    render(
      <MemoryRouter>
        <IntroFooter />
      </MemoryRouter>,
    );

    expect(screen.getByText("intro.footer.copyright")).toBeInTheDocument();

    const githubLink = screen.getByRole("link", {
      name: "intro.footer.github",
    });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/leoho0722/naver-blog-image-downloader",
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
  });

  it("渲染指向 /privacy 的隱私政策連結", () => {
    render(
      <MemoryRouter>
        <IntroFooter />
      </MemoryRouter>,
    );

    const privacyLink = screen.getByRole("link", {
      name: "privacy.footerLink",
    });
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });
});
