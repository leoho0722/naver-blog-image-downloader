import { describe, expect, it } from "vitest";

import {
  getQuickToggleTheme,
  QUICK_TOGGLE_LABEL_KEYS,
  type ColorScheme,
} from "../../../lib/config/ui-controls";
import type { ThemeMode } from "../../../lib/stores/use-settings-store";

/** 依「按下前的主題」與作業系統設定，推算畫面當下實際呈現的配色 */
function resolve(theme: ThemeMode, system: ColorScheme): ColorScheme {
  return theme === "system" ? system : theme;
}

describe("getQuickToggleTheme", () => {
  // spectra-scenario: web-settings / Toggle picks the opposite of what the user sees / theme after one activation
  it.each([
    ["system", "light", "light", "dark"],
    ["system", "dark", "dark", "light"],
    ["dark", "light", "dark", "system"],
    ["light", "dark", "light", "system"],
    ["dark", "dark", "dark", "light"],
    ["light", "light", "light", "dark"],
  ] as const)(
    "主題 %s、系統 %s（畫面為 %s）按一下後變成 %s",
    (before, system, rendered, after) => {
      expect(resolve(before, system)).toBe(rendered);
      expect(getQuickToggleTheme(rendered, system)).toBe(after);
    },
  );

  // spectra-scenario: web-settings / Toggle picks the opposite of what the user sees
  it("按下後畫面一定換成相反的配色", () => {
    for (const system of ["light", "dark"] as const) {
      for (const theme of ["system", "light", "dark"] as const) {
        const rendered = resolve(theme, system);
        const next = getQuickToggleTheme(rendered, system);
        expect(resolve(next, system)).not.toBe(rendered);
      }
    }
  });
});

describe("QUICK_TOGGLE_LABEL_KEYS", () => {
  it("目前亮色時描述「切換為暗色」，目前暗色時描述「切換為亮色」", () => {
    expect(QUICK_TOGGLE_LABEL_KEYS.light).toBe("settingsSwitchToDark");
    expect(QUICK_TOGGLE_LABEL_KEYS.dark).toBe("settingsSwitchToLight");
  });
});
