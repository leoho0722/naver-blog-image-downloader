## Why

目前 `docs/` 目錄為扁平結構，僅存放 App 介紹頁內容。隨著 monorepo 納入 backend 與未來的 web 元件，需要將文件目錄依元件分層，讓 GitHub Pages 能同時承載 App 介紹頁與未來 Web 版前端，並提供統一的專案入口頁面。

## What Changes

- 將現有 `docs/` 下的所有 App 介紹頁內容（`index.html`、`css/`、`js/`、`images/`、`mobile-architecture.md`）搬入 `docs/mobile/`
- 新建 `docs/index.html` 作為專案介紹 landing page，含專案簡介與導航連結至 `/mobile/`（App）與 `/web/`（Web）
- 建立 `docs/web/` 預留目錄，放置 placeholder `index.html`（標示「即將推出」）
- 更新 `docs/mobile/index.html` 內的 CSS/JS/images 相對路徑
- 更新 `.github/workflows/mobile-deploy-pages.yml` 的 validate 步驟，對應新的 `docs/mobile/` 路徑
- 重新命名 workflow 為通用名稱（`deploy-pages.yml`），因不再只部署 mobile 內容

## Non-Goals

- 不在此次變更中實作 Web 版前端功能（僅建立預留目錄與 placeholder）
- 不變更 GitHub Pages 的 source 設定（維持 `docs/` 目錄）
- 不引入前端框架（landing page 使用純 HTML/CSS）
- 不調整 App 介紹頁的視覺設計或內容（僅搬遷與修正路徑）

## Capabilities

### New Capabilities

（無新增 spec-level 功能。本次為文件結構重構，不涉及應用程式行為變更。）

### Modified Capabilities

（無。本次變更僅影響靜態文件與 CI workflow，不涉及既有 spec 的需求變更。）

## Impact

- 受影響檔案：
  - `docs/index.html`（新建 landing page）
  - `docs/mobile/*`（從 `docs/` 搬入的現有內容）
  - `docs/mobile/index.html`（CSS/JS/images 路徑更新）
  - `docs/web/index.html`（新建 placeholder）
  - `.github/workflows/mobile-deploy-pages.yml` → 重新命名為 `deploy-pages.yml` 並更新路徑
- 受影響系統：GitHub Pages 部署（網址結構從 `/` 變為 `/`、`/mobile/`、`/web/`）
- 無 API、依賴或 backend 影響
