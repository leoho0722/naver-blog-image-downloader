import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { PhotoEntity } from "../../lib/api/types";
import { useGalleryStore } from "../../lib/stores/use-gallery-store";

import PhotoCard from "./PhotoCard";

interface PhotoGridProps {
  onViewPhoto: (photo: PhotoEntity) => void;
}

export default function PhotoGrid({ onViewPhoto }: PhotoGridProps) {
  const { t } = useTranslation();
  const photos = useGalleryStore((s) => s.photos);
  const isSelectMode = useGalleryStore((s) => s.isSelectMode);
  const selectedIds = useGalleryStore((s) => s.selectedIds);
  const toggleSelection = useGalleryStore((s) => s.toggleSelection);

  const isSelectModeRef = useRef(isSelectMode);
  isSelectModeRef.current = isSelectMode;

  const handleView = useCallback(
    (photo: PhotoEntity) => {
      if (isSelectModeRef.current) {
        toggleSelection(photo.id);
      } else {
        onViewPhoto(photo);
      }
    },
    [toggleSelection, onViewPhoto],
  );

  const stableToggle = useCallback(
    (id: string) => toggleSelection(id),
    [toggleSelection],
  );

  if (photos.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-[var(--color-on-surface-variant)]">
          {t("galleryEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-[13px] pt-3.5 pb-24 sm:grid-cols-3 md:grid-cols-4 ${
        isSelectMode ? "select-mode" : ""
      }`}
    >
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isSelected={selectedIds.has(photo.id)}
          onToggleSelection={stableToggle}
          onView={handleView}
        />
      ))}
    </div>
  );
}
