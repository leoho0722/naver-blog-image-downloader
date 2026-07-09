import { Check, Monitor, Moon, MoreHorizontal, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getNextTheme,
  LOCALES,
  LOCALE_FULL_LABELS,
  THEME_LABEL_KEYS,
} from "../../lib/config/ui-controls";
import type { ThemeMode } from "../../lib/stores/use-settings-store";
import { useSettingsStore } from "../../lib/stores/use-settings-store";

const THEME_ORDER: ThemeMode[] = ["system", "light", "dark"];

/** 依目前主題模式顯示對應圖示（系統／亮色／暗色） */
function ThemeIcon({ theme }: { theme: ThemeMode }) {
  if (theme === "light") return <Sun size={18} strokeWidth={2} />;
  if (theme === "dark") return <Moon size={18} strokeWidth={2} />;
  return <Monitor size={18} strokeWidth={2} />;
}

/**
 * Web app 頁首右側控制項：
 * - 主題快切按鈕（系統 → 亮色 → 暗色 循環）
 * - 設定選單（浮層）：完整主題切換 + 語言選擇
 */
export default function AppHeaderControls() {
  const { t } = useTranslation();
  const { theme, locale, updateTheme, updateLocale } = useSettingsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentThemeLabel = t(THEME_LABEL_KEYS[theme]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] transition-colors duration-200 hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]";

  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={() => updateTheme(getNextTheme(theme))}
        className={iconBtn}
        aria-label={t("settingsThemeToggle", { theme: currentThemeLabel })}
        title={currentThemeLabel}
      >
        <ThemeIcon theme={theme} />
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={iconBtn}
        aria-label={t("settingsTitle")}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal size={20} strokeWidth={2.4} />
      </button>

      {menuOpen && (
        <>
          {/* 點擊外部關閉 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            role="menu"
            className="animate-fade-in absolute top-full right-0 z-50 mt-2 w-60 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-4"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <p className="mb-2 text-xs text-[var(--color-on-surface-variant)]">
              {t("settingsAppearance")}
            </p>
            <div className="mb-4 flex gap-1 rounded-full bg-[var(--color-surface-container-high)] p-1">
              {THEME_ORDER.map((mode) => {
                const active = theme === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateTheme(mode)}
                    aria-pressed={active}
                    className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all duration-200 ${
                      active
                        ? "bg-[var(--color-primary-container)] text-[var(--color-primary)]"
                        : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                    }`}
                  >
                    {t(THEME_LABEL_KEYS[mode])}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 text-xs text-[var(--color-on-surface-variant)]">
              {t("settingsLanguage")}
            </p>
            <div className="flex flex-col gap-0.5">
              {LOCALES.map((code) => {
                const active = locale === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      updateLocale(code);
                      setMenuOpen(false);
                    }}
                    aria-pressed={active}
                    className={`flex items-center justify-between rounded-full px-3 py-2 text-sm transition-colors duration-150 ${
                      active
                        ? "bg-[var(--color-primary-container)] text-[var(--color-primary)]"
                        : "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]"
                    }`}
                  >
                    {LOCALE_FULL_LABELS[code]}
                    {active && <Check size={15} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
