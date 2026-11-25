import { Check } from "lucide-react";
import { memo } from "react";

import type { PhotoEntity } from "../../lib/api/types";

/** 相簿最前面幾張照片一定在第一個畫面內，不延遲載入（涵蓋各種寬度下的第一列） */
export const EAGER_PHOTO_COUNT = 4;

interface PhotoCardProps {
  photo: PhotoEntity;
  /** 這張照片在相簿中的位置（從 0 起算），用來決定圖片下載的優先順序 */
  index: number;
  /** 是否處於選取模式；選取模式下按鈕會告訴螢幕報讀器「是否已選取」 */
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onView: (photo: PhotoEntity) => void;
}

export default memo(function PhotoCard({
  photo,
  index,
  isSelectMode,
  isSelected,
  onToggleSelection,
  onView,
}: PhotoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onView(photo)}
      // 選取模式下按一下是「選取／取消選取」，用 aria-pressed 讓螢幕報讀器唸出目前狀態；
      // 一般模式下按一下是打開檢視器，不是切換狀態，所以不加
      aria-pressed={isSelectMode ? isSelected : undefined}
      className={`group relative aspect-square w-full overflow-hidden rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] outline-none transition-all duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_26px_rgba(80,60,30,0.18)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
        isSelected ? "scale-[0.965] ring-[3px] ring-[var(--color-primary)]" : ""
      }`}
    >
      <img
        src={photo.url}
        alt={photo.filename}
        // 第一個畫面內的照片立刻下載，第一張再提高優先順序；其餘捲到附近才下載
        loading={index < EAGER_PHOTO_COUNT ? undefined : "lazy"}
        fetchPriority={index === 0 ? "high" : undefined}
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
