# Web 開發指引

> 共用規範（正體中文註解、Conventional Commits、版號管理、Spectra SDD）請參閱 monorepo root [CLAUDE.md](../../CLAUDE.md)。

## 技術棧

- **框架**：Vite + React 19 + TypeScript
- **路由**：React Router v7（`createBrowserRouter`，手動定義）
- **狀態管理**：Zustand（store + actions 模式）
- **樣式**：Tailwind CSS 4 + CSS custom properties（M3 色彩系統）
- **i18n**：react-i18next（4 語系：zh-TW / en / ja / ko）
- **測試**：Vitest + React Testing Library + MSW
- **格式化**：Prettier

## 專案結構

```text
src/
├── pages/
│   ├── HomePage / GalleryPage / NotFoundPage
│   └── intro/              — landing / intro 頁（IntroRootPage、IntroMobilePage、IntroWebPage）
├── components/
│   ├── layout/             — PublicLayout（承載 landing/intro）、AppLayout（承載 Web SPA）
│   ├── intro/              — landing / intro 頁專用元件（IntroNav、FeatureCard、ScreenshotCarousel 等）
│   ├── blog-input、gallery、download、settings、onboarding、common
├── lib/
│   ├── api/                — API client + 型別定義
│   ├── stores/             — Zustand stores
│   ├── services/           — 純函式服務（url-validator、blog-id）
│   ├── hooks/              — React hooks（use-polling、use-clipboard）
│   ├── i18n/               — react-i18next 設定 + 四語系 JSON（含 intro.*、notFound.* namespace）
│   └── config/             — 環境設定（API URL、主題色彩）
└── __tests__/              — 單元測試（鏡射 src/ 結構）
public/
└── intro/mobile/           — App 介紹頁使用的 iOS/Android 截圖（8 張 PNG）
```

## 路由（React Router v7）

單一 `createBrowserRouter` tree，`basename` 讀 `import.meta.env.BASE_URL`：

- `/` → `IntroRootPage`（PublicLayout）
- `/intro/mobile` → `IntroMobilePage`（PublicLayout）
- `/intro/web` → `IntroWebPage`（PublicLayout）
- `/app/web` → `HomePage`（AppLayout）
- `/app/web/gallery/:blogId` → `GalleryPage`（AppLayout）
- `*` → `NotFoundPage`（PublicLayout）

**舊 URL redirect（`<Navigate replace>`）**：`/web` → `/intro/web`、`/web/app` → `/app/web`、`/web/app/gallery/:blogId` → `/app/web`（不帶 blogId，冷啟無法還原 gallery 狀態）。

## 常用指令

```bash
pnpm dev          # 啟動開發伺服器
pnpm build        # TypeScript 檢查 + 建置靜態檔
pnpm test         # 執行所有單元測試
pnpm test:watch   # 監聽模式執行測試
pnpm preview      # 預覽建置結果
pnpm format       # Prettier 格式化所有原始碼
pnpm format:check # 檢查格式是否正確（CI 用）
```

## CI/CD（GitHub Actions）

- **Web CI**（`.github/workflows/web-ci.yml`）：當 `apps/web/**` 有變動時觸發，執行 TypeScript 型別檢查、單元測試、Vite build、Prettier 格式檢查。PR 事件下格式不符會自動 `prettier --write` 並 commit 回 PR branch；`push` 事件下直接 fail。
- **Web CD**（`.github/workflows/web-cd.yml`）：Web CI 成功後透過 `workflow_run` 觸發，僅負責版號管理與發版：
  1. 從 `apps/web/package.json` 讀取 `version`，組成 `web-v<semver>` tag
  2. 若該 tag 已存在即跳過（版號未更新）
  3. 取得自上次 tag 以來的 commit 記錄
  4. 透過 Ollama Cloud API（gemma4:31b-cloud）生成正體中文 Release Notes（fallback: 原始 commit log）
  5. 建立 git tag `web-v<semver>` 並 push
  6. 發布 GitHub Release（title = `Web v<semver>`）
- **Deploy Pages**（`.github/workflows/deploy-pages.yml`）：當 `apps/web/**` 有變動時觸發，負責 build + 部署：
  1. `pnpm install` → `pnpm build`（`VITE_BASE_PATH=/naver-blog-image-downloader/`）
  2. `apps/web/dist/` 整個複製為 `pages-artifact/`，並把 `index.html` 複製為 `404.html` 作為 SPA routing fallback
  3. 上傳 `pages-artifact/` 並部署至 GitHub Pages（build artifacts 不進 git）

**GitHub Secrets**（需手動設定於 monorepo）：`VITE_API_BASE_URL`、`VITE_API_STAGE`、`OLLAMA_API_KEY`

**發版流程**：修改 `apps/web/package.json` 的 `version` → 經 PR merge 到 main → Web CI 綠 → Web CD 建立 tag + release；同時 Deploy Pages 自動 build + 部署。

## 開發規範

1. **環境變數**：以 `VITE_` 前綴暴露至客戶端，定義於 `.env`（參考 `.env.example`）。
2. **API 整合**：所有 API 呼叫透過 `lib/api/client.ts` 的 `apiPost()` 封裝，內建 timeout、retry、雙層 JSON 解析。
3. **CORS 注意**：Naver 圖片 URL 僅可用 `<img>` 顯示，不可用 `fetch()` 下載。圖片下載一律透過後端打包服務（`action: "package"`）。
4. **測試檔案**：放在 `src/__tests__/` 下，鏡射 `src/` 目錄結構，命名 `{module}.test.ts` / `{Component}.test.tsx`。
