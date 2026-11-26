## Context

`apps/web` 是 Vite + React 19 + Tailwind CSS 4 的 SPA，部署在 GitHub Pages。本 change 以 modern-web-guidance 指南庫（`legacy-scan` 掃描結果 + 針對 dialog、popover、dark mode、表單、效能等主題檢索的指南）作為現代化依據。目前狀況：

- 主題：`useSettingsStore` 在 JS bundle 載入後才對 `<html>` 切換 `.dark` class，`index.css` 以 `.dark { ... }` 覆寫 token，`html { color-scheme: light }` 寫死；另以 `matchMedia` 監聽系統主題變化手動切 class。
- 浮層：`ImageViewer`、`OnboardingCard`、`DownloadProgress` 是 `createPortal` 到 `body` 的 `div role="dialog" aria-modal="true"`，各自在 `window` 掛 Esc 監聽，沒有焦點鎖定、背景不 inert、關閉後焦點不歸還、背景可捲動。
- 設定浮層：`AppHeaderControls` 以 React state 控制一個 `role="menu"` 的絕對定位 div，外加全螢幕透明遮罩處理點外面關閉。
- 字型：`index.css` 開頭以 `@import url(...)` 載入 Google Fonts 與 jsDelivr 上的 Pretendard。
- jsdom 29 的 `HTMLDialogElement` 沒有實作 `showModal()` / `close()`，也沒有 `window.matchMedia` 與 Popover API；現有單元測試全在 jsdom 執行。

瀏覽器支援政策：專案未另訂政策，依指南預設——Baseline Widely available 功能直接使用，其餘依指南 fallback 處理。

## Goals / Non-Goals

**Goals:**

- 主題在第一次繪製前就正確套用，原生 UI（捲軸、表單控制項）跟著主題變色，JS 載入失敗時仍跟隨系統。
- 三個阻擋式浮層取得原生的焦點鎖定、背景 inert、Esc／返回手勢關閉、焦點歸還與背景防捲動。
- 設定浮層使用瀏覽器原生的點外面關閉、Esc、top layer 與焦點歸還，移除錯誤的 menu 角色。
- 消除字型的 CSS import 串接、不必要的 `will-change`、檢視器一次下載全部縮圖等效能問題。
- 補齊網址輸入框、擷取進度、照片卡選取狀態、檢視器縮圖的無障礙語意。

**Non-Goals:**

- `IntroNav` 捲動陰影不改用 scroll-state container query：該功能屬 Limited availability，且頁首位於頁面最頂端時指南提供的 IntersectionObserver fallback 會誤判為已黏住，現行 passive scroll 監聽成本已低。
- 不做路由 code-splitting：目前單一 bundle 約 423 KB（gzip 約 134 KB，實測於本 change 開始前的 `pnpm build`），主要由 React、Router、i18next 等所有頁面都需要的依賴組成，拆分收益有限。
- 不刪除未被引用的 `SettingsDrawer`、`ThemeSwitcher`、`LanguageSwitcher`（死碼清理另案處理）。
- 不在設定浮層的「系統」選項顯示目前系統主題（指南列為建議，現有 segmented control 寬度放不下）。
- 不實作 `web-image-viewer` 規格中的雙指縮放（既有落差，與本 change 無關）。
- 不修正 `web-blog-input` 「剪貼簿為空時顯示 toast」的既有落差。

## Decisions

### 以 color-scheme meta 取代 html.dark class

主題的單一真實來源改為 `<meta name="color-scheme">`：系統 → `light dark`、亮色 → `light`、暗色 → `dark`。`index.html` 在該 meta 後放一段極小的 classic inline script（非 module、非 defer），以 `try/catch` 讀 `localStorage.theme` 並改寫 meta，避免首次繪製閃爍。`useSettingsStore` 仍是唯一的主題管理者，延續 `unify-landing-in-apps-web` / 兩層 Layout 切分 中「由同一個 store 管理，不重複實作」的決策，只是套用機制從 class 改為 meta。

- 選「系統」時移除 `theme` key（指南：回到系統預設時刪除紀錄），舊版留下的 `"system"` 值讀取時視為系統。
- 監聽 `window` 的 `storage` 事件做跨分頁同步。
- 不再用 `matchMedia` 監聽系統變化切 class：`color-scheme: light dark` 由 CSS 自動跟隨系統。

**替代方案**：保留 `.dark` class 並額外同步 meta——兩套機制並存，指南明確指出不可只靠 JS class 分支（JS 未載入時會錯）。

### 色彩 token 改用 light-dark() 並以 --color-scheme 處理非色彩分支

`:root` 宣告 `color-scheme: light dark`，再以巢狀 `&:has(> head > meta[name="color-scheme"][content="dark"])` / `[content="light"]` 覆寫為 `dark` / `light`。所有 `--color-*` 與陰影內的顏色改寫為 `light-dark(亮, 暗)`（`light-dark()` 自 2024-05 Baseline，已於 2026-11 進入 Widely available）。

非色彩分支（背景噪點透明度 `.bg-noise::before`）依 selector-atrule-combinations 指南：在 `:root` 以 media query + `:has(meta)` 推導 `--color-scheme: light | dark`，基礎值寫在規則外，再以 `@container style(--color-scheme: dark)` 覆寫。Container style queries 屬 Newly available，採指南的「非關鍵分支」fallback：不支援時維持亮色透明度，不影響可讀性。Tailwind 的 `dark` 變體改以 `@custom-variant dark (@container style(--color-scheme: dark))` 重新定義，讓日後的 `dark:` 工具類與 meta 一致。

**替代方案**：以 `@media (prefers-color-scheme: dark) { :root:not(:has(meta[content=light])) ... }` 加 `:root:has(meta[content=dark])` 重複兩份規則——可行但重複，僅在 style query 不可接受時使用。

### 頁首快切採兩段式、設定浮層保留三段式

依 dark-mode-toggle 指南：常駐在頁首的按鈕（`AppHeaderControls` 的主題鈕、`ThemeLocaleControls` 的主題鈕）改為兩段式——目標為「目前畫面的相反主題」，若目標等於目前系統偏好就回到系統（刪除紀錄），否則存入字面值；只在按下當下判斷，系統偏好之後改變不回頭清除紀錄。圖示顯示目前實際主題，無障礙名稱改為動作文字（`settingsSwitchToDark` / `settingsSwitchToLight`），原 `settingsThemeToggle` key 移除。設定浮層內的三段式 segmented control 屬「設定介面」，指南允許三段，維持不變。

判斷邏輯抽成純函式 `getQuickToggleTheme(resolved, system)` 放在 `lib/config/ui-controls.ts`，取代 `THEME_CYCLE` / `getNextTheme`；系統偏好由新 hook `useColorScheme()` 以 `useSyncExternalStore` 訂閱 `matchMedia` 的 `change` 事件取得。

**替代方案**：維持三段循環——需要按兩次才能回到想要的畫面，且按鈕看不出下一步會變成什麼。

### 共用 useModalDialog hook 統一原生 dialog 生命週期

新增 `lib/hooks/use-modal-dialog.ts`：

- 掛載後若 `dialog.open` 為 false 才呼叫 `showModal()`（避免 React StrictMode 重跑 effect 時重複開啟而丟出例外），cleanup 不呼叫 `close()`（否則 StrictMode 重跑時會觸發 `close` 事件，讓元件一掛載就被關掉）。
- 以 `addEventListener` 監聽 `close`（同步 React state）與選用的 `cancel`（攔截 Esc），回呼以 ref 保存最新版本，effect 只執行一次。
- 回傳 `close()`：元件的關閉按鈕一律呼叫它，讓瀏覽器執行正常的關閉流程並把焦點還給開啟者；若直接卸載仍開著的 dialog，焦點會掉到 `body`。

三個元件移除 `createPortal`、`role="dialog"`、`aria-modal` 與 `window` Esc 監聽。top layer 天生蓋在 header 之上，不再需要 portal 或 z-index。`index.css` 加上 `dialog:modal { overscroll-behavior: contain }` 與 `dialog::backdrop { overflow: hidden; overscroll-behavior: contain }`；遮罩色與模糊寫在共用的 `.dialog-scrim::backdrop`，背景色使用 `var(--color-scrim, rgba(58, 48, 35, 0.42))`，讓 `::backdrop` 尚不繼承自訂屬性的舊瀏覽器仍有遮罩。

- `OnboardingCard`：卡片本身即 `<dialog>`，`showModal()` 後把焦點移到 dialog 本身（`tabIndex={-1}`），維持「開啟時不在按鈕上冒出 focus 外框」的既有設計；標題改 `h1`。React 的 `autoFocus` 不會輸出 HTML `autofocus` 屬性，所以不使用它。
- `ImageViewer`：全螢幕 dialog（重設 UA 的 margin、max-size、padding、border），方向鍵與 +／- 改由 dialog 的 `onKeyDown` 處理，Esc 交給原生 close request。
- 三者都不使用 `closedby="any"`（現行就沒有點遮罩關閉），因此不需要 light-dismiss fallback。

**替代方案**：保留 div 並手動補 `inert`、focus trap、焦點歸還——正是指南列為「不要做」的手刻作法。

### 打包進行中阻擋 Esc：closedby="none" 加 cancel 攔截

`DownloadProgress` 在打包中把 `closedby` 設為 `none`（Chrome、Firefox 會直接忽略 Esc 與返回手勢），並以 `cancel` 事件 `preventDefault()` 覆蓋尚未支援 `closedby` 的 Safari；完成或失敗後 `closedby` 改回 `closerequest`，Esc 可關閉並 reset 下載狀態。`closedby` 尚非 React 已知屬性，以物件展開傳入小寫屬性。

進度條改為原生 `<progress>`（不設 `value` 即為不確定狀態），依 progress 指南完整自訂樣式：`appearance: none`、分別撰寫 `::-webkit-progress-value` 與 `::-moz-progress-bar`、以 `cqi` 與 `translate` 滑動；reduced motion 時放慢動畫而非停用（停用會讓 Chromium 的填色寬度變 0）。完成與失敗訊息包在 `role="status"` 內。

### 設定浮層改用 Popover API 與 anchor positioning

`AppHeaderControls` 的面板改為 `<div popover="auto" id=...>`，觸發鈕使用 `popovertarget`（Invoker Commands 尚屬 Newly available，指南建議不支援時改用 `popovertarget`，直接採用支援面更廣的作法）。移除 `role="menu"`、`aria-haspopup="menu"`、全螢幕透明遮罩與 Esc 監聽；面板內容是以 Tab 移動的一般按鈕，依 menu 指南不屬於 menu pattern。`aria-expanded` 由面板的 `toggle` 事件同步。選擇語言後呼叫 `hidePopover()`。

- 定位：觸發鈕設 `anchor-name`，面板在 `@supports (position-area: block-end)` 內設 `position-anchor` 與 `position-area: block-end span-inline-start`，對齊觸發鈕右緣並向左展開；不支援時在 `toggle` 開啟當下以 `getBoundingClientRect()` 計算 `top` / `left`（`position: fixed`、`inset: auto`、`margin: 0`）。
- Polyfill：Popover 屬 Newly available，依指南在 `main.tsx` 以 `Object.hasOwn(HTMLElement.prototype, "popover")` 偵測，缺少時才動態 `import("@oddbird/popover-polyfill")`；CSS 加上 `@supports not selector(:popover-open)` 的隱藏規則，避免 polyfill 載入前面板閃現。

**替代方案**：完整 menu pattern（focusgroup、方向鍵）——內容不是指令清單，套用 menu 角色反而誤導螢幕報讀器。

### 字型改由 HTML 載入

移除 `index.css` 的兩個 `@import url(...)`，改在 `index.html` 以 `<link rel="preconnect">`（fonts.googleapis.com、fonts.gstatic.com crossorigin、cdn.jsdelivr.net crossorigin）加兩個 `<link rel="stylesheet">` 載入，讓瀏覽器在解析 HTML 時就並行抓取。原本「@import 必須排在最前面否則會被 Lightning CSS 丟棄」的陷阱也一併消失。

### 圖片載入優先序

- 相簿：`PhotoGrid` 把索引傳給 `PhotoCard`，前 4 張不加 `loading="lazy"`（涵蓋各斷點第一列），第 1 張加 `fetchpriority="high"`，其餘 lazy。
- 檢視器：主圖 `fetchpriority="high"`；縮圖 `loading="lazy"` + `fetchpriority="low"`（屬於 overflow 捲動容器內、與主圖競爭頻寬的圖片）。
- 移除 `.checkbox-overlay` 上的 `will-change: opacity`（每張卡片各佔一個合成層）。

### 表單保留視覺設計、以視覺隱藏 label 補足無障礙

設計稿沒有可見的輸入框標籤，因此以 Tailwind `sr-only`（與指南的 visually-hidden 寫法一致，使用 `clip-path: inset(50%)`）加上 `<label for>`，placeholder 只當格式提示。`<form noValidate>` 搭配 `required`：保留必填語意，又讓 `type="url"` 的原生驗證泡泡不會搶在 app 的多語系錯誤訊息前面（例如輸入不含 `https://` 的網址）。輸入框字級由 15px 改 16px 以避免 iOS 聚焦放大，是本 change 唯一刻意的視覺尺寸調整。

### MODIFIED 需求順帶校正既有 spec 與現況的落差

本 change 需要改寫的 requirement 若原本就與程式碼不一致，改寫時以實際行為為準，並記錄於此：

- `web-photo-gallery` / Responsive photo grid layout：欄數由規格的 3／4／5–6 校正為程式碼實際的 2／3／4。
- `web-download-flow` / Download progress dialog：規格寫的「失敗時提供重試按鈕」與「下載觸發後自動關閉」從未實作；改寫為實際的「關閉按鈕」與「顯示成功摘要＋確定按鈕」。
- `web-settings` / Settings panel responsive layout：抽屜／modal 的描述早已被頁首下拉面板取代，以 REMOVED + 新增「Settings panel popover」處理。

## Implementation Contract

**行為（使用者可觀察）**

- 深色系統偏好的使用者重新整理頁面時不再先看到亮色畫面；捲軸與表單控制項跟著主題配色。
- 頁首主題鈕每按一次就切換到目前畫面的相反主題；回到與系統相同的主題時自動恢復「跟隨系統」。
- 圖片檢視器、歡迎卡、打包進度開啟時，Tab 不會跑出浮層、背景不能捲動；Esc（及 Android 返回手勢）可關閉檢視器與歡迎卡；打包中 Esc 無效，完成或失敗後 Esc 可關閉；關閉後焦點回到開啟它的按鈕。
- 設定浮層點外面或按 Esc 關閉，焦點回到設定鈕；選語言後自動關閉。
- 網址輸入框在 iOS 聚焦時不放大畫面；錯誤訊息會被螢幕報讀器朗讀。

**介面與資料形狀**

- `useModalDialog(options: { onClose: () => void; onCancel?: (event: Event) => void }): { dialogRef: RefObject<HTMLDialogElement | null>; close: () => void }`
- `type ColorScheme = "light" | "dark"`；`useColorScheme(): { resolvedScheme: ColorScheme; systemScheme: ColorScheme }`
- `getQuickToggleTheme(resolved: ColorScheme, system: ColorScheme): ThemeMode`，取代 `THEME_CYCLE` 與 `getNextTheme`；`THEME_ICONS` 改以 `ColorScheme` 為 key。
- `useSettingsStore.updateTheme(theme)`：`system` 刪除 `localStorage.theme`，`light`/`dark` 寫入字面值；寫入失敗時仍套用到 meta。
- `localStorage.theme` 合法值：`"light"`、`"dark"`；其餘（含舊值 `"system"`）視為系統。
- i18n：四語系新增 `settingsSwitchToDark`、`settingsSwitchToLight`、`viewerLabel`、`viewerZoomIn`、`viewerZoomOut`、`viewerThumbnail`（含 `{{index}}`）、`blogInputUrlLabel`；移除 `settingsThemeToggle`。
- 新增 runtime 依賴 `@oddbird/popover-polyfill`，僅以動態 import 載入。
- `apps/web/package.json` 版號 `1.5.0` → `1.6.0`。

**失敗模式**

- `localStorage` 讀寫丟例外：inline script 靜默略過、維持 `light dark`；store 仍改寫 meta。
- 無原生 Popover：載入 polyfill；polyfill 載入前面板保持隱藏。
- 無 CSS anchor positioning：開啟時由 script 定位。
- 無 `closedby`（Safari）：Esc 仍可關閉檢視器與歡迎卡；打包中以 `cancel` 攔截。
- 無 container style queries：背景噪點維持亮色透明度。

**驗收標準**

- `pnpm test`、`pnpm build`、`pnpm format:check` 全數通過；新增測試涵蓋 `getQuickToggleTheme` 六種組合、store 的 meta／localStorage／storage 事件行為、`useModalDialog` 的開啟／close 事件／cancel 攔截、`DownloadProgress` 各狀態、`BlogInputForm` 的 label 與錯誤關聯、設定浮層的 popover 標記。
- `pnpm build` 產出的 CSS 不含字型 `@import`，且 `light-dark()`（或 Lightning CSS 轉譯後的等價結果）在 meta 為 `light`／`dark`／`light dark` 時都解析出正確顏色。
- 以 Claude in Chrome 實機驗證：三種主題與兩段式快切、跨分頁同步、三個 dialog 的 Tab／Esc／焦點歸還／背景防捲動、設定浮層的點外面關閉與定位、輸入框錯誤訊息。

**範圍**

- In scope：上述 `apps/web` 的主題、dialog、設定浮層、字型、圖片優先序、表單與照片卡無障礙、對應測試、`apps/web/CLAUDE.md` 的 hooks 清單、版號。
- Out of scope：Goals / Non-Goals 列出的項目、後端、其他頁面的視覺改版。

## Risks / Trade-offs

- [Tailwind 4 透過 Lightning CSS 依 targets 轉譯 `light-dark()` 與巢狀 `:has()`，轉譯結果可能與原生行為不同] → build 後檢查產出 CSS，並在 Chrome 實測 meta 三種值；若轉譯破壞 meta 覆寫，改以 `@media` + `:root:has()` 明確宣告 token。
- [Safari 不支援 `closedby`，且瀏覽器的 close watcher 防濫用機制可能讓「沒有使用者操作下連按 Esc」略過 `cancel` 直接關閉打包對話框] → 關閉時 reset 下載狀態，打包輪詢會因狀態不再是 packaging 而停止；等同使用者取消，不會留下卡住的 UI。
- [jsdom 沒有 `showModal()`、Popover 與 `matchMedia`] → `setup.ts` 補最小 stub（`showModal` 設 `open`、`close` 移除 `open` 並派發 `close` 事件、`matchMedia` 回傳不匹配），原生行為交給瀏覽器實測。
- [Popover polyfill 無法完全模擬 top layer] → 面板不使用會建立 containing block 的 transform／filter，維持單層浮層。
- [`PhotoCard` 新增選取模式 prop，切換選取模式時所有卡片會重新 render 一次] → 只在切換模式時發生；個別選取仍由 `memo` 擋下。
- [視覺差異：輸入框字級 +1px、打包進度條改為固定長度滑動] → 實機截圖比對，差異限於這兩處。

## Migration Plan

- `localStorage.theme` 舊值 `"system"` 讀取時視為系統，使用者下次切換主題時自然改寫或刪除，不需一次性遷移。
- 回滾：revert 本 change 的 commit 即可；新格式的 `"light"`／`"dark"` 舊版也能讀，不會遺留不相容資料。
