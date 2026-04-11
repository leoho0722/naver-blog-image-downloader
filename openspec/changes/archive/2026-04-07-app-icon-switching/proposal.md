## Why

目前 App 僅有一組圖示，無法讓使用者個人化桌面外觀。v1.5.0 新增兩版 App 圖示（預設版與新版），讓使用者可在設定頁面中自由切換，提升個人化體驗。

## What Changes

- 新增 `AppIcon` 列舉（`defaultIcon` / `newIcon`），定義圖示識別名稱與 Flutter 側預覽圖路徑
- 新增 `AppIconService`，透過 MethodChannel（`com.leoho.naverBlogImageDownloader/appIcon`）橋接原生圖示切換 API
- iOS 原生：新增 `AppIconChannel.swift`，使用 `UIApplication.setAlternateIconName(_:)` 切換圖示，替代圖示放在 `Assets.xcassets/NewAppIcon.appiconset/`，透過 Xcode build settings `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES` 啟用
- Android 原生：新增 `AppIconChannel.kt`，使用 `PackageManager.setComponentEnabledSetting` 啟停 `activity-alias` 切換圖示，AndroidManifest.xml 加入兩個 `<activity-alias>`
- `SettingsRepository` 新增 App 圖示偏好的讀寫方法
- `AppSettingsState` 新增 `appIcon` 欄位，`AppSettingsViewModel` 新增 `setAppIcon()` 方法（樂觀更新 → 持久化 → 呼叫原生 API → 記錄 log）
- 設定頁面「外觀」與「語言」區段之間新增「App 圖示」區段，支援兩種檢視模式：水平滑動列表（radio button + 名稱）與 Bottom Sheet 網格選擇，使用者可透過標題右側切換按鈕自行切換檢視模式
- 4 個 ARB 檔各新增本地化字串（`settingsSectionAppIcon`、`settingsAppIconDefault`、`settingsAppIconNew`、`settingsAppIconSheetTitle`、`settingsAppIconStyleScroll`、`settingsAppIconStyleSheet`）

## Capabilities

### New Capabilities

- `app-icon-service`: App 圖示切換服務，透過 MethodChannel 橋接 iOS（`setAlternateIconName`）與 Android（`activity-alias`）原生 API，提供 `setAppIcon` 與 `getCurrentIcon` 方法

### Modified Capabilities

- `app-settings-viewmodel`: `AppSettingsState` 新增 `appIcon` 欄位，`AppSettingsViewModel` 新增 `setAppIcon()` 方法
- `settings-repository`: 新增 `loadAppIcon()` 與 `saveAppIcon()` 方法
- `settings-view`: 新增「App 圖示」區段，支援水平滑動與 Bottom Sheet 網格兩種檢視模式，標題右側可切換
- `app-l10n`: 新增 `settingsSectionAppIcon`、`settingsAppIconDefault`、`settingsAppIconNew`、`settingsAppIconSheetTitle`、`settingsAppIconStyleScroll`、`settingsAppIconStyleSheet` 本地化字串

## Impact

- 新增檔案：
  - `lib/config/app_icon.dart`
  - `lib/data/services/app_icon_service.dart`
  - `ios/Runner/Applications/Channels/Features/AppIconChannel.swift`
  - `android/.../channels/features/AppIconChannel.kt`
  - `assets/icons/icon_default.png`、`assets/icons/icon_new.png`
- 修改檔案：
  - `lib/config/app_settings_keys.dart`
  - `lib/ui/core/app_error.dart`
  - `lib/data/repositories/settings_repository.dart`
  - `lib/ui/core/view_model/app_settings_view_model.dart`
  - `lib/ui/settings/widgets/settings_view.dart`
  - `lib/l10n/app_zh_TW.arb`、`app_en.arb`、`app_ja.arb`、`app_ko.arb`
  - `ios/Runner/Applications/AppDelegate.swift`
  - `ios/Runner/Configurations/Info.plist`
  - `android/.../applications/MainActivity.kt`
  - `android/app/src/main/AndroidManifest.xml`
  - `pubspec.yaml`
