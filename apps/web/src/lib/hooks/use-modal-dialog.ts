import { useCallback, useEffect, useRef } from "react";

interface UseModalDialogOptions {
  /** 對話框關閉後呼叫（不論是按鈕、Esc 或手機返回手勢），用來同步 React 狀態 */
  onClose: () => void;
  /**
   * 使用者按 Esc 或返回手勢「要求關閉」時先呼叫；
   * 在裡面呼叫 event.preventDefault() 可以讓對話框保持開啟。
   */
  onCancel?: (event: Event) => void;
}

/**
 * useModalDialog——把原生 <dialog> 以「強制回應」模式打開，並在關閉時通知 React。
 *
 * 用原生 showModal() 打開，瀏覽器會自動處理：
 * - 對話框疊在所有內容最上層（不必再 portal 或拉高 z-index）
 * - 背後的頁面無法點擊、Tab 也跑不出去，螢幕報讀器只會讀到對話框內容
 * - Esc 與 Android 返回手勢可以關閉
 * - 關閉後焦點回到原本打開它的按鈕
 *
 * 元件的關閉按鈕請呼叫回傳的 close()，讓瀏覽器走正常的關閉流程；
 * 若直接把仍開著的對話框從畫面拿掉，焦點會掉到頁面最上方，鍵盤使用者就找不到原本的位置。
 */
export function useModalDialog({ onClose, onCancel }: UseModalDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // 保存最新的回呼，讓開啟對話框的 effect 只需要執行一次
  const onCloseRef = useRef(onClose);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCloseRef.current = onClose;
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // 開發模式（StrictMode）會重跑 effect，已經開著就不要再開一次（重複呼叫會丟錯）
    if (!dialog.open) dialog.showModal();

    const handleClose = () => onCloseRef.current();
    const handleCancel = (event: Event) => onCancelRef.current?.(event);
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);

    // 清理時刻意不呼叫 close()：StrictMode 重跑 effect 時會觸發 close 事件，
    // 讓元件一打開就被關掉。元件真正卸載時，瀏覽器會自動把對話框移出最上層。
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  return { dialogRef, close };
}
