import { memo } from "react";

import type { PhotoEntity } from "../../lib/api/types";

interface PhotoCardProps {
  photo: PhotoEntity;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onView: (photo: PhotoEntity) => void;
}

export default memo(function PhotoCard({
  photo,
  isSelected,
  onToggleSelection,
  onView,
}: PhotoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onView(photo)}
      className="group relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--color-surface-container)] outline-none transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      <img
        src={photo.url}
        alt={photo.filename}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <div
        className={`checkbox-overlay absolute inset-0 flex items-start justify-end p-2.5 ${
          isSelected ? "bg-[var(--color-primary)]/20" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(photo.id);
        }}
      >
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-150 ${
            isSelected
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
              : "border-white bg-black/30 backdrop-blur-sm"
          }`}
        >
          {isSelected && (
            <svg
              className="h-3.5 w-3.5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
});
