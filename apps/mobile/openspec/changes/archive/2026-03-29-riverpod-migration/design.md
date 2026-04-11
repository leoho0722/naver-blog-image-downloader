## Context

專案採用 MVVM + Provider 架構，三層依賴結構（Service → Repository → ViewModel）透過 `MultiProvider` 在 `main.dart` 集中註冊。6 個 ViewModel 繼承 `ChangeNotifier`，使用自訂 `Result<T>` sealed class 處理 Repository 層錯誤，並以自訂 sealed class / enum（`FetchState`、`DownloadState`、`SaveState`、`GalleryMode`、`SettingsState`）管理 UI 狀態。View 層透過 `context.watch/read` 存取 ViewModel，並以 `addListener` 監聽狀態變更執行副作用（對話框、導航）。

此遷移涵蓋約 29 個檔案，是 v1.1.0 的核心架構變更。

## Goals / Non-Goals

**Goals：**

- 全面採用 Riverpod 3.x code generation（`@riverpod` 註解）作為依賴注入與狀態管理方案
- 以 `AsyncValue` 統一取代所有自訂 loading/error/success 狀態模式
- 移除 `Result<T>` sealed class，Repository 層改為直接 throw Exception
- 確保遷移後所有既有功能行為不變
- 確保所有測試通過

**Non-Goals：**

- 不引入 `freezed` 做不可變資料類別（手動 `copyWith` 足夠，避免引入額外 code gen 套件）
- 不重構 Service / Repository 的 class 本體邏輯
- 不變更 GoRouter 路由設定
- 不變更原生層（Swift / Kotlin）程式碼
- 不將 `FetchLoadingPhase` 與 `FetchErrorType` 替換為 `AsyncValue`（這些攜帶領域特定資料）

## Decisions

### 使用 Code Generation（@riverpod 註解）而非手動 Provider 定義

採用 `riverpod_generator` + `riverpod_annotation` 自動產生 provider 定義。Provider 與其 class 共置（co-located），每個檔案產生對應的 `.g.dart` part 檔。

**替代方案**：手動定義 `NotifierProvider`、`Provider` 等。專案僅 13 個 provider，手動定義可行，但 code generation 是 Riverpod 3.x 官方推薦做法，且提供更好的類型推導與 `riverpod_lint` 整合。

### AsyncNotifier vs Notifier 的選擇標準

- **AsyncNotifier**：`build()` 本身需要非同步載入 → `AppSettingsViewModel`（載入 theme/locale）、`SettingsViewModel`（載入快取資訊）
- **Notifier**：同步初始狀態，非同步操作由使用者觸發的方法執行 → `BlogInputViewModel`、`DownloadViewModel`、`PhotoGalleryViewModel`、`PhotoDetailViewModel`

**替代方案**：全部使用 `Notifier` + 在 View 中手動觸發載入。但 `AsyncNotifier` 讓 Riverpod 自動管理初始載入的 loading/error 狀態，更符合慣例且減少 View 層的初始化程式碼（移除 `_loaded` flag + `didChangeDependencies` 手動載入模式）。

### AsyncValue 欄位嵌入 State Class

對於 `Notifier`（同步 build）的 ViewModel，將 `AsyncValue<T>` 作為 State class 的欄位，而非使用 `AsyncNotifier`。例如 `BlogInputState.fetchResult: AsyncValue<FetchResult?>`。

這允許 State class 同時包含同步欄位（`blogUrl`、`loadingPhase`）與非同步結果（`fetchResult`），使 `null` 代表 idle 狀態、`AsyncLoading` 代表進行中、`AsyncData` 代表完成、`AsyncError` 代表失敗。

**替代方案**：為每個操作建立獨立的 provider。過度分散且增加複雜度。

### FetchException 包裝 FetchErrorType

新增 `FetchException` 類別攜帶 `FetchErrorType` 與可選 `statusCode`，供 `AsyncError` 傳遞。View 層透過 pattern matching 取出 `FetchException` 顯示本地化錯誤訊息。

保留 `FetchLoadingPhase` 作為 State class 的額外欄位（`AsyncValue.loading()` 無法攜帶自訂資料）。

### Provider 生命週期管理

- `@Riverpod(keepAlive: true)`：所有 Service、Repository、`AppSettingsViewModel`（提供 theme/locale 給 MaterialApp）
- `@riverpod`（預設 auto-dispose）：其餘 5 個 ViewModel（畫面離開時自動清理，防止記憶體洩漏）

### SharedPreferences 初始化策略

維持在 `main()` 中 `await SharedPreferences.getInstance()` 預先初始化，透過 `ProviderScope.overrides` 的 `overrideWithValue` 注入。避免使用 `FutureProvider` 導致 App 啟動時出現不必要的 loading 狀態。

### 移除 Result\<T\> 並讓 Repository 直接 throw

Repository 方法改為直接回傳值或 throw Exception。ViewModel 中使用 try-catch 將例外包裝為 `AsyncError`。這消除了每次 Repository 呼叫都需要 switch `Ok`/`Error` 的樣板程式碼，並讓 `AsyncValue` 自然承接錯誤處理。

**替代方案**：保留 `Result<T>` 並在 ViewModel 中轉換為 `AsyncValue`。增加不必要的中間層。

## Risks / Trade-offs

- **[風險] Code Gen 增加建構步驟** → 僅 13 個 provider，code gen 速度極快（< 3 秒）；CI 可快取 `.g.dart` 檔案
- **[風險] `ref.listen` 必須在 `build()` 中呼叫** → `BlogInputView` 與 `PhotoGalleryView` 的 `addListener` 模式遷移至 `build()` 中的 `ref.listen`，功能等效且自動清理
- **[風險] Map/Set 不可變性** → `copyWith` 中必須建立新 `Map.of()` / `Set.of()` 實例，避免原地修改導致 Riverpod 無法偵測狀態變更
- **[風險] `_metadataCache` 不適合放入 State** → 保留為 `PhotoDetailViewModel` Notifier 的 private 欄位，非 state 的一部分
- **[風險] 測試通知計數可能因 Riverpod 去重而變化** → 改用 state 值斷言取代通知次數斷言
- **[取捨] `.g.dart` 檔案是否加入版控** → 建議不加入（`.gitignore`），CI 中執行 `build_runner` 產生
