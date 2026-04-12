## Context

現有系統為 Flutter 行動版 App + Python AWS Lambda 後端，後端以 Playwright 爬取 Naver Blog 文章圖片 URL，行動版直接從 Naver CDN 下載圖片至裝置。

Web 版需解決瀏覽器 CORS 限制：`<img>` 可顯示跨域圖片，但 `fetch()` 無法取得跨域圖片的 blob（Naver CDN 未設定 `Access-Control-Allow-Origin`）。因此圖片下載必須在伺服器端完成。

後端已有 S3 存儲（任務狀態 + debug log）與非同步 Lambda 自呼叫模式。Web 前端目錄 `apps/web/` 目前僅有 `.gitkeep`。

## Goals / Non-Goals

**Goals:**

- 後端新增圖片打包服務，複用既有非同步 + 輪詢模式
- Web 前端實現完整的圖片瀏覽與下載體驗
- 維持與行動版一致的 API 合約（向下相容）
- 4 語系在地化支援（zh-TW / en / ja / ko）
- 完善的單元測試覆蓋

**Non-Goals:**

- PWA 離線支援（首版不實作）
- 瀏覽器端圖片快取管理
- Firebase 整合（Auth / Crashlytics / Firestore）
- What's New 功能
- SSR / SEO 優化（純工具型 SPA，無需求）

## Decisions

### 後端打包服務架構：擴充現有 /api/photos endpoint

在現有 `/api/photos` endpoint 新增 `package` 與 `package_status` action，而非建立獨立 endpoint。

**理由：** 複用既有路由、非同步 worker、S3 存儲模式，減少新程式碼量。行動版客戶端不受影響（不使用這兩個 action）。

**替代方案：** 建立獨立 `/api/packages` endpoint — 語義更清晰但需新增路由模組，增加維護成本。

### 後端圖片下載：httpx AsyncClient

使用 `httpx.AsyncClient` 併發下載 Naver 圖片，而非 `requests`（同步）或 `urllib`。

**理由：** 支援 async/await 併發下載多張圖片，顯著縮短打包時間。`httpx` API 與 `requests` 相似，學習成本低。

### Web 框架：Vite + React 19 + React Router v7

選擇 Vite 而非 Next.js。

**理由：** 本專案為純客戶端 SPA，不需要 SSR / Server Components / middleware。Vite 天生輸出靜態檔，零配置部署。Next.js 的核心價值（SSR、ISR）在此場景無用，反而引入 `'use client'` 等不必要的心智負擔。

**替代方案：** Next.js 15 — 生態系更大但功能過度；SvelteKit — 更輕但團隊不熟悉。

### 狀態管理：Zustand

選擇 Zustand 而非 Redux / Jotai / React Context。

**理由：** 輕量（~1KB）、無 boilerplate、API 簡潔。Zustand store 對應行動版 Riverpod Notifier 的模式（store with actions + selectors）。

### i18n：react-i18next

選擇 react-i18next 而非 next-intl / FormatJS。

**理由：** 純客戶端設定簡單，JSON 訊息格式直接對應行動版 ARB 檔。`next-intl` 在非 Next.js 環境無法使用。

### 圖片下載方式：後端 ZIP + S3 pre-signed URL

所有下載操作（全部/已選/單張）都透過後端打包 API，瀏覽器以 `window.location.href` 導航至 pre-signed URL 觸發下載。

**理由：** 完全避開 CORS 限制。pre-signed URL 的瀏覽器導航不受 CORS 約束。S3 支援大檔案，無 Lambda 回應大小限制（6MB）問題。

**替代方案：** Lambda 直接回傳圖片 binary — 受 6MB 回應限制；S3 CORS 配置 + 客戶端 JSZip — 需維護 S3 CORS policy 且對 Naver CDN 仍無效。

### ZIP 檔案 S3 路徑與生命週期

路徑：`packages/{package_id}/images.zip`。S3 Lifecycle Policy 設定 `packages/` prefix 下檔案 24 小時自動刪除。

**理由：** 統一前綴便於生命週期管理，避免打包檔案無限累積。24 小時足夠使用者下載。

### 打包快取：同 job_id + indices 複用已完成的 ZIP

`_handle_package` 收到請求時，先以 `job_id` + sorted `indices` 計算 cache key（SHA-256 前 16 字元），查詢 S3 是否已有對應的已完成打包。若存在且 ZIP 檔案仍在 S3（24 小時 lifecycle 內），直接回傳 HTTP 200 + 現有 `package_id` 與新產生的 pre-signed URL，不觸發新的 worker。

**理由：** 使用者可能多次點擊下載（重新開啟頁面、切換 tab 回來），不需重複下載相同圖片。節省 Lambda 執行時間與 S3 儲存。

**cache key 計算方式：** `SHA-256(job_id + ":" + sorted(indices).join(","))`，`indices` 為 `null` 時表示全部圖片。存於 PackageStore metadata 的 `cache_key` 欄位中。

## Risks / Trade-offs

- **Lambda /tmp 空間不足** → 大量高解析圖片（>50 張 × 5MB）可能超過預設 512MB `/tmp` 限制。**緩解：** 建議將 `/tmp` 提高至 1-2GB，或在 worker 中設定圖片數量上限。
- **Lambda timeout** → 下載大量圖片 + ZIP 打包可能超過 120s timeout。**緩解：** 建議提高至 300s。
- **Naver CDN 限流** → 短時間併發下載大量圖片可能觸發 Naver 限流。**緩解：** httpx 下載設定合理的併發數（4-8）與 retry 機制。
- **S3 儲存成本** → 打包檔案暫存 24 小時。**緩解：** Lifecycle policy 自動清理，成本極低。
- **向下相容** → 新增的 `package` / `package_status` action 不影響現有 `download` / `status` action，行動版客戶端無需修改。
