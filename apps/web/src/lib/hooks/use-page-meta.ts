import { useEffect } from "react";

/**
 * usePageMeta — 在掛載時設定 `document.title` 與 `<meta name="description">`，
 * 卸載時把兩者都還原為掛載前的狀態，避免影響其他路由。
 *
 * 適合只有單一 HTML 入口（如 Vite SPA）的情境，在還沒引入 react-helmet
 * 或 SSR 解決方案之前，提供最小可行的頁面級 meta 設定。
 *
 * 行為：
 * - title：每次掛載記住先前的 `document.title`，unmount 時還原。
 * - description（選填）：每次掛載記住先前 meta description 的 `content`；
 *   若先前不存在，unmount 時移除此次掛載新增的 meta 元素；若先前有，
 *   unmount 時還原先前的 content，避免本頁 description 在離開後被其他
 *   頁面繼承（造成 SEO 上的錯誤 meta）。
 *
 * @param title 本次頁面要顯示的 document.title
 * @param description 本次頁面要套用的 meta description（選填）
 */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    let previousDescription: string | null = null;
    let descriptionMetaExisted = false;

    document.title = title;

    if (description !== undefined) {
      let metaEl = document.head.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (metaEl) {
        descriptionMetaExisted = true;
        previousDescription = metaEl.content;
      } else {
        metaEl = document.createElement("meta");
        metaEl.name = "description";
        document.head.appendChild(metaEl);
      }
      metaEl.content = description;
    }

    return () => {
      document.title = previousTitle;

      if (description !== undefined) {
        const metaEl = document.head.querySelector<HTMLMetaElement>(
          'meta[name="description"]',
        );
        if (!metaEl) {
          return;
        }
        if (descriptionMetaExisted) {
          metaEl.content = previousDescription ?? "";
        } else {
          metaEl.remove();
        }
      }
    };
  }, [title, description]);
}
