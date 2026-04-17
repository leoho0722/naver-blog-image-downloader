import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("DownloadBadge", () => {
  it("沒有 href 時維持非互動 badge，不假裝可點", async () => {
    const { default: DownloadBadge } =
      await import("../../../components/intro/DownloadBadge");
    const { container } = render(
      <DownloadBadge store="appStore" comingSoon={false} />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass("cursor-pointer");
    expect(container.firstElementChild).not.toHaveAttribute("aria-disabled");
  });

  it("有 href 且已可下載時渲染為真實連結", async () => {
    const { default: DownloadBadge } =
      await import("../../../components/intro/DownloadBadge");
    render(
      <DownloadBadge
        store="googlePlay"
        comingSoon={false}
        href="https://example.com/google-play"
      />,
    );

    expect(
      screen.getByRole("link", {
        name: /intro\.mobile\.download\.googlePlay/i,
      }),
    ).toHaveAttribute("href", "https://example.com/google-play");
  });
});
