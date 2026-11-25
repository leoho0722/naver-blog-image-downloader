import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ImageViewer from "../../../components/gallery/ImageViewer";
import type { PhotoEntity } from "../../../lib/api/types";
import { pressEscapeOn } from "../../test-utils/dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && "index" in options ? `${key}:${String(options.index)}` : key,
  }),
}));

const PHOTOS: PhotoEntity[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i),
  url: `https://blogfiles.pstatic.net/${i}.jpg`,
  filename: `${i}.jpg`,
}));

function renderViewer(onClose = vi.fn()) {
  render(<ImageViewer photos={PHOTOS} initialIndex={0} onClose={onClose} />);
  return { onClose, dialog: screen.getByRole("dialog") as HTMLDialogElement };
}

/** 檢視器底部的「目前第幾張 / 共幾張」計數 */
function counterText() {
  return screen.getByText(/^\d+ \/ \d+$/).textContent;
}

describe("ImageViewer", () => {
  it("renders image with referrerPolicy no-referrer", () => {
    renderViewer();

    const img = screen.getByAltText("0.jpg");
    expect(img).toHaveAttribute("referrerPolicy", "no-referrer");
  });

  it("以原生 <dialog> 強制回應開啟", () => {
    const { dialog } = renderViewer();

    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(dialog).not.toHaveAttribute("aria-modal");
  });

  // spectra-scenario: web-image-viewer / Localized accessible names
  it("對話框與縮放按鈕使用 i18n 的名稱", () => {
    renderViewer();

    expect(
      screen.getByRole("dialog", { name: "viewerLabel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "viewerZoomIn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "viewerZoomOut" }),
    ).toBeInTheDocument();
  });

  // spectra-scenario: web-image-viewer / Jump to a photo with the keyboard
  it("用 Tab 移到第三張縮圖按 Enter，會跳到第 3 張並標示為目前照片", async () => {
    const user = userEvent.setup();
    renderViewer();

    const third = screen.getByRole("button", { name: "viewerThumbnail:3" });
    third.focus();
    await user.keyboard("{Enter}");

    expect(counterText()).toBe("3 / 5");
    expect(third).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: "viewerThumbnail:1" }),
    ).not.toHaveAttribute("aria-current");
  });

  // spectra-scenario: web-image-viewer / Thumbnails do not compete with the main image
  it("縮圖 lazy + 低優先序，主圖高優先序", () => {
    renderViewer();

    const thumbButtons = screen.getAllByRole("button", {
      name: /^viewerThumbnail:/,
    });
    expect(thumbButtons).toHaveLength(5);
    for (const button of thumbButtons) {
      const img = within(button).getByRole("presentation", { hidden: true });
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("fetchpriority", "low");
    }
    expect(screen.getByAltText("0.jpg")).toHaveAttribute(
      "fetchpriority",
      "high",
    );
  });

  // spectra-scenario: web-image-viewer / Arrow keys work from a focused control
  it("焦點在關閉按鈕上時，按右方向鍵仍會切到下一張", () => {
    renderViewer();

    const closeButton = screen.getByRole("button", { name: "viewerClose" });
    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: "ArrowRight" });

    expect(counterText()).toBe("2 / 5");
  });

  // spectra-scenario: web-app-foundation / Escape closes through the native close request
  it("按 Esc 走原生關閉流程，onClose 只被呼叫一次", () => {
    const { dialog, onClose } = renderViewer();

    pressEscapeOn(dialog);

    expect(dialog).not.toHaveAttribute("open");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("按關閉按鈕會透過 dialog.close() 關閉", async () => {
    const { dialog, onClose } = renderViewer();

    await userEvent.click(screen.getByRole("button", { name: "viewerClose" }));

    expect(dialog).not.toHaveAttribute("open");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("未放大時圖片區保留垂直手勢（touch-action: pan-y）", () => {
    renderViewer();

    const imageArea = screen.getByAltText("0.jpg").parentElement!;
    expect(imageArea.style.touchAction).toBe("pan-y");
  });
});
