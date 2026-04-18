## Why

為了將 App 上架到 App Store 與 Google Play，兩家商店皆強制要求提供一個「可公開訪問的隱私政策 URL」填入審核表單。目前 monorepo 尚無對應頁面可供填寫，等於阻擋上架流程。同時 Web 版本也缺少法務文件頁面，完整度不足。

以 Web 作為隱私政策的單一事實來源（SSOT），可讓 iOS / Android / Web 三端共用同一份內容與維護流程，避免未來三處各自撰寫、版本不一致。

## What Changes

- Web：新增 `/privacy` 路由與 `PrivacyPolicyPage`，渲染於既有 `PublicLayout`，支援既有 4 語系（zh-TW / en / ja / ko）與 light / dark 主題
- Web：`PrivacyPolicyPage` 顯示「最後更新日期」與文件版號，內容涵蓋資料蒐集、使用方式、第三方服務（AWS / Firebase Auth 匿名登入 / Firestore 操作 log / Crashlytics）、資料保存（S3 lifecycle 1 天、下載 URL 1 小時、Firestore 依 Firebase 政策）、使用者權利、兒童隱私、變更通知、聯絡資訊，符合 App Store / Google Play 審查所需條目；具體文字草綱見 `design.md` 的「內容草綱」章節
- Web：i18n 新增 `privacy.*` namespace，4 語系平行翻譯；`IntroFooter` 新增「隱私政策」連結（`IntroNav` 不加，避免頂部列過擁擠，也符合多數專案把法務連結放頁尾的慣例）
- Web：`NotFoundPage` CTA 可選擇性加入隱私政策連結（非必要，視版型而定）
- Web：**不**為 `/privacy` 提供舊路徑相容 redirect（無既有外部連結需保留，直接以 `/privacy` 為唯一 canonical path）
- Mobile：`SettingsView` 新增「隱私政策」`ListTile`，點擊後以 `url_launcher` 開啟系統預設瀏覽器導向 `https://leoho0722.github.io/naver-blog-image-downloader/privacy`（或等價 canonical URL）
- Mobile：新增 `privacy_policy_url` 設定常數，集中管理目標 URL，方便日後調整 domain
- Web：`/privacy` 的 canonical URL 須在 `index.html` 加 `<link rel="canonical">`，並在 meta tags 加上基本 SEO 標記，供商店審查爬蟲與使用者分享預覽

## Non-Goals

- **不做**：App 內嵌 WebView 顯示隱私政策（本次以外部瀏覽器開啟為主；若未來上架審查要求可重新評估）
- **不做**：新增使用者條款（Terms of Service）或其他法務文件頁面；本 change 僅處理 Privacy Policy，未來若需 ToS 另起 change
- **不做**：後端 API 變動；隱私政策為純靜態頁面，無需 backend 支援
- **不做**：Cookie Consent Banner、GDPR 勾選同意流程；目前 App/Web 皆不使用第三方追蹤 cookie，後續若導入 analytics 再處理
- **不做**：隱私政策版號化 changelog 頁面；以單一頁面顯示「最後更新日期」即可，不做歷史版本瀏覽

## Capabilities

### New Capabilities

- `web-privacy-policy`：Web `/privacy` 頁面 —— 路由、頁面結構、i18n 4 語系內容、最後更新日期與版號顯示、canonical URL / meta tags、IntroFooter / IntroNav 連結整合

### Modified Capabilities

- `web-app-foundation`：新增 `/privacy` 路由到 `createBrowserRouter`，渲染 `PrivacyPolicyPage` 於 `PublicLayout` 下；同時擴充 `public-navigation.ts` 導覽設定
- `settings-view`：新增「隱私政策」`ListTile` 項目，點擊後以 `url_launcher` 開啟外部瀏覽器導向 Web canonical URL

## Impact

- 受影響 specs：`web-privacy-policy`（新）、`web-app-foundation`、`settings-view`
- 受影響程式碼：
  - Web：
    - 新檔：`apps/web/src/pages/PrivacyPolicyPage.tsx`
    - 新檔：`apps/web/src/components/privacy/PrivacyPolicyContent.tsx`（可拆分章節元件）
    - 修改：`apps/web/src/routes.tsx`（加入路由 + redirects）
    - 修改：`apps/web/src/lib/i18n/messages/{zh-TW,en,ja,ko}.json`（新增 `privacy.*` namespace）
    - 修改：`apps/web/src/components/intro/IntroFooter.tsx`（加入連結）
    - 修改：`apps/web/src/lib/config/public-navigation.ts`（導覽設定）
    - 修改：`apps/web/index.html`（canonical link、Open Graph meta）
    - 新增測試：`apps/web/src/__tests__/pages/PrivacyPolicyPage.test.tsx`、`apps/web/src/__tests__/routes.test.tsx`（既有檔案擴充）、`apps/web/src/__tests__/lib/i18n/privacy-parity.test.ts`
  - Mobile：
    - 新檔：`apps/mobile/lib/config/privacy_policy_url.dart`（URL 常數）
    - 修改：`apps/mobile/lib/ui/settings/widgets/settings_view.dart`（新增 ListTile）
    - 修改：`apps/mobile/lib/l10n/app_{zh_Hant,en,ja,ko}.arb`（新增 i18n key）
    - 新增測試：對應 `settings_view_test.dart` 擴充
- 版號 bump：
  - `apps/web/package.json`：minor bump（使用者可見新功能與新頁面）
  - `apps/mobile/pubspec.yaml`：minor bump（設定頁新增使用者可見項目）
  - `apps/backend/pyproject.toml`：**不需** bump（本次無 backend 改動）
- 依賴：Mobile 若尚未引入 `url_launcher` 需加入 `pubspec.yaml`（專案通常已有，apply 階段先確認）
- 商店審查：完成後可將 `https://leoho0722.github.io/naver-blog-image-downloader/privacy` 填入 App Store Connect 與 Google Play Console 的「Privacy Policy URL」欄位
