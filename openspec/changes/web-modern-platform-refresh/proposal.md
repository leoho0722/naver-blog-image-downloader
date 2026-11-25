## Summary

依 modern-web-guidance（Chrome 團隊維護的現代 Web 最佳實踐指南）把 `apps/web` 的主題切換、對話框、設定浮層、字型與圖片載入、表單無障礙改用瀏覽器原生能力，移除手刻的焦點管理與 Esc 監聽，並修正指南點出的效能與無障礙缺口。

## Motivation

- **主題閃爍與錯誤的原生 UI 配色**：目前主題靠 JS bundle 執行後才在 `<html>` 加上 `.dark` class，深色模式使用者重新整理時會先看到亮色畫面；`color-scheme` 也被寫死成 `light`，捲軸、表單控制項不會跟著系統變暗。legacy-scan 已標出 `apps/web/src/lib/stores/use-settings-store.ts` 這個問題。
- **頁首主題鈕是三段循環**：常駐在頁首的快切鈕「系統 → 亮色 → 暗色」需要按兩下才能回到想要的畫面，且看不出按下去會變什麼；指南建議常駐快切採兩段式（系統預設 ↔ 目前畫面的相反主題）。
- **三個浮層的焦點沒有鎖住**：圖片檢視器、歡迎卡、打包進度都是 `div` + `role="dialog"` 手刻，按 Tab 會跑到背後的頁面、背景仍可被螢幕報讀器讀到、關閉後焦點不會回到原本的按鈕，背景頁面也能被捲動。
- **設定選單的無障礙標記錯誤**：`role="menu"` 讓螢幕報讀器期待方向鍵選單操作，實際內容卻是一般按鈕；外加一層全螢幕透明遮罩來處理點外面關閉。
- **載入效能**：字型用 CSS `@import` 串接載入（CSS → 字型 CSS → 字型檔，一層等一層）；每張照片卡都掛 `will-change`；圖片檢視器一打開就同時下載所有原圖縮圖；相簿第一張圖也被 lazy load。
- **表單無障礙**：網址輸入框沒有 label、錯誤訊息不會被朗讀、輸入框字級 15px 會讓 iOS Safari 聚焦時自動放大畫面。

## Proposed Solution

1. **主題**：`index.html` 宣告 `<meta name="color-scheme">` 並以極小的 inline script 在第一次繪製前套用已儲存的主題；`index.css` 的色彩 token 改用 `light-dark()`，`:root` 的 `color-scheme` 依 meta 內容對應；`useSettingsStore` 改寫 meta 而非切換 class，選「系統」時移除 localStorage 紀錄，並監聽其他分頁的變更。頁首快切鈕改兩段式，圖示顯示目前實際主題、無障礙名稱描述按下去的動作；設定浮層內的三段式選擇保留。
2. **對話框**：圖片檢視器、歡迎卡、打包進度改用原生 `<dialog>` + `showModal()`，由共用 hook 統一開啟、關閉與狀態同步；以 CSS 阻止背景頁面捲動。打包進行中不可被 Esc 關閉，打包完成或失敗後可用 Esc 關閉；進度條改原生 `<progress>`。
3. **設定浮層**：改用 Popover API（`popover="auto"` + `popovertarget`），由瀏覽器處理點外面關閉、Esc 與焦點歸還，移除錯誤的 menu 角色；以 CSS anchor positioning 定位，不支援時改由 script 定位；舊瀏覽器以功能偵測條件載入 popover polyfill。
4. **效能**：字型改由 HTML 的 `preconnect` + `<link rel="stylesheet">` 載入；移除照片卡的 `will-change`；相簿前幾張照片不 lazy、第一張提高下載優先序；檢視器縮圖 lazy + 降低優先序。
5. **表單與無障礙**：網址輸入框加上（視覺隱藏的）label、關閉自動校正、Enter 鍵標示「前往」、字級 16px、錯誤訊息與輸入框關聯並主動朗讀；擷取進度改為有序清單並標示目前步驟；選取模式下照片卡回報是否已選取；檢視器縮圖改為可用鍵盤操作的按鈕，所有無障礙名稱 i18n 化。

## Non-Goals (optional)

（見 design.md 的 Goals / Non-Goals）

## Impact

- Affected specs: web-app-foundation, web-settings, web-image-viewer, web-download-flow, web-blog-input, web-photo-gallery
- Affected code:
  - Modified:
    - apps/web/index.html
    - apps/web/package.json
    - apps/web/pnpm-lock.yaml
    - apps/web/CLAUDE.md
    - apps/web/src/main.tsx
    - apps/web/src/index.css
    - apps/web/src/lib/stores/use-settings-store.ts
    - apps/web/src/lib/config/ui-controls.ts
    - apps/web/src/components/layout/AppHeaderControls.tsx
    - apps/web/src/components/layout/ThemeLocaleControls.tsx
    - apps/web/src/components/gallery/ImageViewer.tsx
    - apps/web/src/components/gallery/PhotoCard.tsx
    - apps/web/src/components/gallery/PhotoGrid.tsx
    - apps/web/src/components/onboarding/OnboardingCard.tsx
    - apps/web/src/components/download/DownloadProgress.tsx
    - apps/web/src/components/blog-input/BlogInputForm.tsx
    - apps/web/src/components/blog-input/FetchProgress.tsx
    - apps/web/src/lib/i18n/messages/zh-TW.json
    - apps/web/src/lib/i18n/messages/en.json
    - apps/web/src/lib/i18n/messages/ja.json
    - apps/web/src/lib/i18n/messages/ko.json
    - apps/web/src/__tests__/setup.ts
    - apps/web/src/__tests__/components/layout/AppLayout.test.tsx
    - apps/web/src/__tests__/components/onboarding/OnboardingCard.test.tsx
    - apps/web/src/__tests__/components/gallery/ImageViewer.test.tsx
    - apps/web/src/__tests__/components/gallery/PhotoCard.test.tsx
  - New:
    - apps/web/src/lib/hooks/use-modal-dialog.ts
    - apps/web/src/lib/hooks/use-color-scheme.ts
    - apps/web/src/__tests__/lib/stores/use-settings-store.test.ts
    - apps/web/src/__tests__/lib/config/ui-controls.test.ts
    - apps/web/src/__tests__/lib/hooks/use-modal-dialog.test.tsx
    - apps/web/src/__tests__/components/layout/AppHeaderControls.test.tsx
    - apps/web/src/__tests__/components/download/DownloadProgress.test.tsx
    - apps/web/src/__tests__/components/blog-input/BlogInputForm.test.tsx
  - Removed: none
