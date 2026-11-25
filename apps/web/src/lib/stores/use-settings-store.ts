import i18n from "i18next";
import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";
export type AppLocale = "zh-TW" | "en" | "ja" | "ko";

interface SettingsState {
  theme: ThemeMode;
  locale: AppLocale;
  hasSeenOnboarding: boolean;

  updateTheme: (theme: ThemeMode) => void;
  updateLocale: (locale: AppLocale) => void;
  dismissOnboarding: () => void;
}

/** 主題偏好存在 localStorage 的 key；index.html 的 inline script 也讀同一個 key */
export const THEME_STORAGE_KEY = "theme";

/**
 * 把任意字串轉成合法的主題模式。
 * 只有 "light" 與 "dark" 代表使用者手動指定；其餘（沒存過、舊版存的 "system"、
 * 被竄改的奇怪值）一律當作「跟著系統」，避免畫面套到不存在的主題。
 */
function toThemeMode(value: string | null): ThemeMode {
  return value === "light" || value === "dark" ? value : "system";
}

function readStoredTheme(): ThemeMode {
  try {
    return toThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // 瀏覽器封鎖網站資料時讀取會丟錯，這時就跟著系統
    return "system";
  }
}

/**
 * 記住使用者的選擇：選「系統」時刪掉紀錄（回到預設），選亮／暗時存入字面值。
 * 寫入失敗（例如無痕模式空間不足）時安靜略過——本頁的主題照樣會切換，只是下次不會記得。
 */
function persistTheme(theme: ThemeMode) {
  try {
    if (theme === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // 無法儲存不影響當下的顯示
  }
}

/**
 * 實際套用主題：改寫 <meta name="color-scheme"> 的內容。
 * "light dark" 代表跟著系統，CSS 會自動依系統亮暗切換，不需要再用 JS 監聽；
 * "light"／"dark" 則固定為指定的配色。
 */
function applyTheme(theme: ThemeMode) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (!meta) {
    // 正常情況 index.html 已經宣告；保險起見缺少時補上，主題切換才不會失效
    meta = document.createElement("meta");
    meta.name = "color-scheme";
    document.head.prepend(meta);
  }
  meta.content = theme === "system" ? "light dark" : theme;
}

function loadLocale(): AppLocale {
  const stored = localStorage.getItem("locale");
  if (
    stored === "zh-TW" ||
    stored === "en" ||
    stored === "ja" ||
    stored === "ko"
  )
    return stored;
  return "zh-TW";
}

const initialTheme = readStoredTheme();
// index.html 的 inline script 已在畫面出現前套用過；這裡再套一次，確保兩邊一致
applyTheme(initialTheme);

// 讓 <html lang> 從載入那一刻就反映實際語系，搭配後續 updateLocale 同步
document.documentElement.lang = loadLocale();

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: initialTheme,
  locale: loadLocale(),
  hasSeenOnboarding: localStorage.getItem("hasSeenOnboarding") === "true",

  updateTheme: (theme) => {
    persistTheme(theme);
    applyTheme(theme);
    set({ theme });
  },

  updateLocale: (locale) => {
    localStorage.setItem("locale", locale);
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    set({ locale });
  },

  dismissOnboarding: () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    set({ hasSeenOnboarding: true });
  },
}));

/**
 * 使用者在另一個分頁換了主題時，這個分頁也跟著換，不必重新整理。
 * key 為 null 代表整個 localStorage 被清空，同樣重新讀一次（會回到跟著系統）。
 */
window.addEventListener("storage", (event) => {
  if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
  const theme = readStoredTheme();
  applyTheme(theme);
  useSettingsStore.setState({ theme });
});
