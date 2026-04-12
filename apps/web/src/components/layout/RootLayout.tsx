import { useTranslation } from "react-i18next";
import { Outlet, Link } from "react-router-dom";

import {
  useSettingsStore,
  type AppLocale,
  type ThemeMode,
} from "../../lib/stores/use-settings-store";

const THEME_ICONS: Record<ThemeMode, string> = {
  system: "◐",
  light: "☀",
  dark: "☾",
};

const THEME_CYCLE: ThemeMode[] = ["system", "light", "dark"];

const LOCALE_LABELS: Record<AppLocale, string> = {
  "zh-TW": "繁中",
  en: "EN",
  ja: "日",
  ko: "한",
};

const LOCALES: AppLocale[] = ["zh-TW", "en", "ja", "ko"];

export default function RootLayout() {
  const { t } = useTranslation();
  const { theme, locale, updateTheme, updateLocale } = useSettingsStore();

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    updateTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  return (
    <div className="bg-noise mx-auto min-h-screen max-w-5xl px-5">
      <header className="animate-fade-in flex items-center gap-3 border-b border-[var(--color-outline-variant)]/30 py-5">
        <Link
          to="/"
          className="mr-auto text-lg tracking-tight"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
          }}
        >
          {t("appTitle")}
        </Link>

        <div className="flex gap-0.5 rounded-full bg-[var(--color-surface-container)] p-0.5">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => updateLocale(l)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                locale === l
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
              }`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={cycleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-all duration-200 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
          aria-label={`切換主題（目前：${theme}）`}
          title={theme}
        >
          {THEME_ICONS[theme]}
        </button>
      </header>
      <main className="relative z-1">
        <Outlet />
      </main>
    </div>
  );
}
