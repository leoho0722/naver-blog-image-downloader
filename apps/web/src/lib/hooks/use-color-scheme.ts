import { useSyncExternalStore } from "react";

import type { ColorScheme } from "../config/ui-controls";
import { useSettingsStore } from "../stores/use-settings-store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** 訂閱作業系統亮暗設定的變化（例如手機依時間自動切換深色模式） */
function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(DARK_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSystemScheme(): ColorScheme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** 伺服器端或無法判斷時，先當作亮色 */
function getServerScheme(): ColorScheme {
  return "light";
}

/**
 * useColorScheme——取得「目前畫面實際是亮色還是暗色」與「作業系統目前的設定」。
 *
 * 主題選「系統」時，實際配色就等於作業系統的設定；選亮／暗時則固定。
 * 作業系統設定改變時會自動重新 render，頁首主題鈕的圖示與文字才會一直正確。
 */
export function useColorScheme(): {
  resolvedScheme: ColorScheme;
  systemScheme: ColorScheme;
} {
  const theme = useSettingsStore((s) => s.theme);
  const systemScheme = useSyncExternalStore(
    subscribe,
    getSystemScheme,
    getServerScheme,
  );
  return {
    resolvedScheme: theme === "system" ? systemScheme : theme,
    systemScheme,
  };
}
