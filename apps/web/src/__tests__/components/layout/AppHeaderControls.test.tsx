import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import AppHeaderControls from "../../../components/layout/AppHeaderControls";

const mockUpdateLocale = vi.fn();
const mockUpdateTheme = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../../lib/stores/use-settings-store", () => ({
  useSettingsStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state = {
      theme: "system",
      locale: "zh-TW",
      updateTheme: mockUpdateTheme,
      updateLocale: mockUpdateLocale,
    };
    return selector ? selector(state) : state;
  },
}));

/** jsdom 沒有 Popover API；模擬瀏覽器在浮層開／關時派發的 toggle 事件 */
function dispatchToggle(panel: HTMLElement, newState: "open" | "closed") {
  const event = Object.assign(new Event("toggle"), {
    oldState: newState === "open" ? "closed" : "open",
    newState,
  });
  act(() => {
    panel.dispatchEvent(event);
  });
}

function renderControls() {
  render(<AppHeaderControls />);
  const trigger = screen.getByRole("button", { name: "settingsTitle" });
  const panel = document.getElementById("app-settings-panel")!;
  return { trigger, panel };
}

describe("AppHeaderControls 設定浮層", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("設定鈕以 popovertarget 指向原生 popover 面板，且不使用 menu 角色", () => {
    const { trigger, panel } = renderControls();

    expect(trigger).toHaveAttribute("popovertarget", "app-settings-panel");
    expect(trigger).not.toHaveAttribute("aria-haspopup");
    expect(panel).toHaveAttribute("popover", "auto");
    expect(panel).not.toHaveAttribute("role", "menu");
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  // spectra-scenario: web-settings / Open and light-dismiss
  it("aria-expanded 跟著浮層的開關同步", () => {
    const { trigger, panel } = renderControls();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    dispatchToggle(panel, "open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    dispatchToggle(panel, "closed");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("不支援 anchor positioning 時，打開當下由 script 放到設定鈕下方", () => {
    const { trigger, panel } = renderControls();
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      bottom: 64,
      right: 400,
    } as DOMRect);
    Object.defineProperty(panel, "offsetWidth", {
      configurable: true,
      value: 240,
    });

    dispatchToggle(panel, "open");

    expect(panel.style.top).toBe("72px");
    expect(panel.style.left).toBe("160px");
  });

  // spectra-scenario: web-settings / Language selection closes the panel
  it("選擇英文會切換語系並收起浮層", async () => {
    const { panel } = renderControls();
    const hidePopover = vi.fn();
    Object.assign(panel, { hidePopover });

    // 關閉中的 popover 在 jsdom 也會被當成隱藏，直接在面板內找按鈕
    await userEvent.click(
      within(panel).getByRole("button", { name: "English", hidden: true }),
    );

    expect(mockUpdateLocale).toHaveBeenCalledWith("en");
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it("在浮層內切換主題不會收起浮層", async () => {
    const { panel } = renderControls();
    const hidePopover = vi.fn();
    Object.assign(panel, { hidePopover });

    await userEvent.click(
      within(panel).getByRole("button", {
        name: "settingsThemeDark",
        hidden: true,
      }),
    );

    expect(mockUpdateTheme).toHaveBeenCalledWith("dark");
    expect(hidePopover).not.toHaveBeenCalled();
  });
});
