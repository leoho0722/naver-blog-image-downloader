import { useTranslation } from "react-i18next";

import {
  getQuickToggleTheme,
  LOCALES,
  LOCALE_LABELS,
  QUICK_TOGGLE_LABEL_KEYS,
  THEME_ICONS,
} from "../../lib/config/ui-controls";
import { useColorScheme } from "../../lib/hooks/use-color-scheme";
import { useSettingsStore } from "../../lib/stores/use-settings-store";

export default function ThemeLocaleControls() {
  const { t } = useTranslation();
  const { locale, updateTheme, updateLocale } = useSettingsStore();
  const { resolvedScheme, systemScheme } = useColorScheme();
  // 兩段式主題鈕：名稱描述按下去的動作，圖示顯示目前畫面的配色
  const quickToggleLabel = t(QUICK_TOGGLE_LABEL_KEYS[resolvedScheme]);

  return (
    <>
      <div className="flex gap-0.5 rounded-full bg-[var(--color-surface-container)] p-0.5">
        {LOCALES.map((nextLocale) => {
          const isActive = locale === nextLocale;
          return (
            <button
              key={nextLocale}
              type="button"
              onClick={() => updateLocale(nextLocale)}
              aria-pressed={isActive}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
              }`}
            >
              {LOCALE_LABELS[nextLocale]}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() =>
          updateTheme(getQuickToggleTheme(resolvedScheme, systemScheme))
        }
        className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-all duration-200 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
        aria-label={quickToggleLabel}
        title={quickToggleLabel}
      >
        {THEME_ICONS[resolvedScheme]}
      </button>
    </>
  );
}
