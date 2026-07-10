## 1. Icon 資產與 manifest

- [x] 1.1 將 `apple-touch-icon.png`（180×180）、`icon-192.png`（192×192）、`icon-512.png`（512×512）從 `/Users/leoho/Downloads/icons-png/` 複製到 `apps/web/public/`。驗證：`file apps/web/public/apple-touch-icon.png apps/web/public/icon-192.png apps/web/public/icon-512.png` 回報三個 PNG 且尺寸分別為 180×180、192×192、512×512。
- [x] 1.2 新增 `apps/web/public/manifest.webmanifest`，內含 `name`、`short_name`、`icons`（`icon-192.png` 192×192 與 `icon-512.png` 512×512，`type: image/png`）、`theme_color`、`background_color`、`display: "standalone"`、`start_url`；`icons[].src`、`start_url`、`scope` 一律使用相對路徑。驗證：`python3 -m json.tool apps/web/public/manifest.webmanifest` 解析成功，且檔內無以 `/` 或 `http` 開頭的 URL。

## 2. HTML shell 連結宣告（實作 Requirement: Home-screen and PWA icons in the HTML shell）

- [x] 2.1 在 `apps/web/index.html` 的 `<head>` 新增 `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`、`<link rel="manifest" href="/manifest.webmanifest">`，以及 `apple-mobile-web-app-capable`、`apple-mobile-web-app-title`、`apple-mobile-web-app-status-bar-style` 三個 meta；沿用既有 favicon 的 root-absolute `href` 寫法。此即交付 spec 中 `Home-screen and PWA icons in the HTML shell` 需求所要求的 `<head>` 宣告。驗證：`pnpm build` 後 `dist/index.html` 的 `<head>` 同時含 `apple-touch-icon` 與 `manifest` link，且其 `href` 皆被 Vite 改寫為帶 `base`（`/naver-blog-image-downloader/`）前綴。

## 3. 版號

- [x] 3.1 將 `apps/web/package.json` 的 `version` 由 `1.4.0` bump 至 `1.4.1`（patch，修正 icon 未正確顯示的行為）。驗證：`grep '"version"' apps/web/package.json` 顯示 `1.4.1`。

## 4. 建置與本地驗證

- [x] 4.1 執行 `pnpm build`，確認 `dist/` 產出 `apple-touch-icon.png`、`icon-192.png`、`icon-512.png`、`manifest.webmanifest` 四個檔。驗證：`ls apps/web/dist/` 列出上述四檔。
- [x] 4.2 以 `pnpm preview` 啟動預覽，透過 Claude in Chrome 開啟站台，確認 `<head>` 內 `apple-touch-icon` 與 `manifest` link 存在、manifest 於 Network 成功載入（HTTP 200）、且 manifest 內 icon URL 解析到子路徑而非網域根。驗證：瀏覽器 DevTools／Network 顯示 `manifest.webmanifest` 與 `icon-192.png` 皆為 200，Application → Manifest 面板正確顯示 icon 預覽。
