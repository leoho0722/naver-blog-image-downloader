import { Check, X } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { useModalDialog } from "../../lib/hooks/use-modal-dialog";
import { useDownloadStore } from "../../lib/stores/use-download-store";

interface DownloadProgressProps {
  /** 對話框關閉後呼叫（按確定／關閉，或打包結束後按 Esc），用來把下載狀態清回 idle */
  onClose: () => void;
}

/**
 * 打包進度對話框（原生 <dialog> 強制回應模式）。
 *
 * 由 GalleryPage 在下載狀態不是 idle 時才掛載，掛載當下就會打開。
 * - 打包中：顯示「處理中」進度條，Esc 與返回手勢都關不掉，避免打包到一半被中斷
 * - 完成／失敗：顯示結果，按鈕或 Esc 都能關閉
 */
export default function DownloadProgress({ onClose }: DownloadProgressProps) {
  const { t } = useTranslation();
  const { downloadPhase, error, fileCount } = useDownloadStore();
  const titleId = useId();
  const isPackaging = downloadPhase === "packaging";

  const { dialogRef, close } = useModalDialog({
    onClose,
    // Safari 還不支援下方的 closedby，按 Esc 時改由這裡擋下（打包中才擋）
    onCancel: (event) => {
      if (isPackaging) event.preventDefault();
    },
  });

  return (
    <dialog
      ref={dialogRef}
      // 打包中完全不接受 Esc／返回手勢；打包結束後恢復成一般對話框的關閉方式
      closedby={isPackaging ? "none" : "closerequest"}
      aria-labelledby={titleId}
      // dialog-scrim 提供半透明遮罩與模糊；只在打開時才設成 flex，m-auto 讓卡片置中。
      // 打包中卡片裡沒有按鈕，瀏覽器會把焦點放在卡片本身；卡片不是可操作的控制項，不畫焦點外框
      // （歡迎卡同樣處理）
      className="dialog-scrim animate-fade-in m-auto w-[330px] max-w-[calc(100vw-2rem)] flex-col items-center rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-7 py-8 text-[var(--color-on-surface)] outline-none open:flex"
      style={{ boxShadow: "0 24px 70px rgba(30, 20, 8, 0.35)" }}
    >
      {isPackaging && (
        <div className="w-full text-center">
          <p
            id={titleId}
            className="mb-1.5 text-[16.5px] font-semibold text-[var(--color-on-surface)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("packaging")}
          </p>
          <p className="mb-[18px] text-[13px] text-[var(--color-on-surface-variant)]">
            {t("packagingHint")}
          </p>
          {/* 不給 value 就是「處理中、不確定還要多久」的進度條；名稱沿用上方標題 */}
          <progress className="packaging-progress" aria-labelledby={titleId} />
        </div>
      )}

      {/*
        打包結果的播報區：這個區塊一開始就存在（打包中是空的），
        內容換成完成或失敗訊息時，螢幕報讀器才會主動唸出來。
      */}
      <div role="status" className="flex w-full flex-col items-center gap-4">
        {downloadPhase === "completed" && (
          <>
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
              <Check size={25} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p
                id={titleId}
                className="mb-1.5 text-[16.5px] font-semibold text-[var(--color-on-surface)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("packagingDone")}
              </p>
              <p className="text-[13px] text-[var(--color-on-surface-variant)]">
                {t("packagingComplete", { count: fileCount })}
              </p>
            </div>
          </>
        )}

        {downloadPhase === "error" && (
          <>
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[var(--color-error)]/15 text-[var(--color-error)]">
              <X size={25} strokeWidth={2.5} />
            </div>
            <p
              id={titleId}
              className="text-center text-sm text-[var(--color-error)]"
            >
              {error ?? t("packagingFailed")}
            </p>
          </>
        )}
      </div>

      {downloadPhase === "completed" && (
        <button
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-full bg-[var(--color-primary)] py-3 text-sm font-bold text-[var(--color-on-primary)] transition-all duration-200 hover:brightness-[1.07] active:scale-[0.98]"
        >
          {t("commonOk")}
        </button>
      )}

      {downloadPhase === "error" && (
        <button
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-full py-3 text-sm font-semibold text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)]"
        >
          {t("viewerClose")}
        </button>
      )}
    </dialog>
  );
}
