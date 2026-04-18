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

### Version / Last-updated source: 僅常數檔的「最後更新」日期；不顯示 Web 版號

**選擇**：

- **Last updated 日期**：新增 `apps/web/src/lib/config/privacy-policy.ts` 匯出 `PRIVACY_POLICY_LAST_UPDATED = '2026-04-18'` 常數（ISO 8601 日期字串），由開發者每次修訂內容時同步更新
- **文件版號**：**不顯示**。原初設計想復用 `__APP_VERSION__`，但經法務檢視後取消——使用者進入此頁是要讀隱私政策，Web App 版號在此上下文沒有決策意義，反而容易讓讀者誤以為「政策和 App 版號綁定」；版號資訊留在 AppLayout header 內即可

**替代方案**：獨立 `PRIVACY_POLICY_VERSION`，每次隱私內容變動獨立 bump。否決原因：增加兩個版號並存的心智負擔；以 `PRIVACY_POLICY_LAST_UPDATED` 日期 + Git 歷史追蹤已足。

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
privacy.footerLink           // IntroFooter 連結文字
privacy.metaDescription      // SEO meta description（與 intro 不同以保持簡潔）
privacy.intro                // 首段導言
privacy.sections[].id        // 以結構化陣列驅動渲染
privacy.sections[].title
privacy.sections[].body      // 支援字串或字串陣列（多段落）
privacy.contact.title        // 聯絡區塊標題
privacy.contact.body         // 聯絡說明段落（含 Data Controller 揭露）
privacy.contact.issueLinkLabel  // 前往 GitHub Issues 連結文字
privacy.contact.issueUrl     // 固定 canonical URL：https://github.com/leoho0722/naver-blog-image-downloader/issues
```

實作為扁平 JSON 時以 index 表達陣列（例 `privacy.sections.0.title`），或使用 JSON array by `t('privacy.sections', { returnObjects: true })`。此 change 採用 `returnObjects` 形式，於 type 定義處加型別標記避免使用 `any`。

**設計調整（2026-04-18 法務檢視後）**：移除了 `privacy.versionLabel`（頁面不再顯示 Web 版號）與 `privacy.contact.email`（以 GitHub Issues 取代 email）；新增 `privacy.contact.issueLinkLabel` / `issueUrl` 以支援 CTA 形式的連結。

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

主體稱謂：**本專案**（不使用「我們」或個人姓名；Data Controller 身份在 contact 章節揭露為 Leo Ho）。

**法務檢視後（2026-04-18）**：章節擴充為 10 個、移除無法兌現的「來信刪除」承諾、加入跨境傳輸 / 安全 / 法律依據章節。

**intro**

本產品為開源個人專案，以最低資料蒐集原則運作。使用者無需註冊帳號，本專案不販售資料、不投放廣告。本頁說明本專案蒐集哪些資料、如何使用，以及使用者可如何控制。

**dataCollection（蒐集範圍）**

- 使用者輸入的 Naver Blog URL：僅用於抓取圖片並打包，處理完成後即不再使用。本專案**不主動寫入長期儲存**；AWS 系統 log 可能短暫保留相關技術記錄並依 AWS 預設 rotation 自動清除（避免絕對承諾）
- 匿名裝置識別碼（僅 Mobile App）：自動建立的匿名識別碼，不含 email / 手機 / 姓名 / 社群帳號；本專案不會將其與真實身份連結。由第三方驗證服務（Firebase Authentication）產生並保存於裝置端
- 操作紀錄（僅 Mobile App）：為診斷錯誤與改善穩定性，以匿名識別碼為鍵透過 Cloud Firestore 記錄；不暴露具體 Firestore 路徑
- 當機紀錄（僅 Mobile App）：Firebase Crashlytics 自動回報；全名使用「Firebase Crashlytics」以保持一致
- 本機資料（不上傳）：語系 / 主題 / 已下載清單 / 縮圖快取

**dataUsage（用途）**

- 完成「抓取 / 打包 / 下載 Naver Blog 圖片」
- 以操作紀錄診斷錯誤、改善穩定性
- 以 Firebase Crashlytics 回報定位並修復錯誤
- 本專案明確不做：profiling、廣告、資料販售、跨第三方 App / 網站追蹤（避免與 Apple ATT 語意混淆）

**thirdParty（第三方服務）**

- AWS Lambda + S3（Amazon Web Services, Inc.）
- Firebase Authentication（Google LLC）—— 匿名登入
- Cloud Firestore（Google LLC）—— 以匿名識別碼為鍵儲存操作紀錄（**不提「UID」字眼**，與其他章節一致）
- Firebase Crashlytics（Google LLC）
- Naver：使用者有責任確認其使用情境符合 Naver 服務條款；本專案不保證抓取行為合法性，亦未取得任何 Naver 授權（L7）

**dataTransfer（跨境資料傳輸，新增）**

為提供服務，操作紀錄與當機紀錄可能儲存於美國（Google Cloud Platform）；後端打包流程於本專案選擇的 AWS 區域執行。使用本產品即表示同意。

**retention（保存與刪除）**

- S3 jobs/ 1 天 lifecycle
- Presigned URL 1 小時
- 雲端操作紀錄：不主動清除，依第三方雲端資料庫服務預設保留；由於紀錄以匿名識別碼為鍵、不與任何個資連結，**本專案沒有管道把特定紀錄對應回某位使用者**；解除安裝 App 即可停止新紀錄
- Firebase Crashlytics：依 Firebase 政策保留
- 本機快取：使用者自行清除
- **本專案承諾停止服務時一併刪除所有雲端操作紀錄**（新增，L8）

**security（資訊安全，新增）**

HTTPS/TLS 加密傳輸；雲端儲存依平台預設加密靜態資料；不匯出至未揭露的第三方。

**userRights（使用者權利）**

- 解除安裝 / 停止使用
- App 設定頁清除本機快取
- 瀏覽器清除本站 Local Storage / Cookie（若日後有寫入）
- **GDPR 第 15–20 條權利無法以個別方式履行**（因不蒐集可識別資料）；EU/EEA 使用者有特殊需求可透過 contact 提出（新增，L10）

**children（兒童隱私）**

列明三個法域的年齡差異：COPPA 13 / PIPA 14 / GDPR 16（可下調至 13）。本專案不主動蒐集上述任一分類兒童資料（L3）。

**legalBasis（法律依據與適用範圍，新增）**

EU/EEA 使用者：GDPR Art. 6(1)(b) 履行服務合約 + Art. 6(1)(f) 正當利益。其他法域強制規定另行遵守（L6）。

**changes（政策變更）**

以「最後更新」日期為準；重大變更提前於 GitHub Release Notes 與 App 內「最新消息」公告；**公告後繼續使用即視為同意**（L11）。

**contact（聯絡本專案）**

- **Data Controller 揭露**：Leo Ho（GitHub: leoho0722）（L2）
- 聯絡管道：本專案 GitHub Repo Issues（`https://github.com/leoho0722/naver-blog-image-downloader/issues`）
- 不再使用個人 email，避免被商店曝光後收到垃圾信（L13）

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
