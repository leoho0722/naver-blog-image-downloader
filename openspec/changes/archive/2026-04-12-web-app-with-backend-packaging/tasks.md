## 1. 後端：PackageStore 與資料模型

- [x] 1.1 在 `src/data_models.py` 新增 `PackageStatus` enum（PROCESSING / COMPLETED / FAILED），對應 backend-image-packaging spec 的 PackageStore manages S3 state 需求
- [x] 1.2 新增 `src/job_store/package.py`，實作 `PackageStore(BaseStore)`：`create_package(job_id, indices, cache_key)`、`update_package(package_id, status, result)`、`get_package(package_id)`、`generate_download_url(package_id)`、`find_by_cache_key(cache_key)` 方法，ZIP 檔案 S3 路徑與生命週期：key 格式 `packages/{package_id}/{package_id}_results.json`，ZIP 位於 `packages/{package_id}/images.zip`，metadata 含 `cache_key` 欄位，pre-signed URL 有效期 3600 秒
- [x] 1.3 在 `src/job_store/__init__.py` 匯出 `PackageStore`

## 2. 後端：打包路由與 Worker

- [x] 2.1 在 `src/routes/photos.py` 新增 `_handle_package(body, context)`，處理 Package action accepts job_id and optional indices 需求：驗證 job_id 存在、計算 cache key、實作打包快取：同 job_id + indices 複用已完成的 ZIP（Package cache reuses existing ZIP for same job and indices），快取命中回傳 HTTP 200，否則建立新任務、非同步呼叫 worker、回傳 HTTP 202
- [x] 2.2 在 `src/routes/photos.py` 新增 `_handle_package_status(body)`，處理 Package status query returns current state 需求：從 S3 讀取打包狀態、回傳對應 HTTP 狀態碼
- [x] 2.3 在 `src/routes/photos.py` 新增 `handle_package_worker(event)`，實作 Package worker downloads images and creates ZIP 需求：後端圖片下載：httpx AsyncClient 併發下載圖片至 `/tmp`、`zipfile` 打包、上傳至 S3 `packages/{package_id}/images.zip`、更新狀態含 download_url / file_count / file_size
- [x] 2.4 在 `handle_photos` 路由分派中新增 `"package"` 與 `"package_status"` action 分派
- [x] 2.5 在 `src/app.py` 的 `handle_async_worker` 新增 `_worker_type: "package"` 分派，對應 Async worker dispatch supports package type 需求
- [x] 2.6 在 `requirements.txt` 新增 `httpx` 依賴（後端打包服務架構：擴充現有 /api/photos endpoint 設計決策）
- [x] 2.7 在 `tests/api.http` 新增 `package` 與 `package_status` 測試案例
- [x] 2.8 bump `apps/backend/pyproject.toml` 版號

## 3. Web 基礎建設

- [x] 3.1 在 `apps/web/` 以 `pnpm create vite` 初始化專案（Web 框架：Vite + React 19 + React Router v7），對應 Vite project initialization with React 19 and TypeScript 需求
- [x] 3.2 安裝執行期依賴：`react-router-dom`、`zustand`、`react-i18next`、`i18next`、`tailwindcss`
- [x] 3.3 安裝測試依賴：`vitest`、`@testing-library/react`、`@testing-library/jest-dom`、`@testing-library/user-event`、`msw`、`jsdom`，對應 Vitest test environment configuration 需求
- [x] 3.4 設定 `vite.config.ts`（含 Vitest 設定 + jsdom 環境）、`tailwind.config.ts`、`tsconfig.json`
- [x] 3.5 建立 `.env.example` 含 `VITE_API_BASE_URL` 與 `VITE_API_STAGE`，對應 Environment variable configuration 需求
- [x] 3.6 建立 `src/index.css` 含 Tailwind directives + M3 `#1565C0` seed 色彩 CSS custom properties（light / dark），對應 M3 color theme with dark mode support 需求
- [x] 3.7 建立 `src/routes.tsx` 使用 `createBrowserRouter` 定義 `/`、`/gallery/:blogId`、`*` 路由 + `RootLayout` 共用 layout，對應 React Router v7 routing with two routes 需求
- [x] 3.8 建立 `src/main.tsx`（ReactDOM.createRoot + providers）與 `src/App.tsx`（RouterProvider）

## 4. Web API 層

- [x] 4.1 建立 `src/lib/api/types.ts` 定義 TypeScript 型別：`PhotoEntity`、`FetchResult`、`JobStatusResponse`、`PhotoDownloadResponse`、`PackageResponse`，對應 PackageResponse DTO defined 需求
- [x] 4.2 建立 `src/lib/config/api.ts` 匯出 API base URL（`import.meta.env.VITE_API_BASE_URL` + stage）
- [x] 4.3 建立 `src/lib/api/client.ts`：fetch wrapper 含 30s timeout（AbortController）、502/503/504 自動重試（3 次、指數退避 1s/2s/4s）、雙層 JSON 解析，對應 API client with timeout, retry, and dual-layer JSON parsing 需求
- [x] 4.4 建立 `src/lib/api/photos.ts`：`submitJob()`、`checkJobStatus()`、`requestPackage()`、`checkPackageStatus()` 函式

## 5. Web 核心服務

- [x] 5.1 建立 `src/lib/services/url-validator.ts`：`isValid()` 與 `normalize()` 方法，regex `^https://(m\.)?blog\.naver\.com/`，對應 Naver URL validator ported from mobile 需求
- [x] 5.2 建立 `src/lib/services/blog-id.ts`：以 Web Crypto API `crypto.subtle.digest` 計算 SHA-256 並取前 16 字元，對應 BlogId generation using Web Crypto API 需求
- [x] 5.3 建立 `src/lib/hooks/use-polling.ts`：通用輪詢 hook（interval、maxAttempts、cleanup on unmount、AbortController）
- [x] 5.4 建立 `src/lib/hooks/use-clipboard.ts`：監聽 window focus 事件偵測剪貼簿 Naver URL，對應 Clipboard detection on window focus 需求

## 6. Web 狀態管理

- [x] 6.1 建立 `src/lib/stores/use-blog-input-store.ts`：狀態管理：Zustand store 含 blogUrl、fetchPhase、error、fetchResult 狀態 + setUrl / fetchPhotos / reset actions，對應 Fetch photos with three-phase progress 需求
- [x] 6.2 建立 `src/lib/stores/use-gallery-store.ts`：Zustand store 含 photos、blogId、selectedIds、isSelectMode 狀態 + load / toggleSelectMode / toggleSelection / selectAll actions，對應 Selection mode with individual and batch selection 需求
- [x] 6.3 建立 `src/lib/stores/use-download-store.ts`：Zustand store 含 packageId、downloadPhase、downloadUrl 狀態 + startPackaging / pollStatus / triggerDownload actions，對應 Poll packaging status until completion 需求
- [x] 6.4 建立 `src/lib/stores/use-settings-store.ts`：Zustand store 含 theme、locale 狀態 + updateTheme / updateLocale actions，localStorage 持久化

## 7. Web 頁面與元件：URL 輸入

- [x] 7.1 建立 `src/components/blog-input/BlogInputForm.tsx`：URL text input with paste button + Drag-and-drop URL support + URL validation before submission
- [x] 7.2 建立 `src/components/blog-input/FetchProgress.tsx`：三階段進度指示器（submitting → processing → completed）
- [x] 7.3 建立 `src/pages/HomePage.tsx`：整合 BlogInputForm + FetchProgress，成功後 navigate 至 `/gallery/:blogId`

## 8. Web 頁面與元件：照片牆

- [x] 8.1 建立 `src/components/gallery/PhotoGrid.tsx`：Responsive photo grid layout（3/4/5-6 欄）+ lazy loading
- [x] 8.2 建立 `src/components/gallery/PhotoCard.tsx`：圖片卡片 + 選取覆蓋層 checkbox
- [x] 8.3 建立 `src/components/gallery/SelectionToolbar.tsx`：Selection toolbar with download actions（下載全部 / 下載已選）+ Empty gallery state
- [x] 8.4 建立 `src/pages/GalleryPage.tsx`：整合 PhotoGrid + SelectionToolbar + ImageViewer overlay

## 9. Web 元件：全螢幕圖片檢視器

- [x] 9.1 建立 `src/components/gallery/ImageViewer.tsx`：Full-screen image overlay + 照片計數器 + 關閉按鈕
- [x] 9.2 實作 Zoom via CSS transforms（滑鼠滾輪、+/- 鍵、雙擊 toggle、Pinch-to-zoom on touch device）
- [x] 9.3 實作 Pan zoomed images（滑鼠拖曳、觸控拖曳）
- [x] 9.4 實作 Navigate between photos（←→ 鍵、滑動手勢、Escape 關閉、Navigate resets zoom）

## 10. Web 元件：下載流程

- [x] 10.1 建立 `src/components/download/DownloadProgress.tsx`：Download progress dialog（打包中進度、完成後自動觸發下載、失敗顯示錯誤 + 重試）
- [x] 10.2 實作 Download triggers backend packaging API：呼叫 requestPackage API
- [x] 10.3 實作圖片下載方式：後端 ZIP + S3 pre-signed URL，以 `window.location.href` 導航觸發下載（Trigger browser download via pre-signed URL）

## 11. Web 元件：設定

- [x] 11.1 建立 `src/components/settings/ThemeSwitcher.tsx`：Theme switching with three modes（系統/亮色/暗色），`localStorage` 持久化 + `<html>` class 切換
- [x] 11.2 建立 `src/components/settings/LanguageSwitcher.tsx`：Language switching with four locales（zh-TW/en/ja/ko），`localStorage` 持久化
- [x] 11.3 建立 `src/components/settings/SettingsDrawer.tsx`：Settings panel responsive layout（桌面 side drawer / 手機 modal）
- [x] 11.4 建立 `src/components/layout/RootLayout.tsx`：共用 layout（header + settings 入口）

## 12. Web 在地化

- [x] 12.1 建立 `src/lib/i18n/config.ts`：i18n：react-i18next 初始化設定（語系偵測、fallback、JSON 訊息載入）
- [x] 12.2 建立 4 個語系 JSON 檔（`messages/zh-TW.json`、`en.json`、`ja.json`、`ko.json`），從行動版 ARB 檔移植所有 key + Web 版新增 key（downloadZip、downloadSelected、packaging 等）

## 13. Web 單元測試

- [x] 13.1 建立 Service layer unit tests：`url-validator.test.ts`（驗證 + 正規化）、`blog-id.test.ts`（SHA-256 輸出比對）
- [x] 13.2 建立 API client unit tests with MSW：`client.test.ts`（timeout、retry、dual-layer JSON）、`photos.test.ts`（submitJob / checkJobStatus / requestPackage / checkPackageStatus）
- [x] 13.3 建立 Store unit tests：`use-blog-input-store.test.ts`、`use-gallery-store.test.ts`（selection 邏輯）、`use-download-store.test.ts`（打包流程）
- [x] 13.4 建立 Hook unit tests：`use-polling.test.ts`（interval、max attempts、Polling cleanup on unmount）、`use-clipboard.test.ts`（focus 事件偵測）
- [x] 13.5 建立 Component unit tests：`BlogInputForm.test.tsx`（BlogInputForm submission test）、`PhotoGrid.test.tsx`、`PhotoCard.test.tsx`（PhotoCard selection test）、`SelectionToolbar.test.tsx`、`DownloadProgress.test.tsx`

## 14. Web 打磨與部署

- [x] 14.1 新增動效：staggered reveal、hover 微互動、頁面過渡
- [x] 14.2 無障礙：focus trap（ImageViewer / SettingsDrawer）、aria-label（icon buttons）、`prefers-reduced-motion` 支援
- [x] 14.3 建立 `apps/web/CLAUDE.md` 開發指引
- [x] 14.4 建立 CI/CD workflow：`pnpm build` → 靜態檔部署
