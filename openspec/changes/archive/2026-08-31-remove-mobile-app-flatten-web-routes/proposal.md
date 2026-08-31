## Why

專案決定停止行動版（Flutter iOS/Android App）的開發與維護，monorepo 只保留 `apps/backend/`（AWS Lambda）與 `apps/web/`（Vite + React Web App）兩個元件。

Mobile 移除後，Web 端目前為「先選平台、再進 App」而設計的路由結構就失去了意義：

- 根頁面 `/` 是一張「App 版 / Web 版」雙卡選擇頁，但選項只剩一個。
- `/intro/web`、`/app/web` 這些路徑中的 `web` 限定詞，是為了與 `mobile` 區隔而存在的，現在只是多餘的一層。
- 使用者要看到真正的產品介紹，必須先點過一層無意義的中介頁。

同時，`openspec/specs/` 下有 48 份只描述 Flutter 程式碼的 spec、隱私政策仍宣告蒐集 Mobile App 的當機與操作紀錄、README 與 CI/CD 仍以三元件架構描述專案——這些都會在 mobile 移除後變成誤導後續維護者的錯誤事實。

## What Changes

### 移除 mobile 版

- **BREAKING** 刪除 `apps/mobile/`（Flutter 專案，約 234 MB）。
- 刪除 `.github/workflows/mobile-ci.yml` 與 `.github/workflows/mobile-cd.yml`。
- 刪除 `openspec/specs/` 下 48 份僅描述 Flutter 程式碼的 spec 目錄。
- 更新 `README.md`、根 `CLAUDE.md`、`openspec/config.yaml`，改以 backend + web 雙元件描述專案架構、版號管理表與 CI/CD 表；移除 mobile 專屬的「Screenshot / test-only 程式碼界線」規範。
- 更新隱私政策四語系文案：移除只適用於 Mobile App 的條款（匿名裝置識別碼、Firebase Authentication / Cloud Firestore / Crashlytics、本機快取清除、解除安裝 App 等），並把「App 或 Web」一類的措辭收斂為 Web。

### 移除 Web 端的 mobile 介紹內容

- **BREAKING** 刪除 `/intro/mobile` 路由與 `IntroMobilePage`。
- 刪除只服務該頁的元件：`DownloadBadge`、`ScreenshotCarousel`、`StepCard`，以及對應測試。
- 刪除 `public/intro/mobile/` 下 8 張 iOS/Android 截圖。
- 刪除 i18n `intro.mobile.*` 全部鍵值（四語系）與 `notFound.ctaMobileIntro`。
- 移除 `INTRO_MOBILE_ANCHOR_LINKS` 以及唯一服務它的頁內錨點機制（`AnchorLink`、`PublicRouteHandle`、`IntroNav` 的 `anchorLinks` prop、`PublicLayout` 的 `useMatches` 判斷）。

### 扁平化 Web 路由

- **BREAKING** 新路由樹：

  | 路徑 | 頁面 | Layout |
  | --- | --- | --- |
  | `/` | `LandingPage`（產品介紹頁） | `PublicLayout` |
  | `/privacy` | `PrivacyPolicyPage` | `PublicLayout` |
  | `/app` | `HomePage`（SPA 入口） | `AppLayout` |
  | `/app/gallery/:blogId` | `GalleryPage` | `AppLayout` |
  | `*` | `NotFoundPage` | `PublicLayout` |

- `IntroRootPage`（雙卡選擇頁）與 `IntroWebPage`（Web 介紹頁）合併為單一 `src/pages/LandingPage.tsx`：沿用 `IntroRootPage` 的產品標題與雙行 tagline 作為 hero，其後接 `IntroWebPage` 的四張 feature card、主 CTA（導向 `/app`）與技術棧說明；移除已無父層可回的「返回首頁」連結。刪除 `src/pages/intro/` 目錄。
- i18n 對應收斂：`intro.web.*` 的 feature / CTA / 技術棧鍵值併入 `intro.root.*`，刪除 `intro.root.cardAppTitle`、`cardAppDesc`、`cardWebTitle`、`cardWebDesc`、`cardLearnMore` 與整個 `intro.web.*`。
- 舊 URL 一律以 `<Navigate replace>` 導向最近的可冷啟入口：

  | 舊路徑 | 導向 |
  | --- | --- |
  | `/intro/web`、`/intro/mobile`、`/web` | `/` |
  | `/app/web`、`/web/app` | `/app` |
  | `/app/web/gallery/:blogId`、`/web/app/gallery/:blogId` | `/app`（丟棄 `blogId`） |

- `NotFoundPage` 的三顆 CTA 縮為兩顆：回首頁（`/`）、前往 Web App（`/app`）。
- `apps/web/package.json` 版號 minor bump（`1.4.5` → `1.5.0`）：路由與頁面結構屬對使用者可見的行為變更。

## Non-Goals

- **不重新設計 landing 頁的視覺**。本次只做內容合併與連結修正，沿用既有的 hero／feature card／CTA 版型與 M3 色彩，不調整配色、間距或動畫。
- **不重新命名 `src/components/intro/`**。`IntroNav`、`IntroFooter`、`FeatureCard` 仍由 `PublicLayout` 與 landing 頁使用，改名只會擴大 diff 而不改變行為。
- **不為 48 份 mobile spec 各寫一份 REMOVED delta**。這些 capability 的實作已整份消失，逐一撰寫 delta 只是把同一件事複寫 48 次；改為在 tasks 中直接刪除 spec 目錄，並在本提案的 Impact 中列出完整清單作為紀錄。git history 保留全部內容。
- **不改動 backend**。`apps/backend/` 的 API 契約、部署流程、CI/CD 完全不動。
- **不清理 `.claude/settings.local.json`** 中殘留的 mobile 相關 Bash 權限項目。那是本機工具允許清單，不影響任何產品行為。
- **不保留 `/intro/mobile` 的 410/404 語意**。舊路徑一律 redirect 到 `/`，與既有的 legacy redirect 策略一致。

## Capabilities

### New Capabilities

- `web-landing`: 單一產品介紹頁（`/`）—— 取代原先的 `web-intro-root`（雙卡選擇頁）與 `web-intro-web`（Web 介紹頁），涵蓋 hero、四張 feature card、導向 `/app` 的主 CTA、技術棧說明與四語系支援。

### Modified Capabilities

- `web-app-foundation`: 路由樹定義變更——SPA 入口由 `/app/web` 改為 `/app`、相簿頁由 `/app/web/gallery/:blogId` 改為 `/app/gallery/:blogId`，並移除 `/intro/*` 層級。
- `web-intro-root`: 移除。根路由 `/` 的行為由新的 `web-landing` 承接。
- `web-intro-web`: 移除。`/intro/web` 不再存在，內容併入 `web-landing`。
- `web-intro-mobile`: 移除。`/intro/mobile` 與 `IntroMobilePage` 整份刪除。
- `web-legacy-redirects`: redirect 對應表全面改寫，新增 `/intro/web`、`/intro/mobile`、`/app/web`、`/app/web/gallery/:blogId` 四條規則。
- `web-privacy-policy`: 隱私政策內容移除 Mobile App 專屬的資料蒐集、第三方服務與使用者權利條款。

## Impact

### 刪除的目錄與檔案

- `apps/mobile/`（整個 Flutter 專案）
- `.github/workflows/mobile-ci.yml`、`.github/workflows/mobile-cd.yml`
- `apps/web/src/pages/intro/`（`IntroRootPage.tsx`、`IntroWebPage.tsx`、`IntroMobilePage.tsx`）
- `apps/web/src/components/intro/DownloadBadge.tsx`、`ScreenshotCarousel.tsx`、`StepCard.tsx`
- `apps/web/src/__tests__/components/intro/DownloadBadge.test.tsx`
- `apps/web/public/intro/mobile/`（8 張 PNG）
- `openspec/specs/` 下 48 份 mobile-only spec：
  `api-dtos`、`api-service`、`app-config`、`app-icon-service`、`app-l10n`、`app-router`、`app-settings-viewmodel`、`app-theme`、`auth-service`、`blog-input-view`、`blog-input-viewmodel`、`bottom-sheet-animation`、`cache-eviction`、`cache-metadata`、`cache-repository`、`crashlytics-service`、`download-view`、`download-viewmodel`、`extensions`、`file-download-service`、`gallery-service`、`local-storage-service`、`log-repository`、`log-service`、`native-photo-viewer-android`、`native-photo-viewer-ios`、`native-test-infra`、`naver-url-validator`、`photo-detail-view`、`photo-detail-viewmodel`、`photo-entity`、`photo-gallery-view`、`photo-gallery-viewmodel`、`photo-repo-download`、`photo-repo-fetch`、`photo-repo-save`、`photo-viewer-service`、`project-dependencies`、`provider-di`、`result-models`、`result-type`、`riverpod-di`、`screenshot-automation`、`settings-repository`、`settings-view`、`settings-viewmodel`、`supported-locale`、`whats-new-onboarding`

  （注意：`naver-url-validator` 為 Flutter 端的 URL 驗證 spec；Web 端另有 `apps/web/src/lib/services/url-validator.ts`，其行為由 `web-app-foundation` 涵蓋，不受影響。）

### 新增的檔案

- `apps/web/src/pages/LandingPage.tsx`
- `apps/web/src/__tests__/pages/LandingPage.test.tsx`

### 修改的檔案

- `apps/web/src/routes.tsx`
- `apps/web/src/pages/NotFoundPage.tsx`
- `apps/web/src/components/layout/PublicLayout.tsx`
- `apps/web/src/components/intro/IntroNav.tsx`
- `apps/web/src/lib/config/public-navigation.ts`
- `apps/web/src/lib/i18n/messages/zh-TW.json`、`en.json`、`ja.json`、`ko.json`
- `apps/web/src/__tests__/routes.test.tsx`
- `apps/web/src/__tests__/lib/i18n/intro-parity.test.ts`
- `apps/web/src/__tests__/components/layout/PublicLayout.test.tsx`
- `apps/web/package.json`（`1.4.5` → `1.5.0`）
- `apps/web/CLAUDE.md`
- `README.md`、`CLAUDE.md`、`openspec/config.yaml`

### 對外影響

- 已被書籤或外部引用的 `/web`、`/web/app`、`/intro/web`、`/intro/mobile`、`/app/web` 等路徑全部改以 redirect 相容，使用者不會看到 404。
- GitHub Pages 的 `404.html` SPA fallback 機制不變，`deploy-pages.yml` 無需調整。
- Mobile CI/CD workflow 刪除後，`mobile-v*` tag 與既有 GitHub Release 保留不動。
