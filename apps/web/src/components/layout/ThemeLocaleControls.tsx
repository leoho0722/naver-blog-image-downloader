import { useTranslation } from "react-i18next";

import {
  getNextTheme,
  LOCALES,
  LOCALE_LABELS,
  THEME_ICONS,
  THEME_LABEL_KEYS,
} from "../../lib/config/ui-controls";
import { useSettingsStore } from "../../lib/stores/use-settings-store";

export default function ThemeLocaleControls() {
  const { t } = useTranslation();
  const { theme, locale, updateTheme, updateLocale } = useSettingsStore();
  const currentThemeLabel = t(THEME_LABEL_KEYS[theme]);

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
        onClick={() => updateTheme(getNextTheme(theme))}
        className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-all duration-200 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
        aria-label={t("settingsThemeToggle", { theme: currentThemeLabel })}
        title={currentThemeLabel}
      >
        {THEME_ICONS[theme]}
      </button>
    </>
  );
}
