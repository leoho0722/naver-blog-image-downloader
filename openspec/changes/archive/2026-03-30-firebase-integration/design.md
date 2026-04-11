## Context

專案目前使用 AWS Amplify 作為後端通訊，但缺乏使用者身份追蹤、遠端 debug 與 crash 回報機制。Firebase 專案已建立，iOS / Android 原生設定檔已就位。專案採 MVVM + Riverpod 3.x 架構，三層分層（View → ViewModel → Repository → Service）。

## Goals / Non-Goals

**Goals：**
- 整合 Firebase Auth 匿名登入，自動建立使用者身份
- 整合 Firestore 全面記錄操作 log（8 種 log 類型）
- 整合 Crashlytics 自動收集 crash 資訊與非致命錯誤
- 所有 log 呼叫為 fire-and-forget，不影響 UI 與既有功能

**Non-Goals：**
- 不實作使用者註冊/登入 UI
- 不實作 Firebase Analytics
- 不實作 log 瀏覽/匯出功能

## Decisions

### Firebase 初始化順序

在 `main()` 中，於 `_configureAmplify()` 之後、`SharedPreferences.getInstance()` 之前初始化 Firebase：

1. `await Firebase.initializeApp()` — 讀取原生設定檔
2. 設定 `FlutterError.onError` = Crashlytics fatal error handler
3. 設定 `PlatformDispatcher.instance.onError` = Crashlytics platform error handler
4. `unawaited(AuthService().ensureSignedIn())` — 匿名登入（不阻塞啟動）

**替代方案**：使用 FlutterFire CLI 產生 `firebase_options.dart` + `Firebase.initializeApp(options: ...)`。但原生設定檔已就位，直接呼叫 `Firebase.initializeApp()` 即可自動讀取，無需額外 CLI 步驟。

### AuthService 設計

- `@Riverpod(keepAlive: true)` 單例
- 建構式接受可選的 `FirebaseAuth` 參數（testability），預設使用 `FirebaseAuth.instance`
- `currentUserId` getter 直接回傳 `_auth.currentUser?.uid`
- `ensureSignedIn()` 方法：先檢查 `currentUser`，null 時呼叫 `signInAnonymously()`，登入成功後設定 Crashlytics userId
- Firebase Auth 自動將匿名 session 持久化至 iOS Keychain / Android EncryptedSharedPreferences，後續啟動無需重新登入

### LogService 設計

- `@Riverpod(keepAlive: true)` 單例
- 建構式接受可選的 `FirebaseFirestore` 參數（testability）
- 單一方法 `writeLog({userId, type, data, deviceInfo})` 寫入 `users/{userId}/logs/{auto-id}`
- Document 結構：`{ type, timestamp (server), data, deviceInfo }`
- 所有例外靜默處理（`debugPrint`），不向 caller 拋出

### CrashlyticsService 設計

- `@Riverpod(keepAlive: true)` 單例
- 封裝 `FirebaseCrashlytics.instance`
- `setUserId(String uid)` — 設定使用者識別碼
- `recordError(error, stackTrace, {fatal})` — 回報錯誤
- `log(String message)` — 寫入 breadcrumb
- 所有例外靜默處理

### LogRepository 設計

- `@Riverpod(keepAlive: true)`，注入 AuthService + LogService + CrashlyticsService
- `_deviceInfoCache` 快取 `DeviceInfoPlugin` 結果（僅讀取一次）
- 私有 `_log(type, data)` 方法：取得 userId → 取得 deviceInfo → 呼叫 LogService.writeLog
- 8 個公開方法皆回傳 `void`，內部以 `unawaited()` 呼叫 `_log`
- `logError()` 額外呼叫 `CrashlyticsService.recordError()` 回報非致命錯誤

### ViewModel Log 插入策略

所有 log 呼叫放在操作結果確定後（成功或 catch），使用 `ref.read(logRepositoryProvider).logXxx(...)`。由於 LogRepository 方法回傳 `void` 且內部 `unawaited()`，不會影響 ViewModel 狀態流轉。

錯誤場景需同時記錄 `logXxxError()` 至 Firestore 與 `logError()` 至 Crashlytics。

### GoRouter 轉為 Riverpod Provider

將全域 `final appRouter = GoRouter(...)` 改為 `@Riverpod(keepAlive: true)` provider function，新增 `_LoggingObserver extends NavigatorObserver` 在 `didPush()` 中呼叫 `logPageNavigation()`。`app.dart` 改用 `ref.watch(appRouterProvider)`。

Settings 頁面為 modal bottom sheet（不經 GoRouter），需在 `blog_input_view.dart` 的 `_showSettingsSheet()` 中手動 log。

### Firestore Collection 結構

`users/{uid}/logs/{auto-id}` — 每個使用者一個 subcollection，log documents 以自動 ID 建立。Security Rules 僅允許已認證使用者在自己的 subcollection create，禁止 read/update/delete。

Firestore 內建離線持久化：離線時寫入的 log 會自動排隊，恢復連線後同步。

## Risks / Trade-offs

- **[風險] Firestore 免費額度**：Spark plan 每日 20K writes。個人/小用戶量 App 足夠。若用量成長，可考慮批次合併 log 或抽樣。
- **[風險] 首次 iOS build 時間**：加入 Firebase CocoaPods 後首次 build 較慢（5-10 分鐘），後續使用 pod cache。
- **[風險] GoRouter 轉 provider**：需同步修改 `app.dart`，但變更範圍小且可控。
- **[取捨] unawaited log 不保證送達**：App 被 kill 時排隊中的 log 可能遺失。Firestore 離線持久化能緩解大部分場景。
- **[取捨] 匿名帳號不可遷移**：使用者清除 App 資料後會產生新 UID。如未來需要帳號關聯，可透過 `linkWithCredential()` 擴展。
