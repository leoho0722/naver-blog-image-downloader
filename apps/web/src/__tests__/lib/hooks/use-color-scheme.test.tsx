import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 可控制的 matchMedia：測試裡用 setSystemDark() 模擬作業系統切換亮暗，
 * 並觸發所有已註冊的 change 監聽。
 */
function installControllableMatchMedia(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<() => void>();
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    get matches() {
      return dark;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: () => void) =>
      listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return {
    setSystemDark(next: boolean) {
      dark = next;
      listeners.forEach((cb) => cb());
    },
    restore() {
      window.matchMedia = original;
    },
  };
}

async function loadModules() {
  vi.resetModules();
  const store = await import("../../../lib/stores/use-settings-store");
  const hook = await import("../../../lib/hooks/use-color-scheme");
  return { useSettingsStore: store.useSettingsStore, ...hook };
}

describe("useColorScheme", () => {
  let media: ReturnType<typeof installControllableMatchMedia>;

  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML =
      '<meta name="color-scheme" content="light dark" />';
  });

  afterEach(() => {
    media.restore();
  });

  it("選「系統」時跟著作業系統，作業系統切換後自動更新", async () => {
    media = installControllableMatchMedia(false);
    const { useColorScheme } = await loadModules();
    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toEqual({
      resolvedScheme: "light",
      systemScheme: "light",
    });

    act(() => media.setSystemDark(true));

    expect(result.current).toEqual({
      resolvedScheme: "dark",
      systemScheme: "dark",
    });
  });

  // spectra-scenario: web-settings / OS change keeps a stored override
  it("手動選暗色後，作業系統改成暗色再改回亮色，仍保留暗色", async () => {
    media = installControllableMatchMedia(false);
    const { useColorScheme, useSettingsStore } = await loadModules();
    const { result } = renderHook(() => useColorScheme());

    act(() => useSettingsStore.getState().updateTheme("dark"));
    expect(localStorage.getItem("theme")).toBe("dark");

    act(() => media.setSystemDark(true));
    expect(localStorage.getItem("theme")).toBe("dark");

    act(() => media.setSystemDark(false));
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(result.current.resolvedScheme).toBe("dark");
  });
});
