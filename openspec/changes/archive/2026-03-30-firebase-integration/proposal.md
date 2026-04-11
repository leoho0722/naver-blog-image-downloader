## Why

v1.1.0 完成 Riverpod 遷移後，專案缺乏使用者行為追蹤、遠端 debug 與 crash 回報能力。目前僅有 `debugPrint` 本機 log，無法在裝置發生問題時遠端排查。v1.2.0 整合 Firebase 三大核心服務：

1. **匿名登入（Firebase Auth）**：自動建立使用者身份，免 UI、免註冊流程
2. **Firestore 操作 Log**：以使用者為單位，全面記錄操作行為（擷取照片、下載、儲存至相簿、設定變更、頁面導航、錯誤詳情），供日後 debug 與行為分析使用
3. **Crashlytics**：自動收集 crash 資訊與非致命錯誤，並關聯匿名使用者 UID

Firebase 專案已建立，`GoogleService-Info.plist` 與 `google-services.json` 已就位。

## What Changes

- 新增 `firebase_core`、`firebase_auth`、`cloud_firestore`、`firebase_crashlytics`、`device_info_plus` 套件
- Android Gradle 新增 `com.google.gms.google-services` plugin
- `main.dart` 新增 Firebase 初始化、Crashlytics 全域錯誤攔截、匿名登入
- 新增 `AuthService`（Firebase Auth 匿名登入 + userId 管理）
- 新增 `LogService`（Firestore 寫入操作 log documents）
- 新增 `CrashlyticsService`（Crashlytics crash 回報 + 非致命錯誤 + userId 設定）
- 新增 `LogRepository`（協調 AuthService + LogService + CrashlyticsService，提供 fire-and-forget log 方法）
- 6 個 ViewModel 加入 log 呼叫（`BlogInputViewModel`、`DownloadViewModel`、`PhotoGalleryViewModel`、`PhotoDetailViewModel`、`AppSettingsViewModel`、`SettingsViewModel`）
- `GoRouter` 從全域變數轉為 `@Riverpod(keepAlive: true)` provider，新增 `NavigatorObserver` 記錄頁面導航
- `app.dart` 改用 `ref.watch(appRouterProvider)` 取代全域 `appRouter`
- Firestore Security Rules：僅允許已認證使用者在自己的 subcollection 建立 log，禁止讀取/更新/刪除
- 版號升級至 `1.2.0+1`

## Non-Goals

- 不實作使用者註冊/登入 UI（僅匿名登入）
- 不實作 Firebase Analytics（操作 log 由 Firestore 自行管理）
- 不實作 log 瀏覽/匯出功能（log 僅供 Firebase Console 查看）
- 不修改現有 Service / Repository 的 class 本體邏輯
- 不引入 Remote Config 或 A/B Testing

## Capabilities

### New Capabilities

- `auth-service`: Firebase Auth 匿名登入服務，自動建立使用者身份並持久化 session
- `log-service`: Firestore 操作 log 寫入服務，將 log document 寫入 `users/{uid}/logs/{auto-id}`
- `crashlytics-service`: Crashlytics 封裝服務，回報 crash、非致命錯誤與自訂 breadcrumb log
- `log-repository`: 操作 log 協調層，整合 AuthService + LogService + CrashlyticsService，提供 8 個 fire-and-forget log 方法

### Modified Capabilities

- `project-dependencies`: 新增 `firebase_core`、`firebase_auth`、`cloud_firestore`、`firebase_crashlytics`、`device_info_plus` 套件
- `riverpod-di`: `main.dart` 新增 Firebase 初始化與 Crashlytics 全域錯誤攔截
- `app-router`: GoRouter 從全域變數轉為 `@Riverpod(keepAlive: true)` provider，新增 `_LoggingObserver`
- `blog-input-viewmodel`: `fetchPhotos()` 成功/失敗後加入 log 呼叫
- `download-viewmodel`: `startDownload()` 成功後加入 log 呼叫
- `photo-gallery-viewmodel`: `saveSelectedToGallery()` / `saveAllToGallery()` 成功後加入 log 呼叫
- `photo-detail-viewmodel`: `saveToGallery()` 成功後加入 log 呼叫
- `app-settings-viewmodel`: `setThemeMode()` / `setLocale()` 後加入 log 呼叫
- `settings-viewmodel`: `clearAllCache()` 後加入 log 呼叫

## Impact

- **受影響 specs**：4 新建 + 9 修改（如上列）
- **受影響程式碼**：
  - 新建 4 個：`lib/data/services/auth_service.dart`、`lib/data/services/log_service.dart`、`lib/data/services/crashlytics_service.dart`、`lib/data/repositories/log_repository.dart`
  - 修改 13 個：`pubspec.yaml`、`android/settings.gradle.kts`、`android/app/build.gradle.kts`、`lib/main.dart`、`lib/routing/app_router.dart`、`lib/app.dart`、`lib/ui/blog_input/view_model/blog_input_view_model.dart`、`lib/ui/blog_input/widgets/blog_input_view.dart`、`lib/ui/download/view_model/download_view_model.dart`、`lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`、`lib/ui/photo_detail/view_model/photo_detail_view_model.dart`、`lib/ui/core/view_model/app_settings_view_model.dart`、`lib/ui/settings/view_model/settings_view_model.dart`
- **受影響依賴**：新增 5 個套件、Android Gradle 新增 google-services plugin
