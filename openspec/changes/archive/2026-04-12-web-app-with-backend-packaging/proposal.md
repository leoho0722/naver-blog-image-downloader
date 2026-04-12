## Why

行動版 Flutter App 已具備完整的 Naver Blog 圖片下載功能，但使用者必須安裝 App 才能使用。新增 Web 版讓使用者透過瀏覽器即可完成相同操作，降低使用門檻。

關鍵技術挑戰：瀏覽器的 CORS 安全機制阻擋了從 Naver CDN（`postfiles.pstatic.net`）以 `fetch()` 下載圖片的能力。`<img>` 標籤可正常顯示，但無法程式化取得圖片 blob 來打包或觸發下載。因此需要後端擴充「圖片打包服務」，在伺服器端下載圖片並打包為 ZIP，再透過 S3 pre-signed URL 提供給瀏覽器下載。

## What Changes

### 後端擴充（`apps/backend/`）

- 擴充 `/api/photos` endpoint，新增 `action: "package"` 與 `action: "package_status"` 兩個 action，複用既有的非同步 + 輪詢模式
- 新增 `PackageStore(BaseStore)`：S3 打包任務 CRUD + pre-signed URL 產生
- 新增 `PackageStatus` enum（PROCESSING / COMPLETED / FAILED）
- Worker 使用 `httpx.AsyncClient` 併發下載圖片、`zipfile` 打包、上傳至 S3 `packages/{package_id}/images.zip`
- 打包快取機制：同一 `job_id` + 相同 `indices` 若已有未過期的已完成打包，直接回傳現有結果，不重複打包
- 新增 `httpx` 依賴

### 新增 Web 前端（`apps/web/`）

- 技術棧：Vite + React 19 + React Router v7 + TypeScript + Tailwind CSS 4 + Zustand + react-i18next
- 核心頁面：URL 輸入（`/`）、照片牆 + 全螢幕檢視器（`/gallery/:blogId`）
- 圖片顯示直接使用 Naver CDN URL（`<img>` 標籤，無 CORS 限制）
- 圖片下載透過後端打包服務（package API → 輪詢 → S3 pre-signed URL → 瀏覽器導航下載）
- 設定功能：主題切換（系統/亮色/暗色）、語言切換（zh-TW/en/ja/ko）
- 測試：Vitest + React Testing Library + MSW
- 在地化：移植行動版 4 語系翻譯至 JSON 格式

## Non-Goals

- 不實作 PWA 離線快取（首版不需要）
- 不實作瀏覽器端圖片快取管理（行動版的 CacheRepository 功能不移植）
- 不實作 Firebase Auth / Crashlytics / Firestore 日誌（Web 版首版不需要）
- 不實作「版本新功能」（What's New）對話框
- 不實作動態 App 圖示切換（Web 不適用）

## Capabilities

### New Capabilities

- `backend-image-packaging`：後端圖片打包服務——接收 job_id 與可選 indices，從 Naver CDN 下載圖片、打包為 ZIP、上傳至 S3，回傳 pre-signed 下載連結
- `web-app-foundation`：Web 前端基礎建設——Vite + React 19 + React Router v7 專案初始化、路由設定、API client（含 timeout/retry/雙層 JSON 解析）、M3 色彩主題系統、react-i18next 在地化
- `web-blog-input`：Web 版 URL 輸入功能——文字輸入框、剪貼簿貼上、拖放 URL、Naver URL 驗證與正規化、提交任務 + 輪詢進度
- `web-photo-gallery`：Web 版照片牆——響應式圖片 Grid、選取模式（個別/全選）、批次下載工具列
- `web-image-viewer`：Web 版全螢幕圖片檢視器——CSS transform 縮放平移、鍵盤導航、觸控手勢
- `web-download-flow`：Web 版下載流程——呼叫後端打包 API、輪詢進度、觸發瀏覽器下載
- `web-settings`：Web 版設定功能——主題切換（系統/亮色/暗色）、語言切換（zh-TW/en/ja/ko）、localStorage 持久化
- `web-unit-tests`：Web 前端單元測試——Vitest + RTL + MSW，涵蓋 services、API client、stores、hooks、components

### Modified Capabilities

（無——行動版 Dart DTOs 不受影響。Package 相關型別由 `backend-image-packaging` 與 `web-app-foundation` 涵蓋）

## Impact

- 後端受影響檔案：`src/routes/photos.py`、`src/app.py`、`src/data_models.py`、`src/job_store/__init__.py`、`requirements.txt`，新增 `src/job_store/package.py`
- 前端新增目錄：`apps/web/`（完整 Vite + React 專案）
- API 變更：`/api/photos` endpoint 新增 `package` 與 `package_status` action（向下相容，不影響現有行動版客戶端）
- 依賴變更：後端新增 `httpx`；前端新增 `react`、`react-dom`、`react-router-dom`、`zustand`、`react-i18next`、`i18next`、`tailwindcss`、`vitest`、`@testing-library/react`、`msw` 等
- 基礎設施：S3 bucket 新增 `packages/` prefix（建議設定 24 小時 lifecycle policy 自動清理）；Lambda 可能需調整 `/tmp` 大小（512MB → 1-2GB）與 timeout（120s → 300s）
