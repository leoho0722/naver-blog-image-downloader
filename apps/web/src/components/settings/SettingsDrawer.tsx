import { useEffect, useRef } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 面板 */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="設定"
        className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto p-6 shadow-xl"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-on-surface)]">
            設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]"
            aria-label="關閉設定"
          >
            <svg
              className="h-5 w-5"
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

        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </>
  );
}
