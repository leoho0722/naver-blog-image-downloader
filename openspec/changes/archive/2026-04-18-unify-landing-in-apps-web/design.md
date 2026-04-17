## Context

專案目前將 public 頁面拆成兩套實作：`docs/` 下三份手寫 HTML（`docs/index.html`、`docs/mobile/index.html`、`docs/web/index.html`）與 `apps/web/` 的 Vite + React 19 SPA。`deploy-pages.yml` 工作流程先 `pnpm build` 把 Web SPA 產物放到 `docs/web/app/`，再把整個 `docs/` 包成 Pages artifact。

兩套實作造成的現狀：
- i18n 實作分歧：`docs/mobile/js/i18n.js` 是 vanilla JS 物件查找；`apps/web` 用 `react-i18next`
- Theme 機制衝突：`docs` 頁面自管 `localStorage` key；`apps/web` 用 Zustand store + `<html>.dark` class
- 字體依賴重複：三份 HTML 都引入 Google Material Symbols + Noto Sans TC；`apps/web` 則以 Tailwind 字體堆疊為主
- URL 層級怪異：`/web/app/` 的 `/web/` 前綴對使用者無意義

此 change 的整體動機是用**單一 React Router tree** 承載所有 public 頁面，重用既有 i18n、theme、layout primitives，並在過程中把 URL 結構調整為語意清楚的 `/intro/*`（介紹頁）與 `/app/*`（實際 App）。

## Goals / Non-Goals

**Goals:**

- 消除 docs 三份 HTML 與 apps/web 之間的實作分歧，landing / intro 頁統一在 React Router 下
- 新增 `/` → IntroRootPage、`/intro/mobile` → IntroMobilePage、`/intro/web` → IntroWebPage 三個 routable 頁面
- Web SPA 從 `/web/app/` 遷移到 `/app/web`，URL 語意改為 `/app/<platform>`
- 為所有舊 URL 提供相容 redirect（可冷啟入口）或合理的 fallback（deep gallery 連結送回 app 根）
- NotFoundPage 提升為一等頁面，與 intro 頁視覺一致
- 統一支援四語系（zh-TW/en/ja/ko）與三主題（system/light/dark），四種介面不再各自實作
- 簡化 `deploy-pages.yml`：artifact 來源改為 `apps/web/dist/`，移除 docs 圖片驗證 job

**Non-Goals:**

- 不引入 `react-helmet` 或其他動態 `<title>` 管理套件（各 intro 頁以 `useEffect` 直接設 `document.title`）
- 不把 `docs/mobile/mobile-architecture.md` 搬進 `apps/web/public/`；該檔直接刪除，讀者可看 git 原始碼
- 不為外部散布的 `docs/mobile/images/*.png` 直連做額外 redirect（社群貼文若引用會失效）
- 不引入 Markdown renderer 或 CMS；intro 內容以 React 元件 + i18n 硬編
- 日文翻譯本 change 只做機翻 placeholder，母語校稿由後續獨立 PR 處理
- 不支援 SSR / static HTML prerender；landing 頁仍以 SPA 形式交付（透過 404.html fallback 達成 SPA routing）

## Decisions

### 兩層 Layout 切分：PublicLayout vs AppLayout

landing/intro 頁與 Web SPA 各有不同的 header 期望（intro 頁需要 anchor nav + download CTA，SPA 則需要 blog input 相關的 title/nav）。採用兩層 Layout：

- `PublicLayout`：承載 `/`、`/intro/mobile`、`/intro/web`、`*`（NotFoundPage）；結構 `<IntroNav /> <main><Outlet /></main> <IntroFooter />`
- `AppLayout`：承載 `/app/web`、`/app/web/gallery/:blogId`；由現有 `RootLayout.tsx` 重命名並改 header link（`<Link to="/">` → `"/app/web"`），其餘佈局不動

兩個 Layout 都從 `useSettingsStore` 讀取 theme/locale，`<html>.dark` class 由同一個 store 管理，不重複實作。

**考慮過：** 單層 Layout 加條件渲染 header — 但會讓 Layout 變成「大 switch」，測試困難；兩層 Layout 職責更清楚。

### 舊 URL 相容策略分類

依「冷啟是否可獨立運作」決定 redirect 目標：

- `/web` → `/intro/web`（可冷啟，redirect 到新介紹頁）
- `/web/app` → `/app/web`（可冷啟，redirect 到新 app 入口）
- `/web/app/gallery/:blogId` → `/app/web`（**不帶 blogId**，因為 gallery 需 SPA in-memory state，冷啟無法還原；送回 app 根讓使用者重新貼網址比踩到空白 gallery 更合理）

其中 `/web/app/gallery/:blogId` redirect 的實作採獨立元件 `LegacyGalleryRedirect`，以 `<Navigate replace to="/app/web" />` 直接送到 app 根，不接 blogId。

**考慮過：**
- 直接 404 — 使用者明顯要進 App，丟到 NotFoundPage 體驗差
- redirect 到 `/app/web/gallery/:blogId`（保留 blogId）— 冷啟 GalleryPage 因無 photos state 會 navigate 回 `/app/web`，等於轉兩次，不如直接送 app 根

### Icon 系統不引入 Material Symbols

舊 docs 三頁都用 Google Material Symbols Outlined。本 change **不引入**，改用 `lucide-react` + inline SVG：

- 節省約 30KB 字體 payload，縮短 FCP
- 與 `apps/web` 既有視覺語言（HomePage / GalleryPage 目前用 Unicode 符號/emoji）相容
- `lucide-react` 的 `Image`、`Download`、`Zap`、`MapPinOff` 等 icon 視覺上接近 Material Symbols

**考慮過：** 保留 Material Symbols 以維持視覺一致 — 但多一個外部字體相依、首次載入阻塞，且與 apps/web 現有風格本來就不同，不如一次改齊。

### URL 結構 /intro/* 與 /app/*

採 `/intro/<platform>` 與 `/app/<platform>` 平行結構：

- `/intro/mobile`、`/intro/web`（未來可擴展 `/intro/desktop`、`/intro/backend`）
- `/app/web`（未來 Flutter Web 若上線可加 `/app/mobile`）

**考慮過：**
- `/mobile` 與 `/web`（扁平）— 容易與通用詞彙混淆，且 `/web` 語意不清（指介紹頁還是 Web app？）
- `/mobile-about` 與 `/web-about` — 不優雅，也無法對稱擴展 app 側

### NotFoundPage 升級為一等頁面

現有 NotFoundPage 僅「404 + 一行文字 + 一個 Link」。本 change 改寫為：

- 置於 `<PublicLayout>` 下，套用同 IntroNav + IntroFooter
- Hero 區：大型 404 數字（`var(--font-display)` Gowun Dodum）+ lucide icon（`MapPinOff` 或 `SearchX`）
- 主標 + 副標 + 三個 CTA：「回首頁」→ `/`、「前往 Web 版」→ `/app/web`、「看 App 介紹」→ `/intro/mobile`
- 響應式：行動版 CTA 堆疊、桌面並排
- i18n：新增 `notFound.*` namespace 四語系

理由：GitHub Pages 的 404.html SPA fallback 確保技術上 `*` catch-all 命中 NotFoundPage，但視覺上若還是「湊數」元件，使用者感知不到我們有處理 — 必須做一等設計才值得。

### 日文翻譯採機翻 placeholder

docs 既有翻譯只涵蓋 zh-Hant/en/ko，統一為 4 語系後 intro.* 下會缺日文：

- 採 assistant 基於英文機翻產生 `ja.json` 的 intro 段落，PR 描述註記「待母語校稿」
- 後續獨立 PR 由使用者提供母語校稿（patch bump）

**考慮過：**
- 直接 fallback 到英文 — `react-i18next` 會 console warning，且日文使用者看到英文體驗斷裂
- 等使用者先提供日文再合併 — 阻塞本 change 過久

### Vite base path 重新規劃

`VITE_BASE_PATH` 生產值 `/naver-blog-image-downloader/web/app/` → `/naver-blog-image-downloader/`。

- React Router `basename: import.meta.env.BASE_URL` 自動跟進
- 本地 dev 不設 `VITE_BASE_PATH`，基底維持 `/`
- 所有 `<Link to="/…">` 與 `navigate("/…")` 皆相對於 basename，無需寫死前綴

### deploy-pages.yml 改以 apps/web/dist 為 artifact 根

原流程：`pnpm build` → `cp -r apps/web/dist docs/web/app` → 整個 `docs/` 作 artifact

新流程：
1. `pnpm build`（`VITE_BASE_PATH=/naver-blog-image-downloader/`）
2. `mkdir pages-artifact && cp -r apps/web/dist/* pages-artifact/`
3. `cp pages-artifact/index.html pages-artifact/404.html`（SPA fallback 保留）
4. `actions/upload-pages-artifact` 的 `path` 指向 `pages-artifact`

同時移除 `validate` job（docs/*.html 已不存在），觸發 paths 移除 `docs/**`（docs 不再影響 Pages 輸出）。

## Risks / Trade-offs

- **[外部連結 404]** 社群貼文、第三方文章若直連 `/naver-blog-image-downloader/mobile/images/*.png` 或 `/mobile/mobile-architecture.md`，本 change 後會 404 → **Mitigation**：已標為 Non-Goal；若事後發現有熱門連結，可在 deploy 時 `cp` 一份舊路徑相容，成本低
- **[日文機翻品質]** 機翻產生的日文 intro 內容可能用詞生硬 → **Mitigation**：PR 描述明確標示「待母語校稿」，並於後續 patch PR 補回
- **[Gallery 深連結體驗退化]** `/web/app/gallery/:blogId` 舊深連結 redirect 到 `/app/web` 不帶 blogId，看似「弄丟 URL 資訊」 → **Mitigation**：接受此 trade-off，因為冷啟本來就無法還原 gallery 狀態；memory 記錄此設計原則，future task 可沿用
- **[VITE_BASE_PATH 換值同時 deploy]** 如果只跑 commit 3（路由改）不跑 commit 4（BASE_PATH 改），生產環境 basename 仍是 `/web/app/`，路由會全部 mismatch 404 → **Mitigation**：commit 3 與 commit 4 必須在同一 PR 合併；deploy-pages.yml 由 `main` 單次觸發，不會有「先 merge commit 3 deploy 壞掉」的情境（合併後一起 deploy）
- **[測試涵蓋漏失]** 現有 `RootLayout.test.tsx` 改名 `AppLayout.test.tsx` 時，若忘了補 `PublicLayout.test.tsx`，landing/intro 頁無單元測試保護 → **Mitigation**：tasks.md 明確列出 PublicLayout.test.tsx 為必做項；至少涵蓋「PublicLayout 渲染 Outlet 子頁面」的 smoke test
- **[lucide-react 新增依賴]** `apps/web/package.json` 需新增 `lucide-react` dependency，會增加 bundle size（tree-shaken 後每個 icon 約 1KB） → **Mitigation**：按需 import 單一 icon；`pnpm build` 後檢查 `dist/assets/` 總 size 增量控制在 +10KB 內
