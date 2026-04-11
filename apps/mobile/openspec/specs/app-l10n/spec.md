# app-l10n Specification

## Purpose

TBD - created by archiving change 'settings-theme-locale-l10n'. Update Purpose after archive.

## Requirements

### Requirement: l10n configuration file

The project SHALL have a `l10n.yaml` file at the Flutter project root with the following configuration:

- `arb-dir`: `lib/l10n`
- `template-arb-file`: `app_zh_TW.arb`
- `output-localization-file`: `app_localizations.dart`
- `output-class`: `AppLocalizations`
- `nullable-getter`: `false`

#### Scenario: l10n.yaml exists with correct config

- **WHEN** the `l10n.yaml` file is inspected
- **THEN** the `template-arb-file` SHALL be `app_zh_TW.arb`
- **AND** the `output-class` SHALL be `AppLocalizations`


<!-- @trace
source: settings-theme-locale-l10n
updated: 2026-03-25
code:
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/l10n.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: ARB template file (Traditional Chinese)

The file `lib/l10n/app_zh_TW.arb` SHALL serve as the template ARB file containing all localization keys with Traditional Chinese values. It SHALL include the `@@locale` key set to `"zh_TW"`.

Every user-facing string in the application SHALL have a corresponding key in this file.

#### Scenario: Template ARB contains locale metadata

- **WHEN** `app_zh_TW.arb` is parsed
- **THEN** the `@@locale` field SHALL be `"zh_TW"`

#### Scenario: All UI strings have ARB keys

- **WHEN** the application source code is inspected
- **THEN** every user-facing string SHALL reference an `AppLocalizations` key instead of a hardcoded literal


<!-- @trace
source: settings-theme-locale-l10n
updated: 2026-03-25
code:
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/l10n.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: English ARB file

The file `lib/l10n/app_en.arb` SHALL contain English translations for all keys defined in the template ARB file. It SHALL include the `@@locale` key set to `"en"`.

#### Scenario: English ARB has matching keys

- **WHEN** `app_en.arb` is compared to `app_zh_TW.arb`
- **THEN** every non-metadata key in `app_zh_TW.arb` SHALL have a corresponding entry in `app_en.arb`


<!-- @trace
source: settings-theme-locale-l10n
updated: 2026-03-25
code:
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/l10n.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: Korean ARB file

The file `lib/l10n/app_ko.arb` SHALL contain Korean translations for all keys defined in the template ARB file. It SHALL include the `@@locale` key set to `"ko"`.

#### Scenario: Korean ARB has matching keys

- **WHEN** `app_ko.arb` is compared to `app_zh_TW.arb`
- **THEN** every non-metadata key in `app_zh_TW.arb` SHALL have a corresponding entry in `app_ko.arb`


<!-- @trace
source: settings-theme-locale-l10n
updated: 2026-03-25
code:
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/l10n.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: MaterialApp localization integration

The `MaterialApp.router` in `lib/app.dart` SHALL configure the following localization properties:

- `localizationsDelegates` SHALL be set to `AppLocalizations.localizationsDelegates`
- `supportedLocales` SHALL be set to `AppLocalizations.supportedLocales`
- `locale` SHALL be set to the locale from `AppSettingsViewModel` (null means follow system)

#### Scenario: Localization delegates configured

- **WHEN** `MaterialApp.router` is inspected
- **THEN** its `localizationsDelegates` SHALL include `AppLocalizations.localizationsDelegates`
- **AND** its `supportedLocales` SHALL include `AppLocalizations.supportedLocales`

<!-- @trace
source: settings-theme-locale-l10n
updated: 2026-03-25
code:
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/l10n.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: App icon localization keys

All ARB files SHALL contain the following localization keys for the App Icon settings section:

- `settingsSectionAppIcon`: Section header text for the app icon setting.
  - zh_TW: "App 圖示"
  - en: "App Icon"
  - ja: "アプリアイコン"
  - ko: "앱 아이콘"

- `settingsAppIconSheetTitle`: Title text for the app icon bottom sheet.
  - zh_TW: "選擇 App 圖示"
  - en: "Choose App Icon"
  - ja: "アプリアイコンを選択"
  - ko: "앱 아이콘 선택"

- `settingsAppIconStyleScroll`: Label for the toggle button to switch to horizontal scroll view.
  - zh_TW: "以滑動檢視"
  - en: "Scroll View"
  - ja: "スクロール表示"
  - ko: "스크롤 보기"

- `settingsAppIconStyleSheet`: Label for the toggle button to switch to grid/bottom sheet view.
  - zh_TW: "以網格檢視"
  - en: "Grid View"
  - ja: "グリッド表示"
  - ko: "그리드 보기"

- `settingsAppIconDefault`: Label for the default icon option.
  - zh_TW: "預設"
  - en: "Default"
  - ja: "デフォルト"
  - ko: "기본"

- `settingsAppIconNew`: Label for the new icon option.
  - zh_TW: "新版"
  - en: "New"
  - ja: "新バージョン"
  - ko: "새 버전"

#### Scenario: Traditional Chinese ARB contains app icon keys

- **WHEN** `app_zh_TW.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"App 圖示"`
- **AND** key `settingsAppIconSheetTitle` with value `"選擇 App 圖示"`
- **AND** key `settingsAppIconStyleScroll` with value `"以滑動檢視"`
- **AND** key `settingsAppIconStyleSheet` with value `"以網格檢視"`
- **AND** key `settingsAppIconDefault` with value `"預設"`
- **AND** key `settingsAppIconNew` with value `"新版"`

#### Scenario: English ARB contains app icon keys

- **WHEN** `app_en.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"App Icon"`
- **AND** key `settingsAppIconSheetTitle` with value `"Choose App Icon"`
- **AND** key `settingsAppIconStyleScroll` with value `"Scroll View"`
- **AND** key `settingsAppIconStyleSheet` with value `"Grid View"`
- **AND** key `settingsAppIconDefault` with value `"Default"`
- **AND** key `settingsAppIconNew` with value `"New"`

#### Scenario: Japanese ARB contains app icon keys

- **WHEN** `app_ja.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"アプリアイコン"`
- **AND** key `settingsAppIconSheetTitle` with value `"アプリアイコンを選択"`
- **AND** key `settingsAppIconStyleScroll` with value `"スクロール表示"`
- **AND** key `settingsAppIconStyleSheet` with value `"グリッド表示"`
- **AND** key `settingsAppIconDefault` with value `"デフォルト"`
- **AND** key `settingsAppIconNew` with value `"新バージョン"`

#### Scenario: Korean ARB contains app icon keys

- **WHEN** `app_ko.arb` is parsed
- **THEN** it SHALL contain key `settingsSectionAppIcon` with value `"앱 아이콘"`
- **AND** key `settingsAppIconSheetTitle` with value `"앱 아이콘 선택"`
- **AND** key `settingsAppIconStyleScroll` with value `"스크롤 보기"`
- **AND** key `settingsAppIconStyleSheet` with value `"그리드 보기"`
- **AND** key `settingsAppIconDefault` with value `"기본"`
- **AND** key `settingsAppIconNew` with value `"새 버전"`

<!-- @trace
source: app-icon-switching
updated: 2026-04-07
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/AppIconChannel.kt
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@2x.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_new.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
  - README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_new.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-mdpi/ic_launcher_new.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20.png
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29.png
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/assets/icons/icon_new.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-1024x1024.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-xhdpi/ic_launcher_new.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/assets/icons/icon_default.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-83.5x83.5@2x.png
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-1024x1024.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-20x20@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@2x.png
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-83.5x83.5@2x.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-60x60@3x.png
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@3x.png
  - naver_blog_image_downloader/lib/data/services/app_icon_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-40x40.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/AppIconChannel.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-60x60@2x.png
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/NewAppIcon.appiconset/ic_appicon_new-38x38@3x.png
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/lib/config/app_icon.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/android/app/src/main/res/mipmap-hdpi/ic_launcher_new.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/ic_appicon-76x76.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
-->