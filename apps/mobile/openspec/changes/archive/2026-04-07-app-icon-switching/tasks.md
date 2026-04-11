## 1. 素材與設定（Assets & Config）

- [x] 1.1 建立 `assets/icons/` 目錄，從 iOS 素材複製 `ic_appicon-60x60@2x.png` → `icon_default.png`、`ic_appicon_new-60x60@2x.png` → `icon_new.png` 作為設定頁預覽圖
- [x] 1.2 修改 `pubspec.yaml`，在 `flutter.assets` 新增 `- assets/icons/`
- [x] 1.3 新增 `lib/config/app_icon.dart`，建立 `AppIcon` 列舉（`defaultIcon` / `newIcon`），包含 `nativeKey` 與 `previewAsset` 欄位（AppIcon 列舉設計）
- [x] 1.4 修改 `lib/config/app_settings_keys.dart`，新增 `static const String appIcon = 'app_icon'` 儲存 key

## 2. Service 層（AppIconService）

- [x] 2.1 修改 `lib/ui/core/app_error.dart`，在 `AppErrorType` 列舉新增 `appIcon` 值
- [x] 2.2 新增 `lib/data/services/app_icon_service.dart`，實作 `AppIconService` 類別：`AppIconService provider`（`@Riverpod(keepAlive: true)` 單例）、`MethodChannel definition`（MethodChannel 設計，通道名 `com.leoho.naverBlogImageDownloader/appIcon`）、`Set app icon` 方法、`Get current icon` 方法

## 3. Repository 層（SettingsRepository）

- [x] 3.1 修改 `lib/data/repositories/settings_repository.dart`，新增 `Load app icon`（`loadAppIcon()` → `AppIcon`，預設 `defaultIcon`）與 `Save app icon`（`saveAppIcon(AppIcon)` → `Future<void>`）方法

## 4. ViewModel 層（AppSettingsViewModel）

- [x] 4.1 修改 `lib/ui/core/view_model/app_settings_view_model.dart` 的 `AppSettingsViewModel state properties`：`AppSettingsState` 新增 `appIcon` 欄位（預設 `AppIcon.defaultIcon`），更新 `copyWith`、`operator ==`、`hashCode`
- [x] 4.2 修改 `Load settings`（`build()` 方法），從 `SettingsRepository` 載入 `appIcon`
- [x] 4.3 新增 `Set app icon` 方法（`setAppIcon(AppIcon)`）：樂觀更新狀態 → `saveAppIcon` 持久化（狀態管理與持久化） → `AppIconService.setAppIcon` 呼叫原生 API → `Operation logging in setAppIcon` 記錄 log

## 5. 本地化

- [x] 5.1 修改 `lib/l10n/app_zh_TW.arb`，新增 App icon localization keys：`settingsSectionAppIcon`（"App 圖示"）、`settingsAppIconDefault`（"預設"）、`settingsAppIconNew`（"新版"）
- [x] 5.2 修改 `lib/l10n/app_en.arb`，新增 `settingsSectionAppIcon`（"App Icon"）、`settingsAppIconDefault`（"Default"）、`settingsAppIconNew`（"New"）
- [x] 5.3 修改 `lib/l10n/app_ja.arb`，新增 `settingsSectionAppIcon`（"アプリアイコン"）、`settingsAppIconDefault`（"デフォルト"）、`settingsAppIconNew`（"新バージョン"）
- [x] 5.4 修改 `lib/l10n/app_ko.arb`，新增 `settingsSectionAppIcon`（"앱 아이콘"）、`settingsAppIconDefault`（"기본"）、`settingsAppIconNew`（"새 버전"）

## 6. View 層（SettingsView）

- [x] 6.1 修改 `lib/ui/settings/widgets/settings_view.dart`，更新 `Inset grouped list layout` 的區段順序為 Appearance → App Icon → Language → Cache → About
- [x] 6.2 實作 `App icon section`（設定頁面 UI 設計）：在「外觀」與「語言」區段之間插入 Row 排列兩張 72×72 預覽圖卡片，選中項以 `colorScheme.primary` 色 3px 框線標記，下方顯示 `Localized UI text` 圖示名稱

## 7. iOS 原生實作（iOS native implementation）

- [x] 7.1 新增 `ios/Runner/Applications/Channels/Features/AppIconChannel.swift`，實作 iOS native implementation：`setupAppIconChannel(messenger:)`、`handleSetAppIcon`（iOS 替代圖示機制，呼叫 `UIApplication.shared.setAlternateIconName`）、`handleGetCurrentIcon`（讀取 `alternateIconName`）
- [x] 7.2 修改 `ios/Runner/Applications/AppDelegate.swift`，在 `didInitializeImplicitFlutterEngine` 中呼叫 `setupAppIconChannel(messenger:)`
- [x] 7.3 設定 Xcode build settings for alternate icons：確認 `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES`，確保 `NewAppIcon.appiconset` 被包含在 App bundle 中

## 8. Android 原生實作（Android native implementation）

- [x] 8.1 新增 `android/.../channels/features/AppIconChannel.kt`，實作 Android native implementation：`setupAppIconChannel(flutterEngine)`、`handleSetAppIcon`（Android 替代圖示機制，透過 `PackageManager.setComponentEnabledSetting` 啟停 activity-alias）、`handleGetCurrentIcon`
- [x] 8.2 修改 `android/.../applications/MainActivity.kt`，在 `configureFlutterEngine` 中呼叫 `setupAppIconChannel(flutterEngine)`
- [x] 8.3 修改 `android/app/src/main/AndroidManifest.xml`，新增 `AndroidManifest activity-alias configuration`（`.MainActivityClassic` 預設啟用、`.MainActivityNew` 預設停用），將 LAUNCHER intent-filter 從 MainActivity 移至 activity-alias

## 9. 程式碼生成與驗證

- [x] 9.1 執行 `dart run build_runner build --delete-conflicting-outputs` 產生 `app_icon_service.g.dart`
- [x] 9.2 執行 `flutter gen-l10n` 產生本地化程式碼
- [x] 9.3 執行 `flutter analyze` 確認無錯誤
- [x] 9.4 執行 `dart format .` 確保格式一致
