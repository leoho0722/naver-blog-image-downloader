/**
 * 舊版瀏覽器沒有原生 Popover API（頁首設定浮層會用到）時，才另外下載 polyfill。
 *
 * 用「HTMLElement.prototype 本身有沒有 popover 屬性」判斷是否原生支援；
 * 新版瀏覽器不會下載這段程式，打包後 polyfill 也會是獨立的檔案。
 *
 * @returns 需要載入時回傳載入中的 Promise；原生支援時回傳 null
 */
export function loadPopoverPolyfillIfNeeded(): Promise<unknown> | null {
  if (Object.hasOwn(HTMLElement.prototype, "popover")) return null;
  return import("@oddbird/popover-polyfill");
}
