import { Check } from "lucide-react";
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
      className={`group relative aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] outline-none transition-all duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_26px_rgba(80,60,30,0.18)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
        isSelected ? "scale-[0.965] ring-[3px] ring-[var(--color-primary)]" : ""
      }`}
    >
      <img
        src={photo.url}
        alt={photo.filename}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
      />
      <div
        className="checkbox-overlay absolute inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(photo.id);
        }}
      >
        <span
          className={`absolute top-2.5 right-2.5 flex h-[25px] w-[25px] items-center justify-center rounded-full border-2 transition-colors duration-150 ${
            isSelected
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "border-white/95 bg-[rgba(60,48,30,0.32)] text-transparent"
          }`}
        >
          {isSelected && <Check size={14} strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
});
