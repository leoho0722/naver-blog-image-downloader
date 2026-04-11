# settings-view Specification

## Purpose

TBD - created by archiving change 's028-settings-view'. Update Purpose after archive.

## Requirements

### Requirement: Cache size display

The `SettingsView` SHALL display a cache info `ListTile` within a `Card.filled` with `title` set to "快取大小". The `trailing` area SHALL show the formatted cache size value as a `Text` widget styled with `textTheme.bodyLarge` and `colorScheme.onSurfaceVariant`, followed by a clear `IconButton`. The clear `IconButton` SHALL trigger a confirmation dialog before clearing.

#### Scenario: Cache size shown with clear button

- **GIVEN** the SettingsView is rendered
- **WHEN** the cache section is displayed
- **THEN** a `ListTile` inside `Card.filled` SHALL show "快取大小" as `title`, the formatted cache size and a clear `IconButton` in the trailing area

#### Scenario: Cache size updates after clearing

- **GIVEN** cache items have been cleared
- **WHEN** the clear operation completes
- **THEN** the displayed cache size SHALL update to reflect the new total


<!-- @trace
source: settings-m3-refactor
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
-->

---
### Requirement: Clear all button

The cache `ListTile` trailing area SHALL contain an `IconButton` with a broom icon (`Icons.cleaning_services`). The `IconButton` SHALL use `colorScheme.error` as its icon color and SHALL include a `tooltip` for accessibility. Tapping the button SHALL display a confirmation dialog before clearing. The button SHALL be hidden when no cached blogs exist.

After the confirmation dialog is dismissed with `true`, the view SHALL check `mounted` before calling `viewModel.clearAllCache()`.

#### Scenario: Clear button tapped

- **GIVEN** cached blogs exist
- **WHEN** the user taps the clear `IconButton`
- **THEN** a confirmation dialog SHALL appear asking for confirmation

#### Scenario: Clear confirmed with mounted check

- **GIVEN** the user confirms clearing in the dialog
- **WHEN** the dialog returns `true`
- **THEN** the view SHALL check `mounted` before calling `viewModel.clearAllCache()`

#### Scenario: Widget unmounted before confirmation

- **GIVEN** the confirmation dialog is open
- **WHEN** the widget is disposed before the user confirms
- **THEN** `viewModel.clearAllCache()` SHALL NOT be called


<!-- @trace
source: settings-m3-refactor
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
-->

---
### Requirement: Confirmation dialog

The `SettingsView` SHALL display an `AlertDialog` before executing the clear-all cache operation. The dialog SHALL contain a title describing the operation, a warning message body, a cancel button that dismisses the dialog without action, and a confirm button that executes the clear operation.

#### Scenario: User confirms deletion

- **GIVEN** the confirmation AlertDialog is displayed
- **WHEN** the user presses the confirm button
- **THEN** the clear-all operation SHALL be executed and the dialog SHALL be dismissed

#### Scenario: User cancels deletion

- **GIVEN** the confirmation AlertDialog is displayed
- **WHEN** the user presses the cancel button
- **THEN** the dialog SHALL be dismissed and no data SHALL be deleted


<!-- @trace
source: settings-ui-refinement
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
tests:
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: AppBar close button without back navigation

The `SettingsView` AppBar SHALL set `automaticallyImplyLeading` to `false` to hide the default back button on the left side.

The AppBar SHALL display a close icon button (`Icons.close`) in the `actions` area on the right side. When tapped, the close button SHALL call `Navigator.of(context).pop()` to dismiss the sheet.

#### Scenario: No back button on the left

- **GIVEN** the SettingsView is presented as a modal bottom sheet
- **WHEN** the page renders
- **THEN** the AppBar SHALL NOT display a back button on the left side

#### Scenario: Close button is visible on the right

- **GIVEN** the SettingsView is presented as a modal bottom sheet
- **WHEN** the page renders
- **THEN** the AppBar SHALL display a close icon button on the right side

#### Scenario: Tapping close button dismisses the sheet

- **GIVEN** the SettingsView is presented as a modal bottom sheet
- **WHEN** the user taps the close button
- **THEN** the sheet SHALL be dismissed via `Navigator.of(context).pop()`

<!-- @trace
source: add-settings-entry-to-home
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
-->

---
### Requirement: Inset grouped list layout

The `SettingsView` body SHALL use a `ListView` containing Material 3 `Card.filled` widgets to present settings items in card-style grouped sections. The section order SHALL be: Appearance, App Icon, Language, Cache, About. Each section SHALL have a header `Text` widget placed above the `Card.filled`, styled with `Theme.of(context).textTheme.titleSmall` and `colorScheme.onSurfaceVariant`. All section header text SHALL be sourced from `AppLocalizations`. The `Card.filled` SHALL contain `ListTile` widgets for individual items. The `Card.filled` widgets SHALL have horizontal padding of 16. The section headers SHALL have left padding of 28. The `Scaffold` SHALL NOT set an explicit `backgroundColor`; it SHALL use the default theme surface color.

#### Scenario: Settings displayed in Material 3 card style

- **GIVEN** the SettingsView is rendered
- **WHEN** the body content is displayed
- **THEN** settings items SHALL be wrapped in `Card.filled` widgets with section header labels above each card
- **AND** the section order SHALL be: Appearance, App Icon, Language, Cache, About

#### Scenario: Section header styling

- **GIVEN** the SettingsView is rendered
- **WHEN** a section header is displayed
- **THEN** the header text SHALL use `textTheme.titleSmall` with `colorScheme.onSurfaceVariant` color
- **AND** the text SHALL be sourced from `AppLocalizations`

#### Scenario: Card horizontal padding

- **GIVEN** the SettingsView is rendered
- **WHEN** any `Card.filled` is displayed
- **THEN** the card SHALL have 16 horizontal padding on both sides


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
### Requirement: Version number display

The `SettingsView` SHALL display the application version number in a dedicated `Card.filled` section with a localized "About" header (sourced from `AppLocalizations`). The version SHALL be shown as a `ListTile` with a localized "Version" title (sourced from `AppLocalizations`) and the version string as `trailing` text styled with `textTheme.bodyLarge` and `colorScheme.onSurfaceVariant`. The version SHALL be retrieved via `PackageInfo.fromPlatform()` from `package_info_plus` and managed as local widget state.

#### Scenario: Version number shown in About section

- **GIVEN** the SettingsView is rendered
- **WHEN** `PackageInfo.fromPlatform()` returns successfully
- **THEN** a `Card.filled` section with a localized "About" header SHALL contain a `ListTile` showing a localized "Version" title and the version string as `trailing` text


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
### Requirement: Appearance mode section

The `SettingsView` SHALL display an "Appearance" section above the cache section, containing a `Card.filled` with a `SegmentedButton<ThemeMode>` control.

The `SegmentedButton` SHALL have three segments:
- `ThemeMode.system` — labeled with the localized "System" text
- `ThemeMode.light` — labeled with the localized "Light" text
- `ThemeMode.dark` — labeled with the localized "Dark" text

The selected segment SHALL reflect `AppSettingsViewModel.themeMode`. When the user selects a segment, the view SHALL call `AppSettingsViewModel.setThemeMode` with the selected value.

#### Scenario: Appearance section renders with current theme mode

- **GIVEN** the `AppSettingsViewModel.themeMode` is `ThemeMode.system`
- **WHEN** the settings view is displayed
- **THEN** the appearance section SHALL show a `SegmentedButton` with "System" segment selected

#### Scenario: User switches to dark mode

- **GIVEN** the appearance section is displayed
- **WHEN** the user taps the "Dark" segment
- **THEN** `AppSettingsViewModel.setThemeMode(ThemeMode.dark)` SHALL be called


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
### Requirement: Language section

The `SettingsView` SHALL display a "Language" section between the appearance section and the cache section, containing a `Card.filled` with a `DropdownMenu<SupportedLocale>` control.

The `DropdownMenu` SHALL list all `SupportedLocale` values (繁體中文, English, 한국어), displaying each value's `label` property (native language name). The initial value SHALL reflect `AppSettingsViewModel.locale` (defaulting to `SupportedLocale.zhTW` when null).

When the user selects a locale, the view SHALL call `AppSettingsViewModel.setLocale` with the selected value.

Language labels SHALL NOT be localized — each language SHALL always display its native name regardless of the current app locale.

#### Scenario: Language section renders with current locale

- **GIVEN** the `AppSettingsViewModel.locale` is `SupportedLocale.zhTW`
- **WHEN** the settings view is displayed
- **THEN** the language section SHALL show a `DropdownMenu` with "繁體中文" selected

#### Scenario: User switches to English

- **GIVEN** the language section is displayed
- **WHEN** the user selects "English" from the dropdown
- **THEN** `AppSettingsViewModel.setLocale(SupportedLocale.en)` SHALL be called


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
### Requirement: Localized UI text

All user-facing text in `SettingsView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals.

#### Scenario: Settings title is localized

- **WHEN** the settings view is displayed in English locale
- **THEN** the AppBar title SHALL display the English translation
- **AND** all section headers and labels SHALL display English text

#### Scenario: Settings title is localized in Chinese

- **WHEN** the settings view is displayed in zh_TW locale
- **THEN** the AppBar title SHALL display "設定"
- **AND** section headers SHALL display their Chinese equivalents

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
### Requirement: App icon picker style enum

The `SettingsView` SHALL define an `AppIconPickerStyle` enum with two values: `horizontalScroll` and `bottomSheet`. The current picker style SHALL be stored as mutable widget state, defaulting to `horizontalScroll`.

#### Scenario: Default picker style

- **GIVEN** the SettingsView is first rendered
- **WHEN** the App Icon section is displayed
- **THEN** the picker style SHALL be `horizontalScroll`


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
### Requirement: App icon section header with style toggle

The "App Icon" section header SHALL display the section title on the left and a style toggle button on the right. The toggle button SHALL consist of an icon and a localized label indicating the target mode (the mode that will be activated on tap). When tapped, it SHALL switch `_appIconPickerStyle` between `horizontalScroll` and `bottomSheet` via `setState`.

- When current style is `horizontalScroll`, the toggle SHALL display a grid icon (`Icons.view_module_rounded`) with label from `settingsAppIconStyleSheet` (e.g., "以網格檢視").
- When current style is `bottomSheet`, the toggle SHALL display a swipe icon (`Icons.swipe_rounded`) with label from `settingsAppIconStyleScroll` (e.g., "以滑動檢視").

#### Scenario: Toggle from horizontal scroll to bottom sheet

- **GIVEN** the current picker style is `horizontalScroll`
- **WHEN** the user taps the style toggle
- **THEN** the picker style SHALL change to `bottomSheet`
- **AND** the toggle label SHALL update to show the scroll view option

#### Scenario: Toggle from bottom sheet to horizontal scroll

- **GIVEN** the current picker style is `bottomSheet`
- **WHEN** the user taps the style toggle
- **THEN** the picker style SHALL change to `horizontalScroll`
- **AND** the toggle label SHALL update to show the grid view option


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
### Requirement: App icon horizontal scroll picker

When `_appIconPickerStyle` is `horizontalScroll`, the App Icon section SHALL display a horizontally scrollable list of icon cards centered on screen. Each card SHALL contain:
- A 72x72 `Image.asset` showing the icon's `previewAsset` wrapped in a `ClipRRect` with 16px border radius.
- A `Row` below the image with a radio button icon (`Icons.radio_button_checked` when selected, `Icons.radio_button_unchecked` otherwise) and a localized name label.
- Selected items SHALL use `colorScheme.primary` color and `FontWeight.bold`; unselected items SHALL use `colorScheme.onSurfaceVariant` and `FontWeight.normal`.

The scroll view SHALL NOT display a scrollbar indicator. Items SHALL be spaced with `Row.spacing: 24`. When tapped, it SHALL call `AppSettingsViewModel.setAppIcon(icon)`.

#### Scenario: Horizontal scroll renders with selection

- **GIVEN** the picker style is `horizontalScroll` and `appIcon` is `AppIcon.defaultIcon`
- **WHEN** the section is displayed
- **THEN** the default icon SHALL show `radio_button_checked` and the new icon SHALL show `radio_button_unchecked`

#### Scenario: User selects icon in horizontal scroll

- **GIVEN** the horizontal scroll picker is displayed
- **WHEN** the user taps the new icon card
- **THEN** `AppSettingsViewModel.setAppIcon(AppIcon.newIcon)` SHALL be called


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
### Requirement: App icon bottom sheet trigger

When `_appIconPickerStyle` is `bottomSheet`, the App Icon section SHALL display an `InputDecorator` showing the currently selected icon (32x32 preview image + localized name + dropdown arrow). When tapped, it SHALL open a modal bottom sheet.

#### Scenario: Bottom sheet trigger shows current icon

- **GIVEN** the picker style is `bottomSheet` and `appIcon` is `AppIcon.newIcon`
- **WHEN** the section is displayed
- **THEN** the trigger SHALL show the new icon's preview image and localized name


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
### Requirement: App icon bottom sheet grid

The App Icon bottom sheet SHALL display a centered title from `settingsAppIconSheetTitle` (e.g., "選擇 App 圖示") followed by a 3-column `GridView` of icon options. Each grid item SHALL contain:
- A 64x64 `Image.asset` wrapped in a `ClipRRect` with 16px border radius.
- A `Row` with a radio button icon and localized name label below the image.

When the user taps a grid item, the bottom sheet SHALL dismiss and call `AppSettingsViewModel.setAppIcon(icon)`.

#### Scenario: Bottom sheet grid renders with selection

- **GIVEN** the bottom sheet is opened and `appIcon` is `AppIcon.defaultIcon`
- **WHEN** the grid is displayed
- **THEN** the default icon SHALL show `radio_button_checked` and the new icon SHALL show `radio_button_unchecked`

#### Scenario: User selects icon in grid

- **GIVEN** the bottom sheet grid is displayed
- **WHEN** the user taps the new icon
- **THEN** the bottom sheet SHALL dismiss
- **AND** `AppSettingsViewModel.setAppIcon(AppIcon.newIcon)` SHALL be called

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