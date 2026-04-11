## 1. 更新 HTML 截圖區塊

- [x] 1.1 將 `docs/index.html` 中 4 張 screenshot-card 的 `.screenshot-card__preview` 內容從 Material Icons 佔位符替換為 `<img>` 標籤，每張卡片放入 iOS 與 Android 兩張截圖，加上 `loading="lazy"` 與適當的 `alt` 屬性。對應關係：網址輸入 → `blog_input_view_*`、照片列表 → `photo_gallery_view_*`、照片詳情 → `photo_detail_view_*`、設定 → `setting_view_*`

## 2. 更新 CSS 樣式

- [x] 2.1 修改 `docs/css/style.css` 的 `.screenshot-card__preview` 樣式：改為 `flex-direction: row` 並排、設定 `gap: 8px`、`padding: 8px`，移除漸層背景改為單色背景
- [x] 2.2 新增 `.screenshot-card__preview img` 樣式：`flex: 1`、`max-width: 50%`、`height: auto`、`object-fit: contain`、`border-radius: 8px`
- [x] 2.3 移除或替換原有的 `.screenshot-card__preview .material-symbols-outlined` 和 `.screenshot-card__preview span:last-child` 樣式規則（不再需要 icon 樣式）

## 3. 清理 i18n 條目

- [x] 3.1 移除 `docs/js/i18n.js` 中三語（zh-Hant、en、ko）的 `screenshots.placeholder` 條目

## 4. 驗證（第一輪）

- [x] 4.1 在本機開啟 `docs/index.html` 確認四張卡片各顯示 iOS + Android 截圖並排、hover 效果正常、RWD 各斷點（桌面 4 欄 → 平板 2 欄 → 手機 2 欄 → 小螢幕 1 欄）排版正確

## 5. Hero 區塊更新

- [x] 5.1 將 `docs/index.html` Hero 區塊的 `.phone-mockup` 內 icon 佔位符（`smartphone` icon + `hero.mockupLabel` 文字）替換為 `<img>` 標籤，使用 `blog_input_view_ios_snapshot.png` 作為預設展示圖
- [x] 5.2 更新 `docs/css/style.css` 的 `.phone-mockup` 樣式：移除 flex 置中佈局，改為 `overflow: hidden` 搭配 `img` 填滿容器（`width: 100%`、`height: 100%`、`object-fit: cover`）
- [x] 5.3 移除 `docs/js/i18n.js` 中三語的 `hero.mockupLabel` 條目（不再需要佔位文字）
- [x] 5.4 移除 `docs/css/style.css` 中 `.phone-mockup .material-symbols-outlined` 和 `.phone-mockup__label` 樣式規則

## 6. Screenshots 區塊改為平台 Tab 切換

- [x] 6.1 在 `docs/index.html` 的 `.screenshots .section__header` 後方新增平台 Tab 列（iOS / Android 兩個按鈕），預設 iOS 為 active 狀態
- [x] 6.2 修改 `docs/index.html` 的 4 張 screenshot-card：每張卡片的 `.screenshot-card__preview` 內兩張 `<img>` 分別加上 `data-platform="ios"` 和 `data-platform="android"` 屬性，Android 圖片預設隱藏
- [x] 6.3 更新 `docs/css/style.css`：將 `.screenshot-card__preview` 從 `flex-direction: row` 改回 `flex-direction: column`；`.screenshot-card__preview img` 改為 `max-width: 100%`（全寬顯示）；新增 `.screenshot-card__preview img[hidden]` 樣式（`display: none`）；新增 `.platform-tabs` 及 `.platform-tab` 按鈕樣式（置中排列、active 狀態高亮）
- [x] 6.4 在 `docs/js/main.js` 新增平台 Tab 切換邏輯：點擊 Tab 時切換 active 狀態，並根據 `data-platform` 屬性切換所有截圖卡片中圖片的 `hidden` 屬性
- [x] 6.5 在 `docs/js/i18n.js` 三語中新增 `screenshots.tab.ios` 和 `screenshots.tab.android` 翻譯條目

## 7. 驗證（第二輪）

- [x] 7.1 在本機開啟 `docs/index.html` 確認：Hero 區塊顯示實際截圖、Screenshots 區塊 Tab 切換正常（iOS/Android 圖片正確切換）、RWD 各斷點排版正確、hover 效果正常
