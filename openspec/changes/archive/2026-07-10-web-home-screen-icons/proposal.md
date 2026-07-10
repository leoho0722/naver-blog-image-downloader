## Why

Web 版目前只在 `index.html` 宣告一個 SVG favicon，沒有 `apple-touch-icon`，也沒有 web app manifest。iPhone 上的 Safari 與 Chrome（底層皆為 WebKit）不支援用 SVG 當主畫面圖示，因此使用者「加到主畫面」時看到的是網頁截圖或系統通用圖示，而不是新設計的品牌 icon。要讓主畫面顯示正確的新 icon，必須額外提供 PNG 格式的 `apple-touch-icon`；順帶補上 web app manifest，讓 Android/Chrome 的「加到主畫面」與未來 PWA 也能取得正確圖示與名稱。

## What Changes

- 新增三個 PNG icon 至 `apps/web/public/`（皆為滿版不透明綠底、無透明角，符合 iOS 自動套圓角遮罩的需求）：
  - `apple-touch-icon.png`（180×180）— iOS 主畫面圖示
  - `icon-192.png`（192×192）、`icon-512.png`（512×512）— manifest / Android 用
- `index.html` 的 `<head>` 新增 `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`，沿用現有 favicon 的絕對路徑寫法，交由 Vite 依 `base` 自動改寫成部署子路徑。
- 新增 `apps/web/public/manifest.webmanifest`，內含 `name` / `short_name` / `icons`（指向 `icon-192`、`icon-512`）/ `theme_color` / `background_color` / `display: standalone` / `start_url`。icon 的 `src`、`start_url`、`scope` 一律使用**相對路徑**，以相容 GitHub Pages 子路徑部署（`/naver-blog-image-downloader/`）。
- `index.html` 的 `<head>` 新增 `<link rel="manifest" href="/manifest.webmanifest">` 與 `apple-mobile-web-app-*` 相關 meta（`apple-mobile-web-app-capable`、`apple-mobile-web-app-title`、`apple-mobile-web-app-status-bar-style`）。
- 依版號規範 bump `apps/web/package.json`：`1.4.0 → 1.4.1`（patch，修正 icon 未正確顯示於主畫面的行為）。

## Non-Goals (optional)

- 不重新設計 icon 圖案本身（icon 已由使用者用 Claude Design 產生並下載）。
- 不改動桌面瀏覽器分頁用的 SVG favicon（`favicon.svg` 維持不變，桌面瀏覽器仍優先使用 SVG）。
- 不導入 service worker、離線快取或完整 PWA 安裝流程；本次僅提供 manifest 中繼資料與 icon，讓「加到主畫面」顯示正確。
- 不新增 Vite PWA plugin（`vite-plugin-pwa`）；以靜態檔案方式維護 manifest，降低相依與建置複雜度。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `web-app-foundation`: 新增一項需求，規範 `index.html` 的 `<head>` 除既有 SVG favicon 外，須提供 iOS `apple-touch-icon`（PNG）與 web app manifest，並將對應 PNG 資產放入 `public/`，讓 iOS/Android「加到主畫面」顯示正確的品牌 icon。

## Impact

- Affected specs: `web-app-foundation`（新增需求）
- Affected code:
  - `apps/web/index.html`（新增 `<link rel="apple-touch-icon">`、`<link rel="manifest">`、`apple-mobile-web-app-*` meta）
  - `apps/web/public/apple-touch-icon.png`（新增）
  - `apps/web/public/icon-192.png`（新增）
  - `apps/web/public/icon-512.png`（新增）
  - `apps/web/public/manifest.webmanifest`（新增）
  - `apps/web/package.json`（version bump 1.4.0 → 1.4.1）
