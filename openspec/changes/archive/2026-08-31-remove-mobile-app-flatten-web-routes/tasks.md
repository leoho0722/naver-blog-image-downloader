## 1. Web 端移除 mobile 介紹內容

- [x] 1.1 刪除 `IntroMobilePage` 與其專屬子元件 `DownloadBadge`、`ScreenshotCarousel`、`StepCard`，以及 `apps/web/public/intro/mobile/` 下 8 張截圖。完成後 `Mobile app intro page at /intro/mobile` 與 `iOS/Android platform tab switching` 兩項行為不再存在於程式碼中。驗證：`rg -l "IntroMobilePage|DownloadBadge|ScreenshotCarousel|StepCard" apps/web/src` 無輸出，且 `pnpm build` 的 `tsc -b` 不報 unresolved import。
- [x] 1.2 移除頁內錨點導覽機制（`Anchor navigation in IntroNav`）：從 `public-navigation.ts` 刪除 `INTRO_MOBILE_ANCHOR_LINKS`、`AnchorLink`、`PublicRouteHandle`，`IntroNav` 不再接受 `anchorLinks` prop，`PublicLayout` 不再呼叫 `useMatches`。完成後 `PublicLayout` 頁面的 header 只剩品牌連結與主題／語系控制項，不含任何 `href` 以 `#` 開頭的連結。驗證：更新後的 `PublicLayout.test.tsx` 斷言 header 內無 hash anchor 且仍渲染 `IntroNav`／`Outlet`／`IntroFooter` 三段。

## 2. Landing 頁重建

- [x] 2.1 新增 `apps/web/src/pages/LandingPage.tsx`，合併原 `IntroRootPage` 的 hero（`intro.root.title` + 雙行 tagline）與原 `IntroWebPage` 的四張 feature card、主 CTA、技術棧說明，交付 `Product landing page at /` 的行為；CTA 以 React Router `<Link>` 指向 `/app`，且不渲染返回連結、平台選擇卡或任何 App 下載徽章。驗證：新增 `apps/web/src/__tests__/pages/LandingPage.test.tsx`，斷言四張 feature card 標題、CTA 的 `href` 為 `/app`、頁面無指向 `/intro/*` 的連結。
- [x] 2.2 刪除 `apps/web/src/pages/intro/` 整個目錄（`IntroRootPage.tsx`、`IntroWebPage.tsx`、`IntroMobilePage.tsx`），使 `Root landing page at /` 與 `Web version intro page at /intro/web` 兩項舊行為完全退場。驗證：`test ! -d apps/web/src/pages/intro` 為真，且 `pnpm build` 通過。
- [x] 2.3 確認 landing 頁沿用 M3 CSS 變數與響應式版型，交付 `Landing page theme and responsive design`：三種主題切換皆由 `useSettingsStore` 驅動、無硬編碼 hex 色，375px 寬時四張 feature card 直向堆疊且頁面不橫向捲動。驗證：以 Claude in Chrome 在 375px 與桌面寬度各截圖一次，並切換 light／dark 各確認一次。

## 3. i18n 收斂

- [x] 3.1 在 `zh-TW.json`、`en.json`、`ja.json`、`ko.json` 四語系中，把 `intro.web.*` 的 `featureUrl`、`featureGrid`、`featureBatch`、`featureI18n`、`cta`、`tech` 搬入 `intro.root.*`，並刪除 `intro.web.*`、`intro.mobile.*`、`intro.root.card*` 與 `notFound.ctaMobileIntro`，交付 `Landing page i18n for four locales` 的鍵值契約，同時使 `Web intro page i18n for four locales` 與 `Mobile intro page i18n for four locales` 兩項舊契約失效。驗證：`intro-parity.test.ts` 移除 `intro.mobile.screenshots` tab 斷言後仍通過，四語系 `intro` 命名空間 key 集合完全一致。
- [x] 3.2 確認語系切換即時生效：在 `/` 由 `zh-TW` 切到 `en` 時，標題、tagline、四張 feature card、CTA、技術棧文字同步更新且不重新載入頁面。驗證：以 Claude in Chrome 實際切換語系並截圖前後對照。

## 4. 路由扁平化與 redirect

- [x] 4.1 改寫 `routes.tsx` 的路由樹，交付 `React Router v7 routing with two routes`：`/` → `LandingPage`、`/privacy` → `PrivacyPolicyPage`（`PublicLayout`）；`/app` → `HomePage`、`/app/gallery/:blogId` → `GalleryPage`（`AppLayout`）；`*` → `NotFoundPage`。驗證：`routes.test.tsx` 對五條路徑各有一個 render 斷言並通過。
- [x] 4.2 更新 `AppLayout` 的 header 品牌連結指向 `/app`，並確認 `PublicLayout` 結構不變，交付 `Two-layer layout separation` 的新路徑契約。驗證：`AppLayout.test.tsx` 斷言品牌連結 `href` 為 `/app`。
- [x] 4.3 更新 `GalleryPage` 冷啟無 state 時的 fallback 目標為 `/app`（原為 `/app/web`），以及 `HomePage` 抓取成功後的 `navigate` 目標為 `/app/gallery/:blogId`。完成後直接開啟 `/app/gallery/abc123` 會落回 `HomePage` 而非空白頁。驗證：`routes.test.tsx` 新增冷啟深連結案例，斷言最終 `location.pathname` 為 `/app`。
- [x] 4.4 建立完整的 legacy redirect 表，交付 `Legacy URL redirects via React Router Navigate`：`/web`、`/intro/web`、`/intro/mobile` → `/`；`/web/app`、`/app/web` → `/app`；`/web/app/gallery/:blogId`、`/app/web/gallery/:blogId` → `/app`，全部使用 `<Navigate replace>`。驗證：`routes.test.tsx` 對七條舊路徑各斷言一次 `router.state.location.pathname`。
- [x] 4.5 確認深連結 redirect 策略未被違反，交付 `No redirect for deep links that require SPA state`：兩條 gallery 舊路徑的 redirect 目標為 `/app`，不得帶 `blogId`。驗證：`routes.test.tsx` 明確斷言 `/app/web/gallery/abc123def456` 導向 `/app` 而非 `/app/gallery/abc123def456`。
- [x] 4.6 確認 GitHub Pages 的 `SPA fallback for direct URL entry on GitHub Pages` 行為不受本次變更影響：`deploy-pages.yml` 仍把 `index.html` 複製為 `404.html`，直接開啟 `/intro/mobile` 會經 SPA 接手後 redirect 到 `/`。驗證：檢視 `deploy-pages.yml` 的 Assemble 步驟未被更動，並以本機 `pnpm preview` 直接輸入 `/intro/mobile` 觀察最終落點。
- [x] 4.7 將 `NotFoundPage` 的 CTA 由三顆縮為兩顆（`/` 與 `/app`），交付更新後的 `NotFoundPage as a first-class page`；移除指向 `/intro/mobile` 的 CTA 與 `notFound.ctaMobileIntro` 文案引用。驗證：`routes.test.tsx` 的 `/nonexistent` 案例加斷言——頁面連結數為 2 且無 `/intro/mobile`。

## 5. 隱私政策去 mobile 化

- [x] 5.1 改寫四語系 `privacy.sections` 內容，交付更新後的 `Required privacy content topics`：移除匿名裝置識別碼、Firebase Authentication、Cloud Firestore 操作紀錄、Firebase Crashlytics 當機紀錄、App 設定頁清快取、解除安裝 App 等僅適用行動版的條款；`thirdParty` 只保留 AWS 與 Naver 聲明；「App 或 Web」一類措辭收斂為 Web。十個 section id 全部保留。驗證：`privacy-parity.test.ts` 通過，並以 `rg -i "firebase|crashlytics|firestore|解除安裝|uninstall" apps/web/src/lib/i18n/messages` 確認無殘留。
- [x] 5.2 更新 `Privacy policy page at /privacy` 的定位敘述與 `PRIVACY_POLICY_LAST_UPDATED` 日期，使頁面顯示的最後更新日與本次實質內容修改一致，且頁面不再宣稱服務於 App Store／Google Play 上架用途。驗證：`PrivacyPolicyPage.test.tsx` 通過，頁面渲染的日期等於常數值。
- [x] 5.3 確認 `Privacy link in IntroFooter` 在新的頁面集合（`LandingPage`、`NotFoundPage`、`PrivacyPolicyPage`）上皆可見且指向 `/privacy`。驗證：`IntroFooter.test.tsx` 與 `routes.test.tsx` 的 `/privacy` 案例通過。

## 6. 測試調整

- [x] 6.1 刪除 `DownloadBadge.test.tsx`，並更新 `PublicLayout.test.tsx`（移除 `intro.mobile.nav.features` anchor 斷言）、`intro-parity.test.ts`（移除 mobile screenshots tab 斷言）、`routes.test.tsx`（改為新路由與新 redirect 表）。完成後測試套件不再引用任何 mobile 相關符號或 i18n key。驗證：`pnpm test` 全綠，且 `rg -i "intro\.mobile|DownloadBadge" apps/web/src/__tests__` 無輸出。

## 7. 移除 mobile 版程式碼與 CI/CD

- [x] 7.1 刪除 `apps/mobile/` 整個目錄與 `.github/workflows/mobile-ci.yml`、`.github/workflows/mobile-cd.yml`。完成後 monorepo 只剩 backend 與 web 兩個元件，且不再有針對 mobile 路徑觸發的 workflow。驗證：`test ! -d apps/mobile` 為真、`ls .github/workflows | grep -c mobile` 為 0，且 `rg -l "apps/mobile" .github` 無輸出。
- [x] 7.2 刪除 `openspec/specs/` 下 48 份僅描述 Flutter 程式碼的 spec 目錄（清單見 proposal 的 Impact 段）。完成後 `spectra list --specs` 只列出 backend 與 web 的 capability。驗證：`spectra list --specs` 輸出不含任何 mobile capability，且 `spectra validate` 通過。

## 8. 文件與版號

- [x] 8.1 更新 `README.md`：系統架構圖、Monorepo 結構、快速開始、技術棧速覽、版號管理表、CI/CD 表全部改為 backend + web 雙元件描述。完成後文件不再提及 Flutter App、mobile CI/CD 或 `mobile-v*` 發版流程。驗證：文件中不再有任何把 mobile 當成現役元件的敘述；唯一允許的例外是一段明確標示「已停止維護」並指出 `mobile-v1.6.1` tag 還原路徑的歷史註記。
- [x] 8.2 更新根 `CLAUDE.md`：移除 mobile 元件說明、版號表的 mobile 列、buildNumber 規則，以及整段「Screenshot / test-only 程式碼界線」規範。驗證：文件中不再有把 mobile 當成現役元件的規範；唯一允許的例外是一句標示「已停止維護、保存在 `mobile-v1.6.1` tag」的歷史註記。
- [x] 8.3 更新 `openspec/config.yaml` 的 `context` 區塊，改述為 backend + web 雙元件、web 技術棧已確定（Vite + React 19），並移除 mobile 的版號與 tag 規則。驗證：`spectra instructions proposal --change remove-mobile-app-flatten-web-routes --json` 回傳的 `context` 不再提及 `apps/mobile`。
- [x] 8.4 更新 `apps/web/CLAUDE.md` 的專案結構、路由清單與舊 URL redirect 說明，使其與 `routes.tsx` 實際內容一致。驗證：逐條比對文件路由表與 `routes.tsx`，兩者路徑與元件對應完全相同。
- [x] 8.5 將 `apps/web/package.json` 的 `version` 由 `1.4.5` bump 到 `1.5.0`（路由與頁面結構屬使用者可見的行為變更，依 semver 為 minor）。驗證：`node -p "require('./apps/web/package.json').version"` 輸出 `1.5.0`。

## 9. 整體驗證

- [x] 9.1 確認 web 建置與測試全綠：`pnpm build`（含 `tsc -b`）、`pnpm test`、`pnpm format:check` 三者皆通過，無型別錯誤、無失敗測試、無格式落差。
- [x] 9.2 以 Claude in Chrome 在本機 dev server 逐條走過新路由與全部七條 legacy redirect，確認每條舊路徑都落在正確的新位置、landing 頁 CTA 能進入 `/app`、未知路徑顯示自訂 `NotFoundPage`，並截圖存證。
