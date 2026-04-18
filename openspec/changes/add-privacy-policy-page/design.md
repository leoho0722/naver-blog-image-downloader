## Context

本 change 為 App Store / Google Play 上架提供共用的隱私政策頁面，並為 Web 版補上法務文件。是跨平台改動：Web 產出 canonical 頁面，Mobile 透過外部瀏覽器導向同一 URL。目前專案：

- Web（`apps/web/`）已有 `PublicLayout` / `IntroFooter` / `IntroNav` / 4 語系 i18n（zh-TW、en、ja、ko）/ 版本注入（`__APP_VERSION__`）
- Mobile（`apps/mobile/`）`SettingsView` 為 Material 3 `Card.filled + ListTile` 結構；專案內通常已有 `url_launcher` 套件用於外部連結
- GitHub Pages 部署 base path 為 `/naver-blog-image-downloader/`，故最終 canonical URL 為 `https://leoho0722.github.io/naver-blog-image-downloader/privacy`

利害關係人：上架審查員（App Store / Google Play）、終端使用者（可能透過分享或 App 設定頁進入）、未來維護者（需要單處修改、多處同步）。

## Goals / Non-Goals

**Goals:**

- 以 Web 為隱私政策 SSOT，一次撰寫、四語系翻譯、Web + Mobile 共用
- `/privacy` 是穩定 canonical URL，可直接填入商店審查表單
- 頁面必須清楚顯示「最後更新日期」以利審查與使用者辨識版本
- Mobile `SettingsView` 有顯眼但不打擾的入口，點擊後以原生瀏覽器開啟，不破壞 App 體驗
- 內容章節遵循 App Store / Google Play 常見隱私政策要素：資料蒐集 / 使用方式 / 第三方服務 / 使用者權利 / 聯絡方式 / 兒童隱私 / 變更通知

**Non-Goals:**

- 不做 App 內 WebView 嵌入
- 不做歷史版本瀏覽頁（以單次更新日期 + Git 歷史為追蹤）
- 不引入 Cookie Consent Banner、GDPR 同意彈窗
- 不連動 analytics / crash 報告（目前 App/Web 尚未導入）
- 不處理 ToS（Terms of Service），保留給未來 change

## Decisions

### Content source: i18n JSON 檔案中的結構化章節而非 Markdown 檔案

**選擇**：在 `apps/web/src/lib/i18n/messages/{locale}.json` 新增 `privacy.*` namespace，以結構化 key 組織章節（如 `privacy.sections.dataCollection.title` / `privacy.sections.dataCollection.body`），`PrivacyPolicyPage` 以陣列 map 出 section。

**替代方案**：

- **Markdown 檔案 + react-markdown**：每語系一個 `.md`，執行期載入並渲染。優點是內容易讀易編輯；缺點是多語言一致性（章節對齊）要額外檢查、增加 runtime 依賴、與既有 i18n 系統不一致。
- **後端 API**：違反 SSOT 極簡原則，且引入部署耦合。

**理由**：i18n JSON 與現有機制一致（已有 `intro.*`、`notFound.*` namespace），可透過既有 i18n parity 測試確保 4 語系 key 對齊，不引入新依賴。章節用結構化 key 陣列便於加 / 移 / 重排，並可在測試中驗證所有語系含相同 section id。

### Version / Last-updated source: 常數檔 + 建置時 `__APP_VERSION__`

**選擇**：

- **Last updated 日期**：新增 `apps/web/src/lib/config/privacy-policy.ts` 匯出 `PRIVACY_POLICY_LAST_UPDATED = '2026-04-18'` 常數（ISO 8601 日期字串），由開發者每次修訂內容時同步更新（與版號 bump 一起送 PR）
- **文件版號**：直接復用 `__APP_VERSION__`（Web 版），顯示為 `v<semver>`；使用者看到的是「Web 版 v1.x.y，最後更新 2026-04-18」

**替代方案**：獨立 `PRIVACY_POLICY_VERSION`，每次隱私內容變動獨立 bump。否決原因：增加兩個版號並存的心智負擔；Web 版號變動本就伴隨 PR，最後更新日期足以判別。

### Route layout: `PublicLayout` 下的獨立路由

**選擇**：`/privacy` 註冊於 `createBrowserRouter`，渲染於既有 `PublicLayout`（共用 `IntroNav` / `IntroFooter`）。同步在 `public-navigation.ts` 加入項目，讓所有 Public 頁面 footer / nav 皆可導向。

**替代方案**：

- 加到 `/intro/privacy`：與 IntroMobile/IntroWeb 放同組。否決原因：`/privacy` 語意清楚、對商店填表與使用者直覺較佳；`/intro/privacy` 仍以 legacy redirect 方式支援。
- 放在 `AppLayout` 下的 `/app/web/privacy`：否決原因：應為 Public 頁面，不該只在 SPA 內。

### Mobile 整合：`url_launcher` + 外部瀏覽器

**選擇**：`SettingsView` 新增一個 `Card.filled + ListTile`，title 「隱私政策」，trailing 放 `open_in_new` icon；點擊後呼叫 `launchUrl(Uri.parse(...), mode: LaunchMode.externalApplication)`。URL 常數抽到 `apps/mobile/lib/config/privacy_policy_url.dart`。

**替代方案**：

- **WebView 嵌入**：需要 `webview_flutter` 及導覽控制、dark mode 與字體大小整合。成本過高且內容變動時沒有跟著更新的好處（WebView 本身也是載入遠端頁面）。
- **在 App 內顯示當地靜態文案**：違反 SSOT、須三處同步維護、語系切換亦須自製。

**失敗時行為**：若 `launchUrl` 回傳 false（例如裝置無預設瀏覽器、URL 無效），`SettingsView` SHALL 顯示 `SnackBar` 告知「無法開啟隱私政策，請檢查網路連線」，訊息 i18n 化；不得 crash 也不得靜默失敗。

### i18n key 結構

```text
privacy.pageTitle            // 頁面標題，例：「隱私政策」
privacy.lastUpdatedLabel     // 「最後更新」
privacy.versionLabel         // 「文件版本」
privacy.intro                // 首段導言
privacy.sections[].id        // 以結構化陣列驅動渲染
privacy.sections[].title
privacy.sections[].body      // 支援字串或字串陣列（多段落）
privacy.contact.title
privacy.contact.email        // 聯絡信箱（以 CLAUDE.md 的 leo160918@gmail.com 或專案 issue 連結為準，apply 時再由使用者確認）
```

實作為扁平 JSON 時以 index 表達陣列（例 `privacy.sections.0.title`），或使用 JSON array by `t('privacy.sections', { returnObjects: true })`。此 change 採用 `returnObjects` 形式，於 type 定義處加型別標記避免使用 `any`。

### SEO / Canonical

`index.html` 為 Vite 單 HTML，所有路由共用同一份 `<head>`。路由層級 meta（per-route Open Graph）非本 change 目標，但本頁須在 `index.html` 補 `<link rel="canonical" href="https://leoho0722.github.io/naver-blog-image-downloader/privacy">`…… 的做法行不通（因為所有路由共用）。改採：`PrivacyPolicyPage` 內使用 `useEffect` 動態設定 `document.title` 與 `<meta name="description">`（可抽成 `usePageMeta` hook，後續 intro 頁亦可共用），canonical 暫以 `index.html` 中維持專案 URL，待未來若引入 SSG / react-helmet 再細化。

### 不提供舊路徑 redirect

`/privacy` 是本 change 首次建立的 canonical URL，上線前外界並無 `/legal/privacy`、`/intro/privacy` 之類的既有連結需要相容。為避免多條等價路徑分散商店 / SEO / 使用者直覺，一律以 `/privacy` 為唯一入口；未知路徑由 `*` catch-all 交給 `NotFoundPage` 處理。若未來真的出現別名需求再新開 change 補 redirect。

## Risks / Trade-offs

- **風險：隱私政策內容需法務審閱**。本 change 僅建立頁面框架與章節結構；實際文字可能需要法務 / 負責人二次校正。→ 緩解：apply 階段先以「撰稿草案」形式標記，釋出前請 user 最後確認；章節與 key 結構確立後，翻譯 / 潤稿不會破壞程式碼結構。
- **風險：4 語系翻譯品質不一**。直翻可能出現法律語意偏差。→ 緩解：以 zh-TW 為 master 寫清楚，en/ja/ko 使用 LLM 翻譯後由 user 快速檢視；`privacy-parity.test.ts` 強制 key 對齊、catch 漏翻。
- **風險：Mobile `url_launcher` 若專案未引入需新增依賴**。→ 緩解：apply 階段先讀 `pubspec.yaml` 確認，必要時 bump 並載入；若已有則直接使用。
- **風險：商店審查 URL 在專案換 domain 時需同步**。→ 緩解：URL 常數抽到單一檔案（`privacy_policy_url.dart` / Web 則內嵌於元件），搜尋即可完全替換。
- **Trade-off：以 JSON 承載長文**。文件若長達數千字會讓 JSON 檔變長；但相較引入 Markdown pipeline 的工具鏈成本，直接擴充 JSON 更務實，對 bundle 大小影響可忽略（i18n 檔會隨使用者選中語系載入）。
- **Trade-off：共用 `__APP_VERSION__` 而非獨立版號**。隱私政策變動不一定伴隨版號 bump，但專案規模小且 CLAUDE.md 要求功能 / 行為變更一律 bump，故兩者事實上同步；若未來分離需求浮現再重構。

## Content outline（apply 階段作為 zh-TW.json master 撰稿依據）

主體稱謂：**專案名義**（「Naver Blog Image Downloader」）；不以個人名義署名。

**intro**

本產品為開源個人專案，以最低資料蒐集原則運作。使用者無需註冊帳號，本產品不販售資料、不投放廣告。本頁說明我們（指專案）蒐集哪些資料、如何使用、以及使用者可如何控制。

**dataCollection（蒐集範圍）**

- 使用者輸入的 Naver Blog URL：由 App 或 Web 傳送至我們的後端服務，僅用於抓取圖片並打包，處理完成後不再保留
- 匿名使用者識別碼（僅 Mobile App）：App 首次啟動時透過 Firebase Authentication 自動建立匿名 UID，該 UID 用於綁定當機回報與操作 log；**不含 email、手機號碼、姓名、社群帳號等個資**，且 UID 由裝置端保管（iOS Keychain / Android EncryptedSharedPreferences）
- 操作 log（僅 Mobile App）：重要操作（如抓取、下載、清除快取等）會以結構化文件寫入 Firestore `users/{anonymousUid}/logs/{auto-id}`，欄位包含操作類型、時間戳、相關 metadata、裝置資訊（OS 版本、機型）
- 當機堆疊（僅 Mobile App）：透過 Firebase Crashlytics 自動回報；內容為堆疊追蹤與裝置資訊，用於修復 bug
- 本機資料（不上傳）：語系、主題偏好、已下載圖片清單與縮圖快取，僅儲存於裝置，可透過設定頁「清除快取」移除

**dataUsage（用途）**

- 完成「抓取 / 打包 / 下載 Naver Blog 圖片」功能
- 以操作 log 診斷錯誤、改善穩定性
- 以當機回報定位 bug
- 明確不做：profiling、廣告投放、資料販售、跨 App 追蹤

**thirdParty（第三方服務）**

- **AWS Lambda + S3**：後端打包流程與圖片 ZIP 暫存，由專案所有者管理
- **Firebase Authentication**（Google LLC）：匿名登入，session 由 Firebase SDK 處理並持久化於裝置
- **Cloud Firestore**（Google LLC）：操作 log 儲存
- **Firebase Crashlytics**（Google LLC）：當機回報
- **Naver**：由使用者輸入的 URL 從 Naver Blog 抓取圖片，對應 Naver 自身的 Cookie 與 Terms

每項服務均連結至其官方隱私政策 URL（apply 階段確認連結有效）。

**retention（保存與刪除）**

- S3 打包後 ZIP 檔案：透過 bucket lifecycle rule `jobs/` 前綴物件 **1 天後自動刪除**
- 下載 presigned URL：**1 小時** 後過期
- Firestore 操作 log：目前不主動清除，依 Firebase 政策保留；使用者如需刪除可透過 `PRIVACY_POLICY_CONTACT_EMAIL` 信箱提出請求，我們將刪除該匿名 UID 下所有文件
- Crashlytics：依 Firebase 政策保留
- 本機快取：由使用者透過 App 設定頁「清除快取」即時清除

**userRights（使用者權利）**

- 無帳號系統，沒有「登出」概念；要停止使用直接解除安裝 App 或不使用 Web
- 可透過本頁 contact 信箱請求刪除 Firestore 中關聯該匿名 UID 的所有 log 文件
- 可於 App 設定頁清除本機快取
- 在 Web 可於瀏覽器設定清除本站 Local Storage / Cookie（若未來有加）

**children（兒童隱私）**

本產品不針對 13 歲以下兒童設計，不主動蒐集兒童資料。使用年齡分級以 App Store / Google Play 上架分級為準。

**changes（變更通知）**

隱私政策以本頁「最後更新日期」為準。重大變更會透過 GitHub Release Notes 與 App 內 What's New 揭露。

**contact**

- Email：`PRIVACY_POLICY_CONTACT_EMAIL` 常數（預設 `leo160918@gmail.com`）
- GitHub Issues：專案 repo issues 頁面（apply 階段補上正確 URL）

## Migration Plan

此為新增功能，無 breaking change，無需 migration / rollback 策略。發布步驟：

1. apply 階段完成 Web + Mobile 改動，兩端各自 minor bump
2. PR merge 到 `main` → Web CI/CD 發布 Web v\<semver\> → Deploy Pages 部署 `/privacy` 可訪問
3. Mobile CD 產出新版 build；商店填表時以 `https://leoho0722.github.io/naver-blog-image-downloader/privacy` 作為隱私政策 URL
4. 若未來需要撤回或大幅變動，於 Git 歷史保有先前版本，並同步更新 `PRIVACY_POLICY_LAST_UPDATED`

## Open Questions

- 隱私政策聯絡信箱是否使用 `leo160918@gmail.com`？或改用 GitHub Issues URL 作為對外聯絡管道？（apply 階段請 user 確認；預設使用 `leo160918@gmail.com`）

**Resolved (不再為開放問題):**

- Web 隱私政策連結只放 `IntroFooter`，不加入 `IntroNav`（頂部列不擴充，以符合法務連結放頁尾的慣例；已於 2026-04-18 決議）
