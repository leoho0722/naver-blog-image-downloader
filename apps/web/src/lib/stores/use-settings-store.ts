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

function loadTheme(): ThemeMode {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system")
    return stored;
  return "system";
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

function applyTheme(theme: ThemeMode) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
  } else if (theme === "light") {
    html.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    html.classList.toggle("dark", prefersDark);
  }
}

const initialTheme = loadTheme();
applyTheme(initialTheme);

// 讓 <html lang> 從載入那一刻就反映實際語系，搭配後續 updateLocale 同步
document.documentElement.lang = loadLocale();

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: initialTheme,
  locale: loadLocale(),
  hasSeenOnboarding: localStorage.getItem("hasSeenOnboarding") === "true",

  updateTheme: (theme) => {
    localStorage.setItem("theme", theme);
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

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (useSettingsStore.getState().theme === "system") {
      document.documentElement.classList.toggle("dark", e.matches);
    }
  });
