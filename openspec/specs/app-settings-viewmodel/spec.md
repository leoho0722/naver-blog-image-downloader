# app-settings-viewmodel Specification

## Purpose

TBD - created by archiving change 'settings-theme-locale-l10n'. Update Purpose after archive.

## Requirements

### Requirement: AppSettingsViewModel constructor

`AppSettingsViewModel` SHALL extend the generated `_$AppSettingsViewModel` base class (Riverpod `AsyncNotifier`). It SHALL NOT extend `ChangeNotifier`. Dependencies SHALL be accessed via `ref.read` instead of constructor injection.

#### Scenario: AppSettingsViewModel created via Riverpod

- **GIVEN** the app is running with `ProviderScope`
- **WHEN** `appSettingsViewModelProvider` is first accessed
- **THEN** `AppSettingsViewModel` SHALL be created as an `AsyncNotifier`
- **AND** SHALL access `SettingsRepository` via `ref.read(settingsRepositoryProvider)`


<!-- @trace
source: riverpod-migration
updated: 2026-03-29
code:
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: AppSettingsViewModel state properties

`AppSettingsViewModel` SHALL expose its state as `AsyncValue<AppSettingsState>`. `AppSettingsState` SHALL be an immutable class with `themeMode` (default `ThemeMode.system`), `locale` (default `null`), and `appIcon` (default `AppIcon.defaultIcon`).

#### Scenario: Initial state

- **GIVEN** `AppSettingsViewModel` has not yet completed initialization
- **WHEN** `appSettingsViewModelProvider` is watched
- **THEN** it SHALL return `AsyncLoading`


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

---
### Requirement: Load settings

`AppSettingsViewModel.build()` SHALL asynchronously load theme mode, locale, and app icon from `SettingsRepository` and return an `AppSettingsState`. There SHALL be no separate `loadSettings()` method.

#### Scenario: Load persisted settings

- **GIVEN** `SettingsRepository` has persisted theme `dark`, locale `en`, and app icon `new`
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(AppSettingsState(themeMode: ThemeMode.dark, locale: SupportedLocale.en, appIcon: AppIcon.newIcon))`

#### Scenario: Repository returns default values

- **GIVEN** `SettingsRepository` has no persisted values
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(AppSettingsState(themeMode: ThemeMode.system, locale: null, appIcon: AppIcon.defaultIcon))`


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

---
### Requirement: Set theme mode

`setThemeMode(ThemeMode mode)` SHALL optimistically update the state to `AsyncData` with the new theme mode, then persist via `SettingsRepository`.

#### Scenario: Switch to dark mode

- **GIVEN** the current state is `AsyncData(AppSettingsState(themeMode: ThemeMode.system))`
- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** the state SHALL immediately become `AsyncData(AppSettingsState(themeMode: ThemeMode.dark))`
- **AND** `SettingsRepository.saveThemeMode(ThemeMode.dark)` SHALL be called


<!-- @trace
source: riverpod-migration
updated: 2026-03-29
code:
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Set locale

`setLocale(SupportedLocale locale)` SHALL optimistically update the state to `AsyncData` with the new locale, then persist via `SettingsRepository`.

#### Scenario: Switch to English

- **GIVEN** the current state has `locale: null`
- **WHEN** `setLocale(SupportedLocale.en)` is called
- **THEN** the state SHALL immediately become `AsyncData` with `locale: SupportedLocale.en`
- **AND** `SettingsRepository.saveLocale(SupportedLocale.en)` SHALL be called

<!-- @trace
source: riverpod-migration
updated: 2026-03-29
code:
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Operation logging in setThemeMode

`AppSettingsViewModel.setThemeMode(ThemeMode mode)` SHALL log the settings change via `ref.read(logRepositoryProvider)` after updating the state.

`setThemeMode()` SHALL call `logSettingsChange` with the following parameters:

- `setting` -- the string `'theme'`
- `oldValue` -- the string representation of the previous `ThemeMode` value (e.g., `'ThemeMode.system'`)
- `newValue` -- the string representation of the new `ThemeMode` value (e.g., `'ThemeMode.dark'`)

The log call SHALL be fire-and-forget and SHALL NOT affect the state update or persistence behavior.

#### Scenario: Theme change logged

- **GIVEN** the current theme mode is `ThemeMode.system`
- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** `logSettingsChange` SHALL be called with `setting: 'theme'`, `oldValue: 'ThemeMode.system'`, `newValue: 'ThemeMode.dark'`
- **AND** the state SHALL still be updated optimistically to `ThemeMode.dark`

#### Scenario: Log failure does not affect theme change

- **GIVEN** `logSettingsChange` throws an exception internally
- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** the state SHALL still be updated to `ThemeMode.dark`
- **AND** `SettingsRepository.saveThemeMode()` SHALL still be called


<!-- @trace
source: firebase-integration
updated: 2026-03-30
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/android/app/google-services.json
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/services/auth_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/crashlytics_service.dart
  - naver_blog_image_downloader/lib/data/repositories/log_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/log_service.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Operation logging in setLocale

`AppSettingsViewModel.setLocale(SupportedLocale locale)` SHALL log the settings change via `ref.read(logRepositoryProvider)` after updating the state.

`setLocale()` SHALL call `logSettingsChange` with the following parameters:

- `setting` -- the string `'locale'`
- `oldValue` -- the string representation of the previous locale value (e.g., `'null'` or `'SupportedLocale.en'`)
- `newValue` -- the string representation of the new `SupportedLocale` value (e.g., `'SupportedLocale.ko'`)

The log call SHALL be fire-and-forget and SHALL NOT affect the state update or persistence behavior.

#### Scenario: Locale change logged

- **GIVEN** the current locale is `null`
- **WHEN** `setLocale(SupportedLocale.en)` is called
- **THEN** `logSettingsChange` SHALL be called with `setting: 'locale'`, `oldValue: 'null'`, `newValue: 'SupportedLocale.en'`
- **AND** the state SHALL still be updated optimistically to `SupportedLocale.en`

#### Scenario: Log failure does not affect locale change

- **GIVEN** `logSettingsChange` throws an exception internally
- **WHEN** `setLocale(SupportedLocale.ko)` is called
- **THEN** the state SHALL still be updated to `SupportedLocale.ko`
- **AND** `SettingsRepository.saveLocale()` SHALL still be called

<!-- @trace
source: firebase-integration
updated: 2026-03-30
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/android/app/google-services.json
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/services/auth_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/crashlytics_service.dart
  - naver_blog_image_downloader/lib/data/repositories/log_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/log_service.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Set app icon

`setAppIcon(AppIcon icon)` SHALL optimistically update the state to `AsyncData` with the new app icon, then persist via `SettingsRepository.saveAppIcon()`, then call `AppIconService.setAppIcon()` with the icon's `nativeKey` to trigger the native platform icon switch, then log the change via `LogRepository.logSettingsChange()`.

#### Scenario: Switch to new icon

- **GIVEN** the current state has `appIcon: AppIcon.defaultIcon`
- **WHEN** `setAppIcon(AppIcon.newIcon)` is called
- **THEN** the state SHALL immediately become `AsyncData` with `appIcon: AppIcon.newIcon`
- **AND** `SettingsRepository.saveAppIcon(AppIcon.newIcon)` SHALL be called
- **AND** `AppIconService.setAppIcon("new")` SHALL be called
- **AND** `LogRepository.logSettingsChange` SHALL be called with `setting: 'appIcon'`, `oldValue: 'default'`, `newValue: 'new'`

#### Scenario: Switch back to default icon

- **GIVEN** the current state has `appIcon: AppIcon.newIcon`
- **WHEN** `setAppIcon(AppIcon.defaultIcon)` is called
- **THEN** the state SHALL immediately become `AsyncData` with `appIcon: AppIcon.defaultIcon`
- **AND** `AppIconService.setAppIcon("default")` SHALL be called


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

---
### Requirement: Operation logging in setAppIcon

`AppSettingsViewModel.setAppIcon(AppIcon icon)` SHALL log the settings change via `ref.read(logRepositoryProvider)` after the icon switch completes.

`setAppIcon()` SHALL call `logSettingsChange` with the following parameters:

- `setting` -- the string `'appIcon'`
- `oldValue` -- the `nativeKey` of the previous `AppIcon` value
- `newValue` -- the `nativeKey` of the new `AppIcon` value

The log call SHALL be fire-and-forget and SHALL NOT affect the state update or native icon switch behavior.

#### Scenario: App icon change logged

- **GIVEN** the current app icon is `AppIcon.defaultIcon`
- **WHEN** `setAppIcon(AppIcon.newIcon)` is called
- **THEN** `logSettingsChange` SHALL be called with `setting: 'appIcon'`, `oldValue: 'default'`, `newValue: 'new'`

#### Scenario: Log failure does not affect icon change

- **GIVEN** `logSettingsChange` throws an exception internally
- **WHEN** `setAppIcon(AppIcon.newIcon)` is called
- **THEN** the state SHALL still be updated to `AppIcon.newIcon`
- **AND** the native icon switch SHALL still complete

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