import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DownloadProgress from "../../../components/download/DownloadProgress";
import type { DownloadPhase } from "../../../lib/stores/use-download-store";
import { pressEscapeOn } from "../../test-utils/dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && "count" in options ? `${key}:${String(options.count)}` : key,
  }),
}));

let mockState: {
  downloadPhase: DownloadPhase;
  error: string | null;
  fileCount: number;
};

vi.mock("../../../lib/stores/use-download-store", () => ({
  useDownloadStore: () => mockState,
}));

function getDialog() {
  return screen.getByRole("dialog") as HTMLDialogElement;
}

describe("DownloadProgress", () => {
  beforeEach(() => {
    mockState = { downloadPhase: "packaging", error: null, fileCount: 0 };
  });

  // spectra-scenario: web-download-flow / Show packaging progress
  it("打包中顯示以標題命名、不確定進度的原生 <progress>", () => {
    render(<DownloadProgress onClose={vi.fn()} />);

    const dialog = getDialog();
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("dialog", { name: "packaging" })).toBe(dialog);

    const progress = screen.getByRole("progressbar", { name: "packaging" });
    expect(progress.tagName).toBe("PROGRESS");
    expect(progress).not.toHaveAttribute("value");
  });

  // spectra-scenario: web-download-flow / Escape is ignored while packaging
  it("打包中按 Esc 不會關閉，也不接受原生關閉請求", () => {
    const onClose = vi.fn();
    render(<DownloadProgress onClose={onClose} />);

    const dialog = getDialog();
    expect(dialog).toHaveAttribute("closedby", "none");

    pressEscapeOn(dialog);

    expect(dialog).toHaveAttribute("open");
    expect(onClose).not.toHaveBeenCalled();
  });

  // spectra-scenario: web-download-flow / Completion triggers the download and shows a summary
  it("打包完成後，在播報區顯示 12 張照片的成功摘要與確定按鈕", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<DownloadProgress onClose={onClose} />);
    const status = screen.getByRole("status");

    mockState = { downloadPhase: "completed", error: null, fileCount: 12 };
    rerender(<DownloadProgress onClose={onClose} />);

    // 播報區是同一個元素，內容換成結果，螢幕報讀器才會唸出來
    expect(screen.getByRole("status")).toBe(status);
    expect(status).toHaveTextContent("packagingDone");
    expect(status).toHaveTextContent("packagingComplete:12");
    expect(getDialog()).toHaveAttribute("closedby", "closerequest");

    await userEvent.click(screen.getByRole("button", { name: "commonOk" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // spectra-scenario: web-download-flow / Show error with close button
  it("打包失敗時在播報區顯示錯誤訊息與關閉按鈕", () => {
    mockState = { downloadPhase: "error", error: "打包逾時", fileCount: 0 };
    render(<DownloadProgress onClose={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("打包逾時");
    expect(
      screen.getByRole("button", { name: "viewerClose" }),
    ).toBeInTheDocument();
  });

  // spectra-scenario: web-download-flow / Escape closes after completion or failure
  it.each(["completed", "error"] as const)(
    "%s 狀態下按 Esc 會關閉並通知 onClose",
    (phase) => {
      mockState = { downloadPhase: phase, error: null, fileCount: 3 };
      const onClose = vi.fn();
      render(<DownloadProgress onClose={onClose} />);
      // 關閉後的對話框會從無障礙樹中隱藏，先取得元素再按 Esc
      const dialog = getDialog();

      pressEscapeOn(dialog);

      expect(dialog).not.toHaveAttribute("open");
      expect(onClose).toHaveBeenCalledTimes(1);
    },
  );
});
