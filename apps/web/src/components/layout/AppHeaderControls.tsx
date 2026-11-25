import { Check, Moon, MoreHorizontal, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getQuickToggleTheme,
  LOCALES,
  LOCALE_FULL_LABELS,
  QUICK_TOGGLE_LABEL_KEYS,
  THEME_LABEL_KEYS,
  type ColorScheme,
} from "../../lib/config/ui-controls";
import { useColorScheme } from "../../lib/hooks/use-color-scheme";
import type { ThemeMode } from "../../lib/stores/use-settings-store";
import { useSettingsStore } from "../../lib/stores/use-settings-store";

const THEME_ORDER: ThemeMode[] = ["system", "light", "dark"];

/** 設定浮層的 id：設定鈕透過 popovertarget 指向它 */
const SETTINGS_PANEL_ID = "app-settings-panel";

/** 浮層與設定鈕之間的間距（px），與 CSS 的 margin-block-start: 0.5rem 一致 */
const PANEL_GAP = 8;

/** 瀏覽器是否支援 CSS anchor positioning（支援時位置完全交給 CSS） */
function supportsAnchorPositioning(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("position-area", "block-end")
  );
}

/**
 * 不支援 anchor positioning 的瀏覽器：在浮層打開當下，
 * 用設定鈕的位置把浮層放在它正下方、右緣對齊（太靠左時保留一點邊距）。
 */
function positionBelowTrigger(panel: HTMLElement, trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect();
  const left = Math.max(PANEL_GAP, rect.right - panel.offsetWidth);
  panel.style.top = `${rect.bottom + PANEL_GAP}px`;
  panel.style.left = `${left}px`;
}

/** 顯示目前畫面實際的配色：亮色是太陽、暗色是月亮（選「系統」時依作業系統而定） */
function ThemeIcon({ scheme }: { scheme: ColorScheme }) {
  if (scheme === "dark") return <Moon size={18} strokeWidth={2} />;
  return <Sun size={18} strokeWidth={2} />;
}

/**
 * Web app 頁首右側控制項：
 * - 主題快切按鈕（兩段式：切到目前畫面的相反配色；與系統相同時回到「跟著系統」）
 * - 設定浮層（原生 popover）：完整主題切換 + 語言選擇
 *   點外面或按 Esc 由瀏覽器自動關閉，焦點會回到設定鈕；
 *   面板內是一般按鈕（用 Tab 移動），所以刻意不使用 menu 角色。
 */
export default function AppHeaderControls() {
  const { t } = useTranslation();
  const { theme, locale, updateTheme, updateLocale } = useSettingsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedScheme, systemScheme } = useColorScheme();
  // 按鈕名稱描述「按下去會變成什麼」，例如目前亮色時是「切換為暗色主題」
  const quickToggleLabel = t(QUICK_TOGGLE_LABEL_KEYS[resolvedScheme]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 浮層開關由瀏覽器處理；這裡只監聽 toggle 事件，
  // 讓設定鈕的 aria-expanded 跟著同步，並在需要時補上位置計算
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const handleToggle = (event: Event) => {
      const isOpen = (event as ToggleEvent).newState === "open";
      setMenuOpen(isOpen);
      if (isOpen && triggerRef.current && !supportsAnchorPositioning()) {
        positionBelowTrigger(panel, triggerRef.current);
      }
    };
    panel.addEventListener("toggle", handleToggle);
    return () => panel.removeEventListener("toggle", handleToggle);
  }, []);

  /** 選完語言就收起浮層（polyfill 尚未載入的舊瀏覽器沒有 hidePopover，略過即可） */
  const closePanel = () => {
    const panel = panelRef.current;
    if (panel && typeof panel.hidePopover === "function") panel.hidePopover();
  };

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] transition-colors duration-200 hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]";

  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={() =>
          updateTheme(getQuickToggleTheme(resolvedScheme, systemScheme))
        }
        className={iconBtn}
        aria-label={quickToggleLabel}
        title={quickToggleLabel}
      >
        <ThemeIcon scheme={resolvedScheme} />
      </button>

      <button
        ref={triggerRef}
        type="button"
        popoverTarget={SETTINGS_PANEL_ID}
        className={`settings-trigger ${iconBtn}`}
        aria-label={t("settingsTitle")}
        aria-expanded={menuOpen}
      >
        <MoreHorizontal size={20} strokeWidth={2.4} />
      </button>

      {/*
        設定浮層：緊接在設定鈕後面（瀏覽器才不會額外加上多餘的關聯說明）。
        一直存在於 DOM 中，關閉時由瀏覽器隱藏；位置與外觀見 index.css 的 .settings-popover。
      */}
      <div
        ref={panelRef}
        id={SETTINGS_PANEL_ID}
        popover="auto"
        role="group"
        aria-label={t("settingsTitle")}
        className="settings-popover animate-fade-in w-60 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-4 text-[var(--color-on-surface)]"
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
                  closePanel();
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
    </div>
  );
}
