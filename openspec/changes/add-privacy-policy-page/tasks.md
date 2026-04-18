## 1. Web 基礎建設與設定

- [x] 1.1 建立 `apps/web/src/lib/config/privacy-policy.ts`，實作 **Privacy-policy config constants**：匯出 `PRIVACY_POLICY_LAST_UPDATED`（ISO 8601 日期字串，初始值 `'2026-04-18'`）與 `PRIVACY_POLICY_CONTACT_EMAIL`（初始值 `'leo160918@gmail.com'`），並補測試覆蓋常數格式
- [x] 1.2 依 design 決策「**Version / Last-updated source: 常數檔 + 建置時 `__APP_VERSION__`**」確認 `__APP_VERSION__` 注入仍可用（若現行 `vite-env.d.ts` 已有型別即可），否則補齊
- [x] 1.3 `apps/web/package.json` 執行 minor bump（`1.2.0 → 1.3.0`）

## 2. Web i18n 內容

- [x] 2.1 依 design 決策「**Content source: i18n JSON 檔案中的結構化章節而非 Markdown 檔案**」與「**i18n key 結構**」，並以 design.md「Content outline」章節為撰稿依據，於 `apps/web/src/lib/i18n/messages/zh-TW.json` 新增 `privacy` namespace（pageTitle / lastUpdatedLabel / versionLabel / intro / footerLink / sections[] / contact.title / contact.email 等 key）；sections 共 7 項：dataCollection、dataUsage、thirdParty、retention、userRights、children、changes（intro 則獨立為 `privacy.intro` 頂層 key，避免重複）；內容忠實揭露 Firebase Authentication 匿名登入、Cloud Firestore 操作 log（`users/{uid}/logs`）、Crashlytics、AWS S3 lifecycle 1 天自動刪除與 presigned URL 1 小時有效等事實
- [x] 2.2 在 `en.json`、`ja.json`、`ko.json` 同步新增 `privacy` namespace，實現 **Four-locale content coverage with structural parity**（四語系 key path 與 sections id 順序一致）
- [x] 2.3 撰寫 `apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts`：斷言四語系 `privacy.*` key path 集合相同、`privacy.sections` 陣列長度相同、各 index 的 `id` 相同

## 3. Web 頁面與元件

- [x] 3.1 建立 `apps/web/src/pages/PrivacyPolicyPage.tsx`，渲染 **Privacy policy page at /privacy** 所有必要區塊（標題、最後更新 / 版本列、intro、sections、contact），版本列使用 `v${__APP_VERSION__}`
- [x] 3.2 依 design 「**SEO / Canonical**」決策實作 **Page-level meta set at runtime**：抽出 `apps/web/src/lib/hooks/use-page-meta.ts`（useEffect 設定 `document.title` 與 `<meta name="description">`，unmount 時還原 title）並於 `PrivacyPolicyPage` 呼叫
- [x] 3.3 新增 `apps/web/src/components/privacy/PrivacyPolicySection.tsx`，負責單一章節渲染（title + body string 或 paragraph 陣列）
- [x] 3.4 `apps/web/src/__tests__/pages/PrivacyPolicyPage.test.tsx`：測試四語系下標題、最後更新日期、版本字串、section 陣列渲染、contact 區塊、unmount 還原 title、meta description 寫入

## 4. Web 路由與導覽整合

- [x] 4.1 依 design 決策「**Route layout: `PublicLayout` 下的獨立路由**」更新 **React Router v7 routing with two routes**：在 `apps/web/src/routes.tsx` 加入 `/privacy` route，掛於 `PublicLayout` 下渲染 `PrivacyPolicyPage`
- [x] 4.2 依 design「**不提供舊路徑 redirect**」決策：**不**為 `/privacy` 新增 alias redirect，保持唯一 canonical URL
- [x] 4.3 擴充 `apps/web/src/__tests__/routes.test.tsx`：覆蓋 `/privacy` 渲染（同時更新 module-level i18n mock 以支援 `returnObjects`）
- [x] 4.4 依 design「**i18n key 結構**」於 `apps/web/src/lib/config/public-navigation.ts` 新增 `PUBLIC_FOOTER_LINKS` 陣列，並實作 **Privacy link in IntroFooter**：修改 `apps/web/src/components/intro/IntroFooter.tsx` 以陣列驅動渲染 Privacy 連結
- [x] 4.5 新增 `apps/web/src/__tests__/components/intro/IntroFooter.test.tsx`：驗證 privacy 連結顯示、href 指向 `/privacy`、GitHub 連結仍在

## 5. Mobile 設定頁整合

- [x] 5.1 建立 `apps/mobile/lib/config/privacy_policy_url.dart` 實作 **Privacy-policy URL constant module**，匯出 `const String privacyPolicyUrl = 'https://leoho0722.github.io/naver-blog-image-downloader/privacy'`
- [x] 5.2 `apps/mobile/pubspec.yaml` 原本未引入 `url_launcher`，新增 `url_launcher: ^6.3.1` 並執行 `flutter pub get` 完成安裝
- [x] 5.3 依 design 「**Mobile 整合：`url_launcher` + 外部瀏覽器**」更新 `apps/mobile/lib/ui/settings/widgets/settings_view.dart`，實作 **Privacy policy ListTile opens external browser**：新增「法律資訊」區段 + `Card.filled + ListTile`，title 綁 `settingsPrivacyPolicyTitle`、trailing `Icons.open_in_new`、點擊以 `LaunchMode.externalApplication` 呼叫 `launchUrl(Uri.parse(privacyPolicyUrl))`
- [x] 5.4 在失敗分支顯示 `SnackBar`，訊息綁 `settingsPrivacyPolicyLaunchFailed`；維持 `mounted` 檢查避免 dispose 後 setState
- [x] 5.5 於 `apps/mobile/lib/l10n/app_zh_TW.arb`、`app_zh.arb`、`app_en.arb`、`app_ja.arb`、`app_ko.arb` 新增 `settingsSectionLegal` / `settingsPrivacyPolicyTitle` / `settingsPrivacyPolicyLaunchFailed`；`flutter pub get` 自動重跑 gen-l10n，確認 `app_localizations_*.dart` 已包含新 keys
- [x] 5.6 新增 `apps/mobile/test/config/privacy_policy_url_test.dart`：驗證 `privacyPolicyUrl` 常數值、協定、結尾路徑、host 解析；**註**：完整 `SettingsView` widget 測試（ListTile tap / SnackBar）需要新建 ProviderScope 覆寫 + `UrlLauncherPlatform` mock + `PackageInfo.setMockInitialValues` 的測試 scaffold（目前 repo 內尚無 SettingsView 的 widget 測試基礎），建議列為後續 change 處理
- [x] 5.7 `apps/mobile/pubspec.yaml` 執行 minor bump（`1.5.1+1 → 1.6.0+2`）

## 6. 跨平台驗證與收尾

- [x] 6.1 `apps/web/` 執行 `pnpm test`（17 檔 73 測試全過）、`pnpm build`（成功產出 dist）、`pnpm format:check`（Prettier 全過）
- [x] 6.2 依 `feedback_verify_via_claude_in_chrome.md` 偏好，以 Claude in Chrome 啟動 `pnpm dev` 在 localhost:5173 實際驗證：
  - `/privacy` zh-TW / en / ja / ko 四語系切換完整，`document.title`、h1、8 個 h2、footer 連結、meta description 同步變動
  - 主題切換器 dark → light，`<html class="dark">` 正確移除、`color-scheme` 切換
  - 由 `/` 點 footer「隱私政策」連結 SPA 導覽到 `/privacy` 正常
  - 在 `/privacy` 直接 reload，URL 與內容仍正確
  - `/legal/privacy` 依決策不 redirect、正確落入 NotFoundPage
  - Console 無 error / warning
- [x] 6.3 `apps/mobile/` 執行 `flutter analyze` No issues found、`flutter test` 140 tests all passed（含新 privacy_policy_url_test 4 項）；iOS 模擬器實機點擊驗證留給使用者（需要實體裝置 / 模擬器才能驗證 `url_launcher` 真實行為）
- [x] 6.4 已 commit（`9738c0a` — `feat(privacy): 新增共用隱私政策頁面供 App 上架使用`），body 以列點摘要 Web / Mobile / i18n / 揭露範圍四個面向，含兩端 minor bump，38 files changed +1633/-13
