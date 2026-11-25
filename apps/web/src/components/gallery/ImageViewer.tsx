import {
  ChevronLeft,
  ChevronRight,
  Download,
  Minus,
  Plus,
  X,
} from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import { useTranslation } from "react-i18next";

import type { PhotoEntity } from "../../lib/api/types";
import { useModalDialog } from "../../lib/hooks/use-modal-dialog";

interface ImageViewerProps {
  photos: PhotoEntity[];
  initialIndex: number;
  onClose: () => void;
  onDownload?: (index: number) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.5;

/**
 * 全螢幕圖片檢視器。
 *
 * 以原生 <dialog> 強制回應模式打開：背後的相簿不能點、Tab 只在檢視器內循環，
 * Esc 或手機返回手勢可關閉，關閉後焦點回到原本點開的那張照片。
 */
export default function ImageViewer({
  photos,
  initialIndex,
  onClose,
  onDownload,
}: ImageViewerProps) {
  const { t } = useTranslation();
  const { dialogRef, close } = useModalDialog({ onClose });
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  } | null>(null);

  const photo = photos[currentIndex];

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (delta: number) => {
      setCurrentIndex((prev) => {
        const next = prev + delta;
        if (next < 0 || next >= photos.length) return prev;
        return next;
      });
      resetZoom();
    },
    [photos.length, resetZoom],
  );

  const jumpTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      resetZoom();
    },
    [resetZoom],
  );

  const zoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

  // 鍵盤操作掛在對話框上：焦點一定在檢視器內，按鍵事件會一路冒泡到這裡，
  // 不論焦點停在哪顆按鈕都能用方向鍵與 +／- 操作。Esc 交給瀏覽器原生的關閉流程。
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDialogElement>) => {
    switch (e.key) {
      case "ArrowLeft":
        goTo(-1);
        break;
      case "ArrowRight":
        goTo(1);
        break;
      case "+":
      case "=":
        zoom(ZOOM_STEP);
        break;
      case "-":
        zoom(-ZOOM_STEP);
        break;
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: translate.x,
      startTy: translate.y,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTranslate({
      x: dragRef.current.startTx + dx,
      y: dragRef.current.startTy + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  // 觸控滑動切換
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale > 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      goTo(dx < 0 ? 1 : -1);
    }
  };

  const dims =
    photo.width && photo.height ? `${photo.width}×${photo.height}` : null;
  const roundBtn =
    "flex items-center justify-center rounded-full bg-white/[0.12] text-[#f3ede4] transition-colors duration-200 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/[0.12]";

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("viewerLabel")}
      onKeyDown={handleKeyDown}
      // 鋪滿整個畫面：重設瀏覽器給 <dialog> 的預設寬高上限、外框與內距；
      // 只在打開時才設成 flex，關閉狀態保留瀏覽器原本的隱藏行為
      className="animate-fade-in fixed inset-0 m-0 h-full max-h-none w-full max-w-none flex-col overflow-hidden border-0 p-0 text-[#f3ede4] backdrop:bg-transparent open:flex"
      style={{ background: "rgba(26, 21, 15, 0.96)" }}
    >
      {/* 頂部列：檔名 · 尺寸 + 關閉 */}
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="min-w-0 truncate text-[12.5px] text-[#f3ede4]/50">
          {photo.filename}
          {dims && ` · ${dims}`}
        </span>
        <button
          type="button"
          onClick={close}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.12] px-[18px] py-[9px] text-[13px] font-semibold text-[#f3ede4] transition-colors hover:bg-white/20"
        >
          <X size={13} strokeWidth={2.5} />
          {t("viewerClose")}
        </button>
      </div>

      {/* 圖片區 */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-20"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: scale > 1 ? "grab" : "default",
          // 未放大時只保留瀏覽器的垂直手勢，左右滑動交給上面的切換照片處理；
          // 放大後要拖曳移動圖片，才完全接手所有觸控手勢
          touchAction: scale > 1 ? "none" : "pan-y",
        }}
      >
        <img
          src={photo.url}
          alt={photo.filename}
          referrerPolicy="no-referrer"
          // 檢視器裡最重要的就是這張大圖，請瀏覽器優先下載
          fetchPriority="high"
          className="max-h-full max-w-full rounded-xl object-contain"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: "transform 0.1s",
            boxShadow: "0 16px 60px rgba(0,0,0,0.5)",
          }}
          draggable={false}
        />
        <button
          type="button"
          onClick={() => goTo(-1)}
          disabled={currentIndex === 0}
          className={`absolute left-3 h-[46px] w-[46px] sm:left-[22px] ${roundBtn}`}
          aria-label={t("viewerPrev")}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={currentIndex === photos.length - 1}
          className={`absolute right-3 h-[46px] w-[46px] sm:right-[22px] ${roundBtn}`}
          aria-label={t("viewerNext")}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 底部控制列 */}
      <div className="flex flex-col items-center gap-3 px-5 pt-3 pb-[18px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => zoom(-ZOOM_STEP)}
            className={`h-[34px] w-[34px] ${roundBtn}`}
            aria-label={t("viewerZoomOut")}
          >
            <Minus size={14} />
          </button>
          <span className="rounded-full bg-white/[0.12] px-[18px] py-[7px] text-[13px] tabular-nums">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={() => zoom(ZOOM_STEP)}
            className={`h-[34px] w-[34px] ${roundBtn}`}
            aria-label={t("viewerZoomIn")}
          >
            <Plus size={14} />
          </button>
          {onDownload && (
            <button
              type="button"
              onClick={() => onDownload(currentIndex)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-5 py-[9px] text-[13px] font-semibold text-[var(--color-on-primary)] transition-all hover:brightness-[1.07] active:scale-95"
            >
              <Download size={14} />
              {t("downloadSingle")}
            </button>
          )}
        </div>

        {/* 縮圖列：每張縮圖都是按鈕，鍵盤也能跳到指定照片 */}
        <div className="flex max-w-[90%] gap-1.5 overflow-x-auto px-1 py-0.5">
          {photos.map((thumb, i) => {
            const isCurrent = i === currentIndex;
            return (
              <button
                key={thumb.id}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={t("viewerThumbnail", { index: i + 1 })}
                aria-current={isCurrent ? "true" : undefined}
                className="shrink-0 cursor-pointer rounded-lg"
              >
                <img
                  src={thumb.url}
                  alt=""
                  referrerPolicy="no-referrer"
                  // 縮圖可能有上百張：只下載捲到附近的，且讓位給上面的大圖
                  loading="lazy"
                  fetchPriority="low"
                  className="h-12 w-12 rounded-lg object-cover transition-opacity duration-200"
                  style={{
                    opacity: isCurrent ? 1 : 0.45,
                    boxShadow: isCurrent
                      ? "0 0 0 2px var(--color-primary)"
                      : "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        <span className="text-[11.5px] text-[#f3ede4]/35">
          {t("viewerHint")}
        </span>
      </div>
    </dialog>
  );
}
