import { useEffect } from "react";

/**
 * usePageMeta — 在掛載時設定 `document.title` 與 `<meta name="description">`，
 * 卸載時把 `document.title` 還原為原本的值，避免影響其他路由。
 *
 * 適合只有單一 HTML 入口（如 Vite SPA）的情境，在還沒引入 react-helmet
 * 或 SSR 解決方案之前，提供最小可行的頁面級 meta 設定。
 *
 * 說明：
 * - title 為必要：每次 title 或 description 變動都會即時反映。
 * - description 為選填：若提供，會確保 `<head>` 中存在一個
 *   `<meta name="description">` 並把其 content 設為傳入的值；
 *   卸載時保留該 meta（避免頻繁新增 / 刪除造成 flicker），
 *   只在下次掛載時再覆寫。
 *
 * @param title 本次頁面要顯示的 document.title
 * @param description 本次頁面要套用的 meta description（選填）
 */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description !== undefined) {
      let metaEl = document.head.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (!metaEl) {
        metaEl = document.createElement("meta");
        metaEl.name = "description";
        document.head.appendChild(metaEl);
      }
      metaEl.content = description;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
