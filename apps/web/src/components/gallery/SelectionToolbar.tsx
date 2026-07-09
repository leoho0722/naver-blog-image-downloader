import { useTranslation } from "react-i18next";

import { useGalleryStore } from "../../lib/stores/use-gallery-store";

interface SelectionToolbarProps {
  onDownloadAll: () => void;
  onDownloadSelected: () => void;
}

const PILL_BASE =
  "shrink-0 rounded-full px-[15px] py-2 text-[13px] font-semibold transition-all duration-200";

export default function SelectionToolbar({
  onDownloadAll,
  onDownloadSelected,
}: SelectionToolbarProps) {
  const { t } = useTranslation();
  const { photos, isSelectMode, selectedIds, toggleSelectMode, selectAll } =
    useGalleryStore();
  const hasSelection = selectedIds.size > 0;

  return (
    <div
      className="animate-fade-in sticky top-3 z-20 mt-3 mb-1 flex items-center gap-1.5 rounded-[18px] border border-[var(--color-outline-variant)] px-[18px] py-2.5"
      style={{
        background:
          "color-mix(in oklab, var(--color-surface-container) 92%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      <span className="mr-auto text-[14.5px] font-semibold text-[var(--color-on-surface)]">
        {t("galleryPhotos", { count: photos.length })}
        {isSelectMode && hasSelection && (
          <span className="text-[var(--color-primary)]">
            {" · "}
            {t("gallerySelected", { count: selectedIds.size })}
          </span>
        )}
      </span>

      {isSelectMode && (
        <button
          type="button"
          onClick={selectAll}
          className={`${PILL_BASE} text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]`}
        >
          {t("gallerySelectAll")}
        </button>
      )}

      <button
        type="button"
        onClick={toggleSelectMode}
        className={`${PILL_BASE} ${
          isSelectMode
            ? "bg-[var(--color-primary-container)] text-[var(--color-primary)]"
            : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]"
        }`}
      >
        {isSelectMode ? t("galleryDeselectMode") : t("gallerySelectMode")}
      </button>

      {isSelectMode && hasSelection && (
        <button
          type="button"
          onClick={onDownloadSelected}
          className={`${PILL_BASE} bg-[var(--color-primary)] text-[var(--color-on-primary)] active:scale-95`}
        >
          {t("downloadSelected")}
        </button>
      )}

      <button
        type="button"
        onClick={onDownloadAll}
        className={`${PILL_BASE} bg-[var(--color-primary)] text-[var(--color-on-primary)] active:scale-95`}
        style={{ boxShadow: "0 3px 12px var(--color-primary-glow)" }}
      >
        {t("downloadAll")}
      </button>
    </div>
  );
}
