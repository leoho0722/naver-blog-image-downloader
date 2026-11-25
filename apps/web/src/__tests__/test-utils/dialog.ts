/**
 * 模擬使用者在對話框上按 Esc（或 Android 返回手勢）。
 *
 * 瀏覽器的流程是：先派發可取消的 cancel 事件，沒有被 preventDefault() 擋下才真的關閉。
 * jsdom 不會自己做這件事，所以測試用這個函式重現同樣的順序。
 */
export function pressEscapeOn(dialog: HTMLDialogElement) {
  const cancelEvent = new Event("cancel", { cancelable: true });
  const notPrevented = dialog.dispatchEvent(cancelEvent);
  if (notPrevented) dialog.close();
}
