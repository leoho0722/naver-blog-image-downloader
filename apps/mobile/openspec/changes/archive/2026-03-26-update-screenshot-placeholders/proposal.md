## Why

GitHub Pages 著陸頁（`docs/index.html`）的「畫面預覽」區塊及 Hero 區塊目前使用 Material Icons 作為佔位符，無法呈現 App 的實際畫面。使用者已將 iOS 與 Android 的截圖放入 `docs/images/`，需要將所有佔位符替換為真實截圖，以提升著陸頁的視覺完整度。

## What Changes

- 將 Hero 區塊的 `phone-mockup` 佔位符替換為實際 App 截圖
- 將 Screenshots 區塊的 4 張 screenshot-card 從 icon 佔位符改為實際截圖，並以平台切換 Tab（iOS / Android）方式呈現，取代同卡並排，讓單張圖片更大更清晰
- 更新 `docs/css/style.css` 樣式以支援 Tab 切換與圖片顯示
- 在 `docs/js/main.js` 新增 Tab 切換邏輯
- 更新 `docs/js/i18n.js` 翻譯條目（移除 placeholder、新增 Tab 標籤、移除 hero mockupLabel）

## Non-Goals

- 不處理 OG image（`og-image.png`）的更新
- 不調整截圖區塊與 Hero 區塊以外的頁面結構或樣式

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

（無）

## Impact

- 受影響檔案：
  - `docs/index.html` — Hero 區塊與截圖區塊 HTML 結構
  - `docs/css/style.css` — Hero mockup 樣式、截圖卡片預覽區樣式、Tab 樣式
  - `docs/js/main.js` — 新增平台 Tab 切換邏輯
  - `docs/js/i18n.js` — 翻譯條目更新
- 受影響圖片資源（僅引用，不修改）：
  - `docs/images/blog_input_view_ios_snapshot.png`
  - `docs/images/blog_input_view_android_snapshot.png`
  - `docs/images/photo_gallery_view_ios_snapshot.png`
  - `docs/images/photo_gallery_view_android_snapshot.png`
  - `docs/images/photo_detail_view_ios_snapshot.png`
  - `docs/images/photo_detail_view_android_snapshot.png`
  - `docs/images/setting_view_ios_snapshot.png`
  - `docs/images/setting_view_android_snapshot.png`
