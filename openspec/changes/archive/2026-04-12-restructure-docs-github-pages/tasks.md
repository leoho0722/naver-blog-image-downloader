## 1. 搬遷現有 App 介紹頁至 docs/mobile/

- [x] 1.1 建立 `docs/mobile/` 目錄，將 `docs/index.html`、`docs/css/`、`docs/js/`、`docs/images/`、`docs/mobile-architecture.md` 全部搬入
- [x] 1.2 更新 `docs/mobile/index.html` 內的相對路徑（CSS `href`、JS `src`、`<img src>`），確保指向搬遷後的 `css/`、`js/`、`images/` 位置
- [x] 1.3 確認 `docs/mobile/index.html` 在本機瀏覽器開啟後樣式與功能正常

## 2. 建立專案介紹 Landing Page

- [x] 2.1 新建 `docs/index.html`，使用純 HTML/CSS，內容包含：專案名稱與簡介（Naver Blog 圖片下載工具）、App 版入口連結（指向 `mobile/`）、Web 版入口連結（指向 `web/`，標示「即將推出」）
- [x] 2.2 Landing page 須支援 light/dark 主題（使用 `prefers-color-scheme` media query）與 RWD（手機/桌面自適應）
- [x] 2.3 確認 landing page 在本機瀏覽器開啟後排版與連結正常

## 3. 建立 docs/web/ 預留目錄

- [x] 3.1 建立 `docs/web/index.html` placeholder 頁面，標示「Web 版即將推出」並提供返回首頁連結

## 4. 更新 CI Workflow

- [x] 4.1 將 `.github/workflows/mobile-deploy-pages.yml` 重新命名為 `deploy-pages.yml`，更新 workflow `name` 為 `Deploy Pages`
- [x] 4.2 更新 `paths` 觸發條件，對應新的 workflow 檔名
- [x] 4.3 更新 validate job 的 image reference 檢查邏輯：掃描 `docs/mobile/index.html`（取代原本的 `docs/index.html`），並新增掃描 `docs/index.html`（landing page）
- [x] 4.4 確認 deploy job 的 `upload-pages-artifact` 仍指向 `docs` 目錄（不需變更）

## 5. 驗證

- [x] 5.1 本機開啟 `docs/index.html` 確認 landing page 顯示正確，點擊 App / Web 連結能正確導航
- [x] 5.2 本機開啟 `docs/mobile/index.html` 確認 App 介紹頁樣式與功能正常（CSS/JS/images 路徑無斷裂）
- [x] 5.3 本機開啟 `docs/web/index.html` 確認 placeholder 頁面顯示正確
