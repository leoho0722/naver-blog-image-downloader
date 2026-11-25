import { render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useModalDialog } from "../../../lib/hooks/use-modal-dialog";
import { pressEscapeOn } from "../../test-utils/dialog";

interface HarnessProps {
  onClose: () => void;
  onCancel?: (event: Event) => void;
}

/** 測試用的最小對話框元件：一顆按鈕呼叫 hook 回傳的 close() */
function Harness({ onClose, onCancel }: HarnessProps) {
  const { dialogRef, close } = useModalDialog({ onClose, onCancel });
  return (
    <dialog ref={dialogRef} aria-label="測試對話框">
      <button type="button" onClick={close}>
        關閉
      </button>
    </dialog>
  );
}

function getDialog(container: HTMLElement) {
  const dialog = container.querySelector("dialog");
  if (!dialog) throw new Error("找不到 dialog");
  return dialog;
}

describe("useModalDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("掛載後以 showModal() 打開對話框", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const { container } = render(<Harness onClose={vi.fn()} />);

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(getDialog(container).open).toBe(true);
  });

  it("StrictMode 重跑 effect 時不會重複打開，也不會被自己關掉", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const onClose = vi.fn();
    const { container } = render(
      <StrictMode>
        <Harness onClose={onClose} />
      </StrictMode>,
    );

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(getDialog(container).open).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("呼叫 close() 會關閉對話框並通知 onClose 一次", () => {
    const onClose = vi.fn();
    const { container, getByRole } = render(<Harness onClose={onClose} />);

    getByRole("button", { name: "關閉" }).click();

    expect(getDialog(container).open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // spectra-scenario: web-app-foundation / Escape closes through the native close request
  it("按 Esc 走原生關閉流程，onClose 只被呼叫一次", () => {
    const onClose = vi.fn();
    const { container } = render(<Harness onClose={onClose} />);

    pressEscapeOn(getDialog(container));

    expect(getDialog(container).open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("onCancel 呼叫 preventDefault() 時，Esc 不會關閉對話框", () => {
    const onClose = vi.fn();
    const onCancel = vi.fn((event: Event) => event.preventDefault());
    const { container } = render(
      <Harness onClose={onClose} onCancel={onCancel} />,
    );

    pressEscapeOn(getDialog(container));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(getDialog(container).open).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("重新 render 換了回呼後，關閉時呼叫的是最新的回呼", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { container, rerender } = render(<Harness onClose={first} />);

    rerender(<Harness onClose={second} />);
    getDialog(container).close();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
