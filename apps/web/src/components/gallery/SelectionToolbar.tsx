import { useTranslation } from "react-i18next";

import { useGalleryStore } from "../../lib/stores/use-gallery-store";

interface SelectionToolbarProps {
  onDownloadAll: () => void;
  onDownloadSelected: () => void;
}

export default function SelectionToolbar({
  onDownloadAll,
  onDownloadSelected,
}: SelectionToolbarProps) {
  const { t } = useTranslation();
  const { photos, isSelectMode, selectedIds, toggleSelectMode, selectAll } =
    useGalleryStore();

  return (
    <div
      className="animate-fade-in mb-5 flex flex-wrap items-center gap-2 rounded-xl px-4 py-3"
      style={{
        backgroundColor: "var(--color-surface-container)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <span className="mr-auto text-sm font-medium text-[var(--color-on-surface-variant)]">
        {t("galleryPhotos", { count: photos.length })}
        {isSelectMode && selectedIds.size > 0 && (
          <span className="ml-2 text-[var(--color-primary)]">
            · {t("gallerySelected", { count: selectedIds.size })}
          </span>
        )}
      </span>

      {isSelectMode && (
        <button
          type="button"
          onClick={selectAll}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]/60"
        >
          {t("gallerySelectAll")}
        </button>
      )}

      <button
        type="button"
        onClick={toggleSelectMode}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
          isSelectMode
            ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
            : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]"
        }`}
      >
        {isSelectMode ? t("galleryDeselectMode") : t("gallerySelectMode")}
      </button>

      {isSelectMode && selectedIds.size > 0 && (
        <button
          type="button"
          onClick={onDownloadSelected}
          className="rounded-lg bg-[var(--color-primary)] px-3.5 py-1.5 text-sm font-semibold text-[var(--color-on-primary)] transition-all duration-200 active:scale-95"
        >
          {t("downloadSelected")}
        </button>
      )}

      <button
        type="button"
        onClick={onDownloadAll}
        className="rounded-lg bg-[var(--color-primary)] px-3.5 py-1.5 text-sm font-semibold text-[var(--color-on-primary)] transition-all duration-200 active:scale-95"
        style={{ boxShadow: "0 1px 4px rgba(21, 101, 192, 0.25)" }}
      >
        {t("downloadAll")}
      </button>
    </div>
  );
}
