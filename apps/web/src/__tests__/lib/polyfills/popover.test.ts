import { afterEach, describe, expect, it, vi } from "vitest";

const polyfillLoaded = vi.hoisted(() => vi.fn());

vi.mock("@oddbird/popover-polyfill", () => {
  polyfillLoaded();
  return {};
});

import { loadPopoverPolyfillIfNeeded } from "../../../lib/polyfills/popover";

describe("loadPopoverPolyfillIfNeeded", () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "popover");
    vi.clearAllMocks();
  });

  // spectra-scenario: web-settings / Polyfill only where needed
  it("瀏覽器原生支援 popover 時不下載 polyfill", () => {
    Object.defineProperty(HTMLElement.prototype, "popover", {
      configurable: true,
      get: () => null,
    });

    expect(loadPopoverPolyfillIfNeeded()).toBeNull();
    expect(polyfillLoaded).not.toHaveBeenCalled();
  });

  it("瀏覽器缺少 popover 時才載入 polyfill", async () => {
    expect(Object.hasOwn(HTMLElement.prototype, "popover")).toBe(false);

    await loadPopoverPolyfillIfNeeded();

    expect(polyfillLoaded).toHaveBeenCalledTimes(1);
  });
});
