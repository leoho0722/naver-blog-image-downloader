## 1. Bug 1：修正首頁導頁邏輯（Fetch photos with three-phase progress）

- [x] 1.1 修正 Fetch photos with three-phase progress 的導頁邏輯：`apps/web/src/pages/HomePage.tsx` 移除 `hasResetRef` 宣告與相關 `useRef` import，將 `useEffect` 簡化為先 `navigate()` 再 `reset()`
- [x] 1.2 修正 `apps/web/src/lib/stores/use-blog-input-store.ts`：filename 擷取加上 `decodeURIComponent()`，對應 Encoded filename decoding scenario

## 2. Bug 2：修正圖片顯示（Responsive photo grid layout + Full-screen image overlay）

- [x] 2.1 修正 Responsive photo grid layout 的圖片載入：`apps/web/src/components/gallery/PhotoCard.tsx` 的 `<img>` 加上 `referrerPolicy="no-referrer"`
- [x] 2.2 修正 Full-screen image overlay 的圖片載入：`apps/web/src/components/gallery/ImageViewer.tsx` 的 `<img>` 加上 `referrerPolicy="no-referrer"`

## 3. 測試（HomePage navigation flow tests）

- [x] 3.1 新增 HomePage navigation flow tests：`apps/web/src/__tests__/pages/HomePage.test.tsx` 測試 fetchPhase completed 時導航並傳入正確 state
- [x] 3.2 同檔案：測試 navigate 後 store 被 reset 為 idle（Store reset after navigation scenario）
- [x] 3.3 同檔案：測試 fetchPhase 非 completed 時不導航（No navigation when not completed scenario）

## 4. 版號與驗證

- [x] 4.1 `apps/web/package.json` patch bump `1.0.0` → `1.0.1`
- [x] 4.2 執行 `pnpm build` 確認 TypeScript 編譯通過
- [x] 4.3 執行 `pnpm test` 確認全部測試通過
