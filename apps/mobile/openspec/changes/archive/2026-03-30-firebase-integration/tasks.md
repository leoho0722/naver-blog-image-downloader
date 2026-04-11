## 1. 套件與原生設定

- [x] 1.1 修改 `pubspec.yaml`：新增 Runtime dependencies declared（`firebase_core`、`firebase_auth`、`cloud_firestore`、`firebase_crashlytics`、`device_info_plus`），版號升級至 `1.2.0+1`，執行 `flutter pub get`
- [x] 1.2 修改 `android/settings.gradle.kts`：plugins 區塊新增 `id("com.google.gms.google-services") version "4.4.2" apply false`（Dev dependencies declared — Android Gradle plugin）
- [x] 1.3 修改 `android/app/build.gradle.kts`：plugins 區塊新增 `id("com.google.gms.google-services")`，置於 `dev.flutter.flutter-gradle-plugin` 之後
- [x] 1.4 執行 `cd ios && pod install` 安裝 Firebase CocoaPods

## 2. AuthService（新建 — auth-service 能力）

- [x] 2.1 建立 `lib/data/services/auth_service.dart`：新增 `@Riverpod(keepAlive: true)` AuthService provider defined（keepAlive）provider function，AuthService class 建構式接受可選 `FirebaseAuth` 參數（預設 `FirebaseAuth.instance`），實作 currentUserId getter（回傳 `_auth.currentUser?.uid`），實作 ensureSignedIn anonymous auth（檢查 `currentUser`，null 時 `signInAnonymously()`，成功後呼叫 `CrashlyticsService.setUserId(uid)`，失敗回傳 null），遵循 Auth state persistence（Firebase 自動持久化），所有 `///` 文件註解使用正體中文並包含參數與回傳描述

## 3. LogService（新建 — log-service 能力）

- [x] 3.1 建立 `lib/data/services/log_service.dart`：新增 `@Riverpod(keepAlive: true)` LogService provider defined（keepAlive）provider function，LogService class 建構式接受可選 `FirebaseFirestore` 參數，實作 writeLog writes to Firestore 方法（`writeLog({required String userId, required String type, required Map<String, dynamic> data, Map<String, dynamic>? deviceInfo})`），Document structure 為 `{type, timestamp: FieldValue.serverTimestamp(), data, deviceInfo}`，寫入路徑 `users/{userId}/logs/{auto-id}`，Silent error handling（所有例外 `debugPrint` 後靜默處理），所有 `///` 文件註解使用正體中文

## 4. CrashlyticsService（新建 — crashlytics-service 能力）

- [x] 4.1 建立 `lib/data/services/crashlytics_service.dart`：新增 `@Riverpod(keepAlive: true)` CrashlyticsService provider defined（keepAlive）provider function，CrashlyticsService class 封裝 `FirebaseCrashlytics.instance`，實作 setUserId（`setUserId(String uid)` 設定 Crashlytics 使用者識別碼），實作 recordError（fatal and non-fatal）（`recordError(dynamic error, StackTrace stackTrace, {bool fatal = false})`），實作 log breadcrumb（`log(String message)` 寫入自訂 breadcrumb），所有 `///` 文件註解使用正體中文

## 5. LogRepository（新建 — log-repository 能力）

- [x] 5.1 建立 `lib/data/repositories/log_repository.dart`：新增 `@Riverpod(keepAlive: true)` LogRepository provider defined（keepAlive）provider function，注入 `authServiceProvider`、`logServiceProvider`、`crashlyticsServiceProvider` via `ref.watch`，實作 Device info caching（`_deviceInfoCache` 以 `DeviceInfoPlugin` 讀取一次後快取），實作 Fire-and-forget logging pattern（私有 `_log(type, data)` 方法：取得 userId + deviceInfo → 呼叫 `LogService.writeLog`，整體 try-catch 靜默處理），實作 8 個公開方法皆回傳 `void` 並以 `unawaited()` 呼叫：logFetchPhotos（`blogUrl`, `blogId`, `resultCount`, `isFromCache`, `totalImages`, `failureDownloads`, `durationMs`）、logFetchPhotosError（`blogUrl`, `errorType`, `durationMs`）、logDownload（`blogId`, `successCount`, `failedCount`, `skippedCount`, `totalCount`, `durationMs`）、logSaveToGallery（`blogId`, `photoCount`, `mode`）、logClearCache（`previousSizeBytes`）、logPageNavigation（`screenName`）、logSettingsChange（`setting`, `oldValue`, `newValue`）、logError with Crashlytics integration（`errorType`, `message`, `stackTrace`，額外呼叫 `CrashlyticsService.recordError()`），確保 Silent error handling（never throws），所有 `///` 文件註解使用正體中文

## 6. Code Generation（Service + Repository 層）

- [x] 6.1 執行 `dart run build_runner build --delete-conflicting-outputs` 產生 `auth_service.g.dart`、`log_service.g.dart`、`crashlytics_service.g.dart`、`log_repository.g.dart`

## 7. Firebase + Crashlytics 初始化（Firebase initialization in main）

- [x] 7.1 修改 `lib/main.dart`：在 `_configureAmplify()` 之後新增 `await Firebase.initializeApp()`，設定 `FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError`（攔截 Flutter framework 錯誤），設定 `PlatformDispatcher.instance.onError` 回呼呼叫 `FirebaseCrashlytics.instance.recordError(error, stack, fatal: true)` 並回傳 `true`（攔截 platform 錯誤），呼叫 `unawaited(AuthService().ensureSignedIn())`（匿名登入不阻塞啟動），新增必要 import（`firebase_core`、`firebase_crashlytics`、`dart:ui`、`auth_service.dart`）

## 8. GoRouter 轉為 Riverpod Provider（GoRouter as Riverpod provider）

- [x] 8.1 修改 `lib/routing/app_router.dart`：將全域 `final appRouter = GoRouter(...)` 改為 `@Riverpod(keepAlive: true)` GoRouter as Riverpod provider function `GoRouter appRouter(Ref ref)`，新增 `_LoggingObserver extends NavigatorObserver`，在 `didPush()` 中取得 route name 並呼叫 `ref.read(logRepositoryProvider).logPageNavigation(screenName: routeName)`（GoRouter logging observer），新增 `part 'app_router.g.dart';`，新增必要 import（`riverpod_annotation`、`log_repository.dart`），所有 `///` 文件註解使用正體中文
- [x] 8.2 修改 `lib/app.dart`：將 `routerConfig: appRouter` 改為 `routerConfig: ref.watch(appRouterProvider)`（NaverPhotoApp uses appRouterProvider）
- [x] 8.3 執行 `dart run build_runner build --delete-conflicting-outputs` 產生 `app_router.g.dart`

## 9. ViewModel 加入 Log 呼叫 — BlogInputViewModel

- [x] 9.1 修改 `lib/ui/blog_input/view_model/blog_input_view_model.dart`：在 `fetchPhotos()` 方法開頭新增 `final stopwatch = Stopwatch()..start();`，成功後（設定 `AsyncData` 前）呼叫 `ref.read(logRepositoryProvider).logFetchPhotos(blogUrl: state.blogUrl, blogId: result.blogId, resultCount: result.photos.length, isFromCache: result.isFullyCached, totalImages: result.totalImages, failureDownloads: result.failureDownloads, durationMs: stopwatch.elapsedMilliseconds)`（fetchPhotos operation logging — success），在 catch 區塊呼叫 `ref.read(logRepositoryProvider).logFetchPhotosError(blogUrl: state.blogUrl, errorType: e.runtimeType.toString(), durationMs: stopwatch.elapsedMilliseconds)` 以及 `ref.read(logRepositoryProvider).logError(errorType: e.runtimeType.toString(), message: e.toString(), stackTrace: st.toString())`（fetchPhotos operation logging — error），新增 import `log_repository.dart`

## 10. ViewModel 加入 Log 呼叫 — DownloadViewModel

- [x] 10.1 修改 `lib/ui/download/view_model/download_view_model.dart`：在 `startDownload()` 方法開頭新增 `final stopwatch = Stopwatch()..start();`，成功後（設定 `AsyncData(result)` 前）呼叫 `ref.read(logRepositoryProvider).logDownload(blogId: blogId, successCount: result.successCount, failedCount: result.failureCount, skippedCount: result.skippedCount, totalCount: photos.length, durationMs: stopwatch.elapsedMilliseconds)`（download operation logging — success），在 catch 區塊呼叫 `ref.read(logRepositoryProvider).logError(errorType: e.runtimeType.toString(), message: e.toString(), stackTrace: st.toString())`（download operation logging — error），新增 import `log_repository.dart`

## 11. ViewModel 加入 Log 呼叫 — PhotoGalleryViewModel

- [x] 11.1 修改 `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`：在 `saveSelectedToGallery()` 成功後呼叫 `ref.read(logRepositoryProvider).logSaveToGallery(blogId: state.blogId, photoCount: selected.length, mode: 'selected')`（save selected to gallery logging），在 `saveAllToGallery()` 成功後呼叫 `ref.read(logRepositoryProvider).logSaveToGallery(blogId: state.blogId, photoCount: state.photos.length, mode: 'all')`（save all to gallery logging），在兩者的 catch 區塊呼叫 `ref.read(logRepositoryProvider).logError(...)`（gallery save error logging），新增 import `log_repository.dart`

## 12. ViewModel 加入 Log 呼叫 — PhotoDetailViewModel + AppSettingsViewModel + SettingsViewModel

- [x] 12.1 修改 `lib/ui/photo_detail/view_model/photo_detail_view_model.dart`：在 `saveToGallery()` 成功後呼叫 `ref.read(logRepositoryProvider).logSaveToGallery(blogId: state.blogId, photoCount: 1, mode: 'single')`（save single photo logging），新增 import `log_repository.dart`
- [x] 12.2 修改 `lib/ui/core/view_model/app_settings_view_model.dart`：在 `setThemeMode()` 中，呼叫前先取得 `final oldMode = state.requireValue.themeMode`，持久化後呼叫 `ref.read(logRepositoryProvider).logSettingsChange(setting: 'theme', oldValue: oldMode.name, newValue: mode.name)`（theme change logging）；在 `setLocale()` 中，呼叫前先取得 `final oldLocale = state.requireValue.locale`，持久化後呼叫 `ref.read(logRepositoryProvider).logSettingsChange(setting: 'locale', oldValue: oldLocale?.name ?? 'system', newValue: locale.name)`（locale change logging），新增 import `log_repository.dart`
- [x] 12.3 修改 `lib/ui/settings/view_model/settings_view_model.dart`：在 `clearAllCache()` 中，清除前先取得 `final previousSize = state.value?.cacheSizeBytes ?? 0`，清除後呼叫 `ref.read(logRepositoryProvider).logClearCache(previousSizeBytes: previousSize)`（clear cache logging），新增 import `log_repository.dart`

## 13. 頁面導航 Log — Settings Modal

- [x] 13.1 修改 `lib/ui/blog_input/widgets/blog_input_view.dart`：在 `_showSettingsSheet()` 方法中，`showModalBottomSheet` 呼叫前加入 `ref.read(logRepositoryProvider).logPageNavigation(screenName: 'settings')`（settings page navigation logging），新增 import `log_repository.dart`

## 14. Code Generation 與驗證

- [x] 14.1 執行 `dart run build_runner build --delete-conflicting-outputs` 產生所有 `.g.dart`
- [x] 14.2 執行 `flutter analyze` 確認無 error/warning，接續執行 `dart format .` 格式化
- [x] 14.3 執行 `flutter test` 確認所有既有測試通過

## 15. 清理與文件更新

- [x] 15.1 更新 `CLAUDE.md`：技術棧新增 Firebase（Auth + Firestore + Crashlytics），架構分層新增 LogRepository / AuthService / LogService / CrashlyticsService，初始設定新增 Firebase 初始化說明
