## Why

Web 版上線後發現兩個影響核心功能的 bug：

1. **首頁狀態過早重置**：使用者貼上 Naver 網址並觸發抓圖後，`HomePage` 的 `useEffect` 在 `fetchPhase` 變為 `"completed"` 時先呼叫 `reset()` 再 return，導致 `navigate()` 永遠不會執行。使用者看到的現象是網址被清空、狀態回到 idle，無法進入相簿頁。
2. **相簿頁照片無法顯示**：Naver 圖片 CDN 檢查 HTTP `Referer` 標頭，從非 Naver 網域載入 `<img>` 時被拒絕。目前 `PhotoCard` 和 `ImageViewer` 的 `<img>` 未設定 `referrerPolicy`，瀏覽器預設送出完整 Referer 導致圖片載入失敗。

附帶問題：從 URL 擷取的韓文檔名未經 `decodeURIComponent`，在 UI 上顯示為 `%EC...` 等編碼字串。

## What Changes

- **HomePage effect 邏輯修正**：移除 `hasResetRef` 防護，改為先 `navigate()` 再 `reset()`，確保 fetch 完成後能正確導航到 gallery 頁
- **圖片 referrerPolicy**：`PhotoCard` 和 `ImageViewer` 的 `<img>` 加上 `referrerPolicy="no-referrer"`，避免 Naver CDN 因 Referer 拒絕圖片
- **檔名解碼**：`use-blog-input-store` 的 filename 擷取加上 `decodeURIComponent()`，韓文檔名正確顯示
- **首頁導頁流程測試**：新增 `HomePage.test.tsx`，鎖住 completed → navigate → reset 順序，防止回歸

## Non-Goals

- 不建立 backend 圖片代理端點（先以前端 `referrerPolicy` 修正驗證 Naver CDN 防盜鏈假設，確認不足時再考慮）
- 不重構 Zustand store 架構或 polling 機制
- 不處理圖片載入失敗的 fallback UI（非此次 bug 範圍）

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `web-blog-input`：修正 HomePage fetchPhase completed 狀態下的導頁邏輯，確保先 navigate 再 reset
- `web-photo-gallery`：PhotoCard 圖片加入 `referrerPolicy="no-referrer"`；檔名顯示改為 decoded 字串
- `web-image-viewer`：ImageViewer 圖片加入 `referrerPolicy="no-referrer"`
- `web-unit-tests`：新增 HomePage 導頁流程測試

## Impact

- 受影響程式碼：
  - `apps/web/src/pages/HomePage.tsx`
  - `apps/web/src/components/gallery/PhotoCard.tsx`
  - `apps/web/src/components/gallery/ImageViewer.tsx`
  - `apps/web/src/lib/stores/use-blog-input-store.ts`
  - `apps/web/src/__tests__/pages/HomePage.test.tsx`（新增）
  - `apps/web/package.json`（patch bump `1.0.0` → `1.0.1`）
