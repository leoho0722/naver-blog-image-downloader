import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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

export interface AnchorLink {
  /** 頁內錨點 hash（例如 `#features`） */
  href: string;
  /** i18n key */
  labelKey: string;
}

interface Props {
  /** 若提供，渲染在品牌旁邊的頁內錨點 */
  anchorLinks?: AnchorLink[];
}

export default function IntroNav({ anchorLinks }: Props) {
  const { t } = useTranslation();
  const { theme, locale, updateTheme, updateLocale } = useSettingsStore();
  const [scrolled, setScrolled] = useState(false);

  // 捲動時加 shadow，與原 docs/mobile 視覺一致
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    updateTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  return (
    <header
      className={`sticky top-0 z-10 backdrop-blur transition-shadow duration-200 ${
        scrolled
          ? "shadow-[var(--shadow-soft)] bg-[var(--color-surface)]/90"
          : "bg-[var(--color-surface)]/60"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
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

        {anchorLinks && anchorLinks.length > 0 && (
          <nav className="hidden items-center gap-1 md:flex">
            {anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        )}

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
      </div>
    </header>
  );
}
