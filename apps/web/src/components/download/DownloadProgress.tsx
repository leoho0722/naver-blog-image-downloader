import { useTranslation } from "react-i18next";

import { useDownloadStore } from "../../lib/stores/use-download-store";

interface DownloadProgressProps {
  onClose: () => void;
}

export default function DownloadProgress({ onClose }: DownloadProgressProps) {
  const { t } = useTranslation();
  const { downloadPhase, error, fileCount } = useDownloadStore();

  if (downloadPhase === "idle") return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-xs rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-surface-container-high)",
          boxShadow: "var(--shadow-elevated)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="下載進度"
      >
        {downloadPhase === "packaging" && (
          <div className="flex flex-col items-center gap-5">
            <div className="h-10 w-10 animate-spin rounded-full border-[2.5px] border-[var(--color-primary)] border-t-transparent" />
            <p className="text-sm font-medium text-[var(--color-on-surface)]">
              {t("packaging")}
            </p>
          </div>
        )}

        {downloadPhase === "completed" && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <svg
                className="h-6 w-6 text-[var(--color-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-on-surface)]">
              {t("packagingComplete", { count: fileCount })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]/60"
            >
              {t("commonOk")}
            </button>
          </div>
        )}

        {downloadPhase === "error" && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error)]/10">
              <svg
                className="h-6 w-6 text-[var(--color-error)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-center text-sm text-[var(--color-error)]">
              {error ?? t("packagingFailed")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl py-2.5 text-sm font-medium text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container)]"
            >
              {t("viewerClose")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
