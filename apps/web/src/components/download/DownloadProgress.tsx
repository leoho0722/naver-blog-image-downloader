import { Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useDownloadStore } from "../../lib/stores/use-download-store";

interface DownloadProgressProps {
  onClose: () => void;
}

export default function DownloadProgress({ onClose }: DownloadProgressProps) {
  const { t } = useTranslation();
  const { downloadPhase, error, fileCount } = useDownloadStore();

  if (downloadPhase === "idle") return null;

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{
        backgroundColor: "var(--color-scrim)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        className="flex w-[330px] max-w-[calc(100vw-2rem)] flex-col items-center gap-4 rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-7 py-8"
        style={{ boxShadow: "0 24px 70px rgba(30, 20, 8, 0.35)" }}
        role="dialog"
        aria-modal="true"
        aria-label={t("packaging")}
      >
        {downloadPhase === "packaging" && (
          <div className="w-full text-center">
            <p
              className="mb-1.5 text-[16.5px] font-semibold text-[var(--color-on-surface)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("packaging")}
            </p>
            <p className="mb-[18px] text-[13px] text-[var(--color-on-surface-variant)]">
              {t("packagingHint")}
            </p>
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-primary-container)]">
              <div className="animate-indeterminate-bar rounded-full bg-[var(--color-primary)]" />
            </div>
          </div>
        )}

        {downloadPhase === "completed" && (
          <>
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)]">
              <Check size={25} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p
                className="mb-1.5 text-[16.5px] font-semibold text-[var(--color-on-surface)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("packagingDone")}
              </p>
              <p className="text-[13px] text-[var(--color-on-surface-variant)]">
                {t("packagingComplete", { count: fileCount })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[var(--color-primary)] py-3 text-sm font-bold text-[var(--color-on-primary)] transition-all duration-200 hover:brightness-[1.07] active:scale-[0.98]"
            >
              {t("commonOk")}
            </button>
          </>
        )}

        {downloadPhase === "error" && (
          <>
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[var(--color-error)]/15 text-[var(--color-error)]">
              <X size={25} strokeWidth={2.5} />
            </div>
            <p className="text-center text-sm text-[var(--color-error)]">
              {error ?? t("packagingFailed")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full py-3 text-sm font-semibold text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)]"
            >
              {t("viewerClose")}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
