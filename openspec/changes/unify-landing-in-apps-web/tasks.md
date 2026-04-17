## 1. Phase 1 — 搬移靜態資產與擴充 i18n 翻譯

- [x] 1.1 用 `git mv` 將 `docs/mobile/images/*.png` 8 張截圖搬到 `apps/web/public/intro/mobile/`（保留原檔名），讓 Vite 可透過 `{BASE_URL}intro/mobile/*.png` serve 靜態資源
- [x] 1.2 刪除 `docs/mobile/mobile-architecture.md`（使用者確認不需透過 Pages 供應，讀者可看 git 原始碼），並用 `Grep` 搜尋 repo 內對該檔案的引用，同步清除 README/CLAUDE.md/其他文件內的連結
- [x] 1.3 於 `apps/web/src/lib/i18n/messages/zh-TW.json` 新增 `intro.root.*`、`intro.mobile.*`、`intro.web.*`、`intro.footer.*`、`notFound.*` namespace，翻譯來源為 `docs/index.html` 與 `docs/mobile/js/i18n.js` 的 `zh-Hant`（zh-Hant ↔ zh-TW 等價）
- [x] 1.4 於 `apps/web/src/lib/i18n/messages/en.json` 同步新增上述 namespace，翻譯來源為 docs 既有英文；補 `notFound.*` 英文
- [x] 1.5 於 `apps/web/src/lib/i18n/messages/ko.json` 同步新增上述 namespace，`intro.mobile.*` 翻譯來源為 `docs/mobile/js/i18n.js` 的 `ko`，`intro.root.*`、`intro.web.*`、`notFound.*` 由 assistant 根據 mobile 用詞補齊
- [x] 1.6 於 `apps/web/src/lib/i18n/messages/ja.json` 採「日文翻譯採機翻 placeholder」策略，由 assistant 基於英文機翻 `intro.*` 與 `notFound.*` 完整 namespace，並在 PR 描述註記「待母語校稿」
- [x] 1.7 本地執行 `pnpm --filter web test` 確保 i18n 擴充未破壞既有測試；補一個 smoke test 驗證每個 locale 都含有所有 `intro.*` 與 `notFound.*` key（防止 key 缺漏）

## 2. Phase 2 — 新增 PublicLayout、AppLayout 與 intro 頁元件

- [x] 2.1 實作 Two-layer layout separation 中的 AppLayout 部分（對應設計「兩層 Layout 切分：PublicLayout vs AppLayout」）：複製 `apps/web/src/components/layout/RootLayout.tsx` 為 `AppLayout.tsx`，把 header 的 `<Link to="/">` 改為 `"/app/web"`，其餘結構不動；暫時保留 RootLayout.tsx 待 Phase 3 一起刪
- [x] 2.2 實作 Two-layer layout separation 中的 PublicLayout 部分（對應設計「兩層 Layout 切分：PublicLayout vs AppLayout」）：新增 `apps/web/src/components/layout/PublicLayout.tsx`，結構為 `<IntroNav /> <main><Outlet /></main> <IntroFooter />`；消費 `useSettingsStore` 取 theme/locale，不自建 theme 邏輯
- [x] 2.3 新增 `apps/web/src/components/intro/IntroNav.tsx`：包含 brand link、可選 anchor links（透過 prop 傳入）、語言切換與主題切換；實作「Anchor navigation in IntroNav」所需的 smooth scroll 監聽
- [x] 2.4 新增 `apps/web/src/components/intro/IntroFooter.tsx`：GitHub 連結 + copyright，全部讀 `intro.footer.*` i18n key
- [x] 2.5 執行「Icon 系統不引入 Material Symbols」決策：在 `apps/web/package.json` 新增 `lucide-react` dependency，確認 icon 使用 inline import（避免整包 bundle）
- [x] 2.6 新增 `apps/web/src/components/intro/FeatureCard.tsx`：icon + title + desc 共用元件，供 IntroRootPage、IntroMobilePage、IntroWebPage 使用
- [x] 2.7 新增 `apps/web/src/components/intro/StepCard.tsx`：step number + icon + title + desc，供 IntroMobilePage 的 how-it-works 使用
- [x] 2.8 新增 `apps/web/src/components/intro/ScreenshotCarousel.tsx`：iOS/Android tab switching 的 `useState` 邏輯 + 4 張截圖 grid 渲染；圖片路徑用 `import.meta.env.BASE_URL + "intro/mobile/xxx.png"`
- [x] 2.9 新增 `apps/web/src/components/intro/DownloadBadge.tsx`：App Store / Google Play 灰色佔位（Coming Soon）
- [x] 2.10 新增 `apps/web/src/pages/intro/IntroRootPage.tsx` 實作「Root landing page at /」：hero icon、標題、tagline、兩張 card、footer；文字透過 `intro.root.*` namespace
- [x] 2.11 新增 `apps/web/src/pages/intro/IntroMobilePage.tsx` 實作「Mobile app intro page at /intro/mobile」：hero + features + how-it-works + screenshots + download 五段；透過 `intro.mobile.*` namespace 取文字
- [x] 2.12 新增 `apps/web/src/pages/intro/IntroWebPage.tsx` 實作「Web version intro page at /intro/web」：back link、title、tagline、四張 feature card、CTA（`<Link to="/app/web">`）、tech stack；透過 `intro.web.*` namespace
- [x] 2.13 落實「Landing page theme and responsive design」與「Landing page i18n for four locales」：所有顏色走 M3 CSS token（無 hardcoded hex）、cards 在 md+ 並排 mobile 堆疊、document.title 各頁 `useEffect` 同步對應 i18n key
- [x] 2.14 落實「Mobile intro page i18n for four locales」與「Web intro page i18n for four locales」：切換 locale 後所有 intro 頁文字 reactive 更新，無 console missing-key warning
- [x] 2.15 本地執行 `pnpm --filter web test` 與 `pnpm --filter web build` 確認純新增元件不破壞既有行為（此 Phase 尚未接路由）

## 3. Phase 3 — 切換路由、舊 URL redirect 與 NotFoundPage 升級

- [x] 3.1 執行「URL 結構 /intro/* 與 /app/*」決策：重寫 `apps/web/src/routes.tsx`，於「React Router v7 routing with two routes」規範下建立 PublicLayout 與 AppLayout 兩棵子樹，`createBrowserRouter` 的 `basename` 設為 `import.meta.env.BASE_URL`
- [x] 3.2 在 routes.tsx 中定義五條 routable path：`/` → IntroRootPage、`/intro/mobile` → IntroMobilePage、`/intro/web` → IntroWebPage、`/app/web` → HomePage、`/app/web/gallery/:blogId` → GalleryPage；以及 `*` → NotFoundPage
- [x] 3.3 執行「舊 URL 相容策略分類」決策，實作「Legacy URL redirects via React Router Navigate」：新增 `/web` → `/intro/web`、`/web/app` → `/app/web` 兩條 `<Navigate replace>` redirect
- [x] 3.4 落實「No redirect for deep links that require SPA state」：新增 `/web/app/gallery/:blogId` → `/app/web` 的 redirect（**不接** blogId，冷啟無法還原 gallery state，送回 app 根）；以獨立元件 `LegacyGalleryRedirect` 或直接 `<Navigate replace to="/app/web" />` 實作
- [x] 3.5 修改 `apps/web/src/pages/HomePage.tsx`：成功擷取後的 `navigate("/gallery/...")` 改為 `navigate("/app/web/gallery/...")`
- [x] 3.6 修改 `apps/web/src/pages/GalleryPage.tsx`：空照片 fallback 的 `navigate("/")` 改為 `navigate("/app/web")`
- [x] 3.7 執行「NotFoundPage 升級為一等頁面」決策，重寫 `apps/web/src/pages/NotFoundPage.tsx` 落實「NotFoundPage as a first-class page」：hero 大號 404 + lucide icon（`MapPinOff` 或 `SearchX`） + 主副標 + 三個 CTA（回首頁 `/`、前往 Web 版 `/app/web`、看 App 介紹 `/intro/mobile`），套用 PublicLayout 視覺、響應式 CTA 堆疊
- [x] 3.8 更新 `apps/web/src/components/layout/AppLayout.tsx` 的 header 版本顯示，落實 Modified「Build-time app version injection」於 AppLayout 下生效（取代原本 RootLayout 的行為）
- [x] 3.9 刪除 `apps/web/src/components/layout/RootLayout.tsx`（被 AppLayout 取代）
- [x] 3.10 重命名既有測試 `apps/web/src/__tests__/components/layout/RootLayout.test.tsx` 為 `AppLayout.test.tsx`，更新其中的 import 與元件名稱
- [x] 3.11 新增 `apps/web/src/__tests__/components/layout/PublicLayout.test.tsx` smoke test，驗證 Outlet 渲染子頁面、IntroNav 與 IntroFooter 皆存在
- [x] 3.12 新增 routes.tsx 的單元測試（用 `createMemoryRouter`）：分別驗證 `/`、`/intro/mobile`、`/intro/web`、`/app/web`、`/app/web/gallery/abc`、`/web` 重導向、`/web/app` 重導向、`/web/app/gallery/abc` 重導向（不帶 blogId）、`/nonexistent` → NotFoundPage 共 9 個情境

## 4. Phase 4 — deploy-pages.yml 與 Vite base path 調整

- [x] 4.1 執行「Vite base path 重新規劃」與落實「Vite base path for GitHub Pages root deployment」：修改 `.github/workflows/deploy-pages.yml` 中 build step 的 `VITE_BASE_PATH` 由 `/naver-blog-image-downloader/web/app/` 改為 `/naver-blog-image-downloader/`
- [x] 4.2 執行「deploy-pages.yml 改以 apps/web/dist 為 artifact 根」：把原本 `cp -r apps/web/dist docs/web/app` 與 `cp docs/web/app/index.html docs/web/app/404.html` 改為建立 `pages-artifact/` 目錄、`cp -r apps/web/dist/* pages-artifact/`、`cp pages-artifact/index.html pages-artifact/404.html`
- [x] 4.3 修改 `upload-pages-artifact` step 的 `path` 從 `docs` 改為 `pages-artifact`，落實「SPA fallback for direct URL entry on GitHub Pages」所需的 404.html fallback 生成
- [x] 4.4 移除 deploy-pages.yml 中的 `validate` job（掃描 docs/*.html 圖片引用），該 job 因 docs/*.html 刪除已無意義
- [x] 4.5 修改 deploy-pages.yml 觸發 `paths` 條件，移除 `docs/**`（docs 不再影響 Pages 輸出），保留 `apps/web/**`
- [x] 4.6 本地執行一次 `pnpm --filter web build` 模擬 CI build（手動帶入 `VITE_BASE_PATH=/naver-blog-image-downloader/`），檢查 `dist/index.html` 的 asset 路徑是否以 `/naver-blog-image-downloader/assets/` 開頭

## 5. Phase 5 — 清理 docs/

- [x] 5.1 刪除 `docs/index.html`
- [x] 5.2 刪除 `docs/mobile/` 整個目錄（含 `index.html`、`css/`、`js/`，`images/` 已於 Phase 1 git mv 走）
- [x] 5.3 刪除 `docs/web/` 整個目錄（含 `index.html`）
- [x] 5.4 檢查 `docs/` 是否為空目錄，若空則刪除；保留 README/CLAUDE.md/其他文件中對 `docs/` 的任何引用 audit
- [x] 5.5 更新 `README.md` 的部署流程描述：移除對 `docs/web/app` 的引用，改為說明 `apps/web/dist` → Pages artifact 的新流程
- [x] 5.6 更新 `apps/web/CLAUDE.md` 的 CI/CD 流程段落，反映 `VITE_BASE_PATH` 新值與 artifact 來源變更

## 6. Phase 6 — 版號 bump、本地 Claude in Chrome 驗證與 Spectra archive

- [x] 6.1 修改 `apps/web/package.json` 的 `version` 由 `1.1.0` → `1.2.0`（minor bump，對應使用者可見的新 landing / intro 頁結構）
- [x] 6.2 本地執行 `pnpm --filter web format`、`pnpm --filter web test`、`pnpm --filter web build` 三個指令全綠，確認 TypeScript type check、unit tests、production build 皆成功
- [x] 6.3 啟動 `pnpm --filter web dev`，透過 chrome-devtools MCP 驅動 Chrome 走訪所有路徑：`/`、`/intro/mobile`、`/intro/web`、`/app/web`、`/app/web/gallery/fake` → fallback 至 `/app/web`、`/web` → `/intro/web`、`/web/app` → `/app/web`、`/web/app/gallery/abc123` → `/app/web`、`/nonexistent` → NotFoundPage，全部通過
- [x] 6.4 透過 Chrome 驗證「iOS/Android platform tab switching」：在 `/intro/mobile` 點擊 Android tab，4 張 carousel 截圖 src 全部切換為 `_android_snapshot.png`，再切回 iOS 也正常，無 console error
- [x] 6.5 透過 Chrome 在 `/` 依序切換 zh-TW/en/ja/ko × system/light/dark 共 12 組合；`document.title`、h1、tagline、footer 全部 reactive 更新；3 主題對應正確 M3 token（light `#f6f8fc` / dark `#0f1115`）；ja locale 顯示機翻日文、無 raw key
- [x] 6.6 透過 Chrome DevTools 將視窗 resize 到 375×667，landing cards 堆疊、NotFoundPage 三個 CTA 垂直堆疊、IntroMobilePage hero 與 phone mockup 縮放正常
- [x] 6.7 對 `/intro/mobile` 與 `/app/web` 執行 reload（ignoreCache），頁面正常渲染、Korean locale 與 v1.2.0 持久化，`list_console_messages` 無 error/warn
- [ ] 6.8 執行 `/spectra:archive unify-landing-in-apps-web` 將 change 歸檔

## 驗證中發現並修復的 bug

- `IntroRootPage` 兩張 card 底下 CTA 顯示與 title 相同的「App 版 / Web 版」——改用新 i18n key `intro.root.cardLearnMore`，四語系同步補齊（繁中「了解更多」／en「Learn more」／ja「詳しく見る」／ko「자세히 보기」）
- `updateLocale` 沒同步更新 `document.documentElement.lang`——在 `useSettingsStore.updateLocale` 加 `document.documentElement.lang = locale`，並於 store 初始化時寫入一次，供搜尋引擎與無障礙技術正確識別頁面語系

## PR review follow-up（merge 前補強）

- [x] 7.1 抽出 `AppLayout` / `IntroNav` 共用的語言與主題切換控制元件，消除重複常數與按鈕邏輯；theme toggle 的 `aria-label` / `title` 必須改走 i18n，而非硬編碼繁中與 raw enum
- [x] 7.2 修正 `/intro/mobile` 的頁內錨點導覽接線，改由正式 route config 驅動 `PublicLayout` 傳入 `IntroNav`，避免 `anchorLinks` prop 永遠沒被 router 傳遞
- [x] 7.3 重構 `DownloadBadge` 互動語意：只有真的可導向下載頁時才渲染為連結；無連結時不可顯示誤導性的 pointer 樣式
- [x] 7.4 重寫 `routes.test.tsx`，直接引用正式 route objects 驗證 redirect 與 `/intro/mobile` anchor nav，避免手刻第二份 route tree 漂移
- [x] 7.5 移除 IntroFooter 右下角「以 Flutter 建構」文案，並清理四語系中未再使用的 `intro.footer.builtWith` key
