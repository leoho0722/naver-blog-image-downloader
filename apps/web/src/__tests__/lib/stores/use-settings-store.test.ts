import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import indexHtml from "../../../../index.html?raw";

/** 取得目前 <meta name="color-scheme"> 的內容 */
function colorSchemeMeta(): string | undefined {
  return (
    document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
      ?.content ?? undefined
  );
}

/** 每個測試都重新載入 store 模組，模擬「重新整理頁面」時的初始化流程 */
async function loadStore() {
  vi.resetModules();
  const mod = await import("../../../lib/stores/use-settings-store");
  return mod.useSettingsStore;
}

/** 從 index.html 取出第一段 inline script（套用已存主題的那段），在測試環境中執行 */
function runInlineThemeScript() {
  const match = indexHtml.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("index.html 找不到主題 inline script");
  new Function(match[1])();
}

describe("useSettingsStore 主題", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML =
      '<meta name="color-scheme" content="light dark" />';
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // spectra-scenario: web-settings / Switch to dark theme
  it("選暗色時 meta 變成 dark，並把 dark 存進 localStorage", async () => {
    const useSettingsStore = await loadStore();

    useSettingsStore.getState().updateTheme("dark");

    expect(colorSchemeMeta()).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  // spectra-scenario: web-settings / Switch back to system removes the stored value
  it("改回系統時 meta 回到 light dark，並刪除 localStorage 紀錄", async () => {
    const useSettingsStore = await loadStore();

    useSettingsStore.getState().updateTheme("dark");
    useSettingsStore.getState().updateTheme("system");

    expect(colorSchemeMeta()).toBe("light dark");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  // spectra-scenario: web-app-foundation / No dark class on the root element
  it("切換三種主題都不會在 <html> 加上 dark class", async () => {
    const useSettingsStore = await loadStore();

    for (const theme of ["dark", "light", "system", "dark"] as const) {
      useSettingsStore.getState().updateTheme(theme);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    }
  });

  // spectra-scenario: web-settings / Theme persists across page reload / stored value to meta content on load
  it.each([
    [null, "light dark", "system"],
    ["system", "light dark", "system"],
    ["light", "light", "light"],
    ["dark", "dark", "dark"],
    ["blue", "light dark", "system"],
  ] as const)(
    "localStorage.theme=%s 時，inline script 與 store 都套用 %s",
    async (stored, expectedMeta, expectedTheme) => {
      if (stored !== null) localStorage.setItem("theme", stored);

      runInlineThemeScript();
      expect(colorSchemeMeta()).toBe(expectedMeta);

      const useSettingsStore = await loadStore();
      expect(colorSchemeMeta()).toBe(expectedMeta);
      expect(useSettingsStore.getState().theme).toBe(expectedTheme);
    },
  );

  it("inline script 在 localStorage 無法讀取時不會丟錯，維持跟著系統", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => runInlineThemeScript()).not.toThrow();
    expect(colorSchemeMeta()).toBe("light dark");
  });

  it("localStorage 無法寫入時，本頁的主題仍會切換", async () => {
    const useSettingsStore = await loadStore();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    useSettingsStore.getState().updateTheme("light");

    expect(colorSchemeMeta()).toBe("light");
    expect(useSettingsStore.getState().theme).toBe("light");
  });

  it("缺少 color-scheme meta 時會自動補上", async () => {
    document.head.innerHTML = "";
    const useSettingsStore = await loadStore();

    useSettingsStore.getState().updateTheme("dark");

    expect(colorSchemeMeta()).toBe("dark");
  });

  // spectra-scenario: web-settings / Theme change in another tab
  it("其他分頁改了主題時，本分頁透過 storage 事件同步", async () => {
    const useSettingsStore = await loadStore();

    localStorage.setItem("theme", "dark");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: "dark" }),
    );

    expect(colorSchemeMeta()).toBe("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");

    localStorage.removeItem("theme");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: null }),
    );

    expect(colorSchemeMeta()).toBe("light dark");
    expect(useSettingsStore.getState().theme).toBe("system");
  });

  it("其他 key 的 storage 事件不會改動主題", async () => {
    const useSettingsStore = await loadStore();
    useSettingsStore.getState().updateTheme("light");

    localStorage.setItem("locale", "en");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "locale", newValue: "en" }),
    );

    expect(colorSchemeMeta()).toBe("light");
    expect(useSettingsStore.getState().theme).toBe("light");
  });
});
