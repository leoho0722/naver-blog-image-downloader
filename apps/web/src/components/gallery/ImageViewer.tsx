import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";

import type { PhotoEntity } from "../../lib/api/types";

interface ImageViewerProps {
  photos: PhotoEntity[];
  initialIndex: number;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.5;

export default function ImageViewer({
  photos,
  initialIndex,
  onClose,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const zoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
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
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goTo, zoom]);

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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="圖片檢視器"
    >
      {/* 頂部列 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        <span className="text-sm text-white/80">
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
          aria-label="關閉"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 圖片 */}
      <div
        className="h-full w-full overflow-hidden"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? "grab" : "default", touchAction: "none" }}
      >
        <img
          src={photo.url}
          alt={photo.filename}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* 左右導航按鈕 */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={() => goTo(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 hover:bg-black/60"
          aria-label="上一張"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      {currentIndex < photos.length - 1 && (
        <button
          type="button"
          onClick={() => goTo(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 hover:bg-black/60"
          aria-label="下一張"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
