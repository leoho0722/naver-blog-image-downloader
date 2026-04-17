## Why

目前 `docs/` 下有三份獨立維護的靜態 HTML landing 頁（`docs/index.html` 根 landing、`docs/mobile/index.html` App 介紹、`docs/web/index.html` Web 版介紹），與 `apps/web/` 的 React SPA 平行存在。四個介面使用四種不同的 i18n 實作（vanilla JS vs react-i18next）、兩套主題切換機制（`prefers-color-scheme` + 自管 localStorage vs Zustand + `<html>.dark` class）、各自引入 Google Fonts 與 Material Symbols，維護成本高且容易同步漏改。

同時現有 Web SPA 部署在 `/web/app/` 子路徑，多一層對使用者無意義的 `/web/` 前綴；landing 頁 CTA 再跨層連回 SPA 使用者體驗不連續。

透過 React Router 統一承載所有 public 頁面後，可共用 i18n、theme、layout 基礎建設，並讓 URL 結構變得語意清楚（`/intro/*` 為介紹、`/app/*` 為實際 App）。

## What Changes

- 新增三個 React 介紹頁面：
  - `/` → `IntroRootPage`（取代 `docs/index.html`，兩張卡片導向 `/intro/mobile` 與 `/intro/web`）
  - `/intro/mobile` → `IntroMobilePage`（取代 `docs/mobile/index.html`，包含 hero、features、how-it-works、iOS/Android 截圖切換、download badges）
  - `/intro/web` → `IntroWebPage`（取代 `docs/web/index.html`，CTA 同站 navigate 到 `/app/web`）
- **BREAKING** URL 結構調整：
  - 現有 `/web/app/` → 新 `/app/web`（Web SPA）
  - 現有 `/web/app/gallery/:blogId` → 新 `/app/web/gallery/:blogId`
  - 舊 URL 以 React Router `<Navigate replace>` 做相容 redirect（`/web/app` 與 `/web` 可冷啟、`/web/app/gallery/:blogId` 送回 `/app/web` 不保留 blogId）
- 新增 `PublicLayout`（承載 landing / intro 頁）與 `AppLayout`（由 `RootLayout.tsx` 重命名，承載 SPA）
- 新增共用 intro 元件：`IntroNav`、`IntroFooter`、`FeatureCard`、`StepCard`、`ScreenshotCarousel`、`DownloadBadge`
- `NotFoundPage` 升級為一等頁面（hero 大號 404 + icon + 主副標 + 三個 CTA）
- 截圖資產 `docs/mobile/images/*.png` 搬到 `apps/web/public/intro/mobile/`
- i18n 擴充：四語系 json 新增 `intro.root.*` / `intro.mobile.*` / `intro.web.*` / `intro.footer.*` / `notFound.*` namespace；日文由 assistant 機翻產生 placeholder 待校稿
- Icon 系統改用 `lucide-react` 或 inline SVG，不再引入 Google Material Symbols（節省約 30KB 字體下載）
- `VITE_BASE_PATH` 由 `/naver-blog-image-downloader/web/app/` 改為 `/naver-blog-image-downloader/`
- GitHub Actions `deploy-pages.yml` 改以 `apps/web/dist/` 為 Pages artifact 根目錄，移除 `docs` 圖片引用驗證 job，觸發 paths 移除 `docs/**`
- 刪除 `docs/` 目錄下所有靜態檔（含 `index.html`、`mobile/`、`web/`、`mobile/mobile-architecture.md`）
- 本地驗證方式：啟動 `pnpm --filter web dev` 後，透過 Claude in Chrome 自動開瀏覽器走訪所有路徑、12 種語系×主題組合、RWD breakpoint

## Non-Goals

- 不引入 `react-helmet` 或其他動態 `<title>` 管理套件；`document.title` 由各 intro 頁 `useEffect` 直接設定
- 不把 `docs/mobile/mobile-architecture.md` 搬進 `apps/web/public/`；Flutter 架構文件直接刪除（使用者確認不需透過 Pages 供應，讀者可看 git 原始碼）
- 不為舊 URL 散布在外部（社群貼文、第三方文章）的直連資源（如 `docs/mobile/images/*.png` 直連）做額外 redirect；僅處理路由層級的舊 URL
- 不引入 CMS 或 Markdown renderer；intro 頁內容以 React 元件 + i18n 硬編，不走動態渲染
- 日文翻譯本次只做機翻 placeholder，母語校稿由後續獨立 PR 處理（patch bump）

## Capabilities

### New Capabilities

- `web-intro-root`: 根 landing 頁（`/`）— hero icon、標題、tagline、兩張卡片導向 `/intro/mobile` 與 `/intro/web`、footer，支援 zh-TW/en/ja/ko 四語系與 system/light/dark 三主題
- `web-intro-mobile`: App 介紹頁（`/intro/mobile`）— hero（含 phone mockup）、features、how-it-works、iOS/Android 平台切換截圖輪播、download badges placeholder、IntroNav anchor 連結，支援四語系與三主題
- `web-intro-web`: Web 版介紹頁（`/intro/web`）— 功能 feature cards、CTA 同站 navigate 到 `/app/web`、技術棧標示，支援四語系與三主題
- `web-legacy-redirects`: 舊 URL 相容規則 — `/web` → `/intro/web`、`/web/app` → `/app/web`、`/web/app/gallery/:blogId` → `/app/web`（不帶 blogId）

### Modified Capabilities

- `web-app-foundation`: 路由從 2 條擴充為 5 條 routable paths + 3 條 redirect；新增 `PublicLayout` 與 `AppLayout` 兩層佈局；`VITE_BASE_PATH` 生產值由 `/naver-blog-image-downloader/web/app/` 改為 `/naver-blog-image-downloader/`；`NotFoundPage` 升級為一等頁面

## Impact

- **新增程式碼**：
  - `apps/web/src/components/layout/{AppLayout,PublicLayout}.tsx`
  - `apps/web/src/components/intro/{IntroNav,IntroFooter,FeatureCard,StepCard,ScreenshotCarousel,DownloadBadge}.tsx`
  - `apps/web/src/pages/intro/{IntroRootPage,IntroMobilePage,IntroWebPage}.tsx`
  - `apps/web/public/intro/mobile/*.png`（8 張截圖，自 `docs/mobile/images/` 搬入）
  - `apps/web/src/__tests__/components/layout/PublicLayout.test.tsx`
- **修改程式碼**：
  - `apps/web/src/routes.tsx`（整段重寫）
  - `apps/web/src/pages/HomePage.tsx`（navigate target 更新）
  - `apps/web/src/pages/GalleryPage.tsx`（navigate fallback 更新）
  - `apps/web/src/pages/NotFoundPage.tsx`（重寫為一等頁面）
  - `apps/web/src/lib/i18n/messages/{zh-TW,en,ja,ko}.json`（新增 intro.* 與 notFound.* namespace）
  - `apps/web/package.json`（version 1.1.0 → 1.2.0）
  - `apps/web/src/__tests__/components/layout/RootLayout.test.tsx`（重命名為 `AppLayout.test.tsx`）
- **刪除程式碼**：
  - `apps/web/src/components/layout/RootLayout.tsx`
  - `docs/index.html`、`docs/mobile/` 整個目錄、`docs/web/` 整個目錄
- **CI/CD 影響**：
  - `.github/workflows/deploy-pages.yml`（VITE_BASE_PATH、artifact 路徑、移除 validate job、觸發 paths 調整）
- **文件更新**：
  - `README.md`、`apps/web/CLAUDE.md`（部署流程描述更新，移除對 `docs/web/app` 的引用）
- **相依性**：新增 `lucide-react` 到 `apps/web/package.json` dependencies（若選用 lucide 作為 icon 來源）
- **版號**：`apps/web` 1.1.0 → 1.2.0（使用者可見新頁面結構，minor bump）
- **外部連結相容性**：GitHub Pages 已部署的外部連結 `/naver-blog-image-downloader/web/app/*` 透過 React Router redirect 保持可達；社群貼文引用 `docs/mobile/images/*.png` 的直連會失效（已標示為 Non-Goal）
