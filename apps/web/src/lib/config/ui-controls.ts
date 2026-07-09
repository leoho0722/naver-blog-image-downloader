import type { AppLocale, ThemeMode } from "../stores/use-settings-store";

type ThemeLabelKey =
  | "settingsThemeSystem"
  | "settingsThemeLight"
  | "settingsThemeDark";

export const THEME_ICONS: Record<ThemeMode, string> = {
  system: "◐",
  light: "☀",
  dark: "☾",
};

export const THEME_LABEL_KEYS: Record<ThemeMode, ThemeLabelKey> = {
  system: "settingsThemeSystem",
  light: "settingsThemeLight",
  dark: "settingsThemeDark",
};

export const THEME_CYCLE: ThemeMode[] = ["system", "light", "dark"];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  "zh-TW": "繁中",
  en: "EN",
  ja: "日",
  ko: "한",
};

/** 語言的完整名稱，用於設定選單的清單呈現 */
export const LOCALE_FULL_LABELS: Record<AppLocale, string> = {
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

export const LOCALES: AppLocale[] = ["zh-TW", "en", "ja", "ko"];

export function getNextTheme(theme: ThemeMode): ThemeMode {
  const idx = THEME_CYCLE.indexOf(theme);
  return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
}
