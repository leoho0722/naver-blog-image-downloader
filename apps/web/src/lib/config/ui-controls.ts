import type { AppLocale, ThemeMode } from "../stores/use-settings-store";

/** 畫面實際呈現的配色；「系統」模式會依作業系統的設定解析成其中一種 */
export type ColorScheme = "light" | "dark";

type ThemeLabelKey =
  | "settingsThemeSystem"
  | "settingsThemeLight"
  | "settingsThemeDark";

type QuickToggleLabelKey = "settingsSwitchToDark" | "settingsSwitchToLight";

/** 公開頁導覽列主題鈕的圖示：顯示「目前看到的是亮色還是暗色」 */
export const THEME_ICONS: Record<ColorScheme, string> = {
  light: "☀",
  dark: "☾",
};

/** 設定浮層三段式選擇的文字 */
export const THEME_LABEL_KEYS: Record<ThemeMode, ThemeLabelKey> = {
  system: "settingsThemeSystem",
  light: "settingsThemeLight",
  dark: "settingsThemeDark",
};

/**
 * 頁首快切鈕的無障礙名稱：描述「按下去會變成什麼」，
 * 所以目前是亮色時唸「切換為暗色主題」，反之亦然。
 */
export const QUICK_TOGGLE_LABEL_KEYS: Record<ColorScheme, QuickToggleLabelKey> =
  {
    light: "settingsSwitchToDark",
    dark: "settingsSwitchToLight",
  };

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

/**
 * 頁首快切鈕按下後要套用的主題（兩段式）。
 *
 * 目標永遠是「目前畫面的相反配色」：
 * - 目標剛好等於作業系統的設定 → 回到「跟著系統」（不留下手動紀錄）
 * - 目標與作業系統不同 → 固定為該配色
 *
 * 只在按下的當下判斷；之後作業系統自己切換亮暗時，不會回頭清掉使用者的手動選擇。
 *
 * @param resolved 目前畫面實際呈現的配色
 * @param system 作業系統目前的亮暗設定
 */
export function getQuickToggleTheme(
  resolved: ColorScheme,
  system: ColorScheme,
): ThemeMode {
  const target: ColorScheme = resolved === "dark" ? "light" : "dark";
  return target === system ? "system" : target;
}
