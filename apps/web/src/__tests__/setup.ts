import "@testing-library/jest-dom/vitest";

/*
 * Node 25 之後內建了全域的 localStorage／sessionStorage，但沒有指定儲存檔時值是 undefined，
 * 會蓋掉 jsdom 提供的瀏覽器版本，導致測試裡讀寫 localStorage 直接出錯。
 * 這裡在被蓋掉的情況下，改回使用 jsdom 的 Web Storage。
 */
const jsdomWindow = (globalThis as { jsdom?: { window: Window } }).jsdom
  ?.window;
if (jsdomWindow) {
  for (const key of ["localStorage", "sessionStorage"] as const) {
    if (!globalThis[key]) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        value: jsdomWindow[key],
      });
    }
  }
}

/*
 * jsdom 沒有實作 window.matchMedia。這裡補一個「永遠不符合」的最小版本，
 * 等同作業系統偏好亮色；需要模擬暗色或切換的測試會自行覆寫。
 */
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

/*
 * jsdom 的 <dialog> 只有 open 屬性，沒有 showModal()／close()。
 * 補上最小版本：showModal 只負責打開；close 會關閉並派發 close 事件，和瀏覽器一樣。
 * 焦點鎖定、背景不可操作等原生行為 jsdom 模擬不了，交給瀏覽器實測驗證。
 */
if (
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal !== "function"
) {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}
