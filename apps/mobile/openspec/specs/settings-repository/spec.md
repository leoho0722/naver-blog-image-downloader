# settings-repository Specification

## Purpose

TBD - created by archiving change 'settings-theme-locale-l10n'. Update Purpose after archive.

## Requirements

### Requirement: SettingsRepository constructor

The `SettingsRepository` class SHALL accept a `LocalStorageService` instance via the `required` named parameter `localStorageService`.

#### Scenario: SettingsRepository created with LocalStorageService

- **WHEN** a `SettingsRepository` is instantiated
- **THEN** it SHALL store the `LocalStorageService` reference for internal use


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
### Requirement: Load theme mode

`SettingsRepository.loadThemeMode()` SHALL return `ThemeMode` directly (not wrapped in `Result`). If no persisted value exists, it SHALL return `ThemeMode.system`.

#### Scenario: No persisted theme mode

- **GIVEN** no theme mode is stored in `LocalStorageService`
- **WHEN** `loadThemeMode()` is called
- **THEN** it SHALL return `ThemeMode.system`

#### Scenario: Persisted theme mode is dark

- **GIVEN** `LocalStorageService` stores `"dark"` for the theme mode key
- **WHEN** `loadThemeMode()` is called
- **THEN** it SHALL return `ThemeMode.dark`


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
### Requirement: Save theme mode

`SettingsRepository.saveThemeMode(ThemeMode mode)` SHALL return `Future<void>` (not `Future<Result<void>>`). It SHALL persist the theme mode name string via `LocalStorageService`.

#### Scenario: Save light theme mode

- **GIVEN** the application is running
- **WHEN** `saveThemeMode(ThemeMode.light)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the theme mode key and `"light"`


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
### Requirement: Load locale

`SettingsRepository.loadLocale()` SHALL return `SupportedLocale?` directly (not wrapped in `Result`). If no persisted value exists, it SHALL return `null`.

#### Scenario: No persisted locale

- **GIVEN** no locale is stored in `LocalStorageService`
- **WHEN** `loadLocale()` is called
- **THEN** it SHALL return `null`

#### Scenario: Persisted locale is English

- **GIVEN** `LocalStorageService` stores `"en"` for the locale key
- **WHEN** `loadLocale()` is called
- **THEN** it SHALL return `SupportedLocale.en`


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
### Requirement: Save locale

`SettingsRepository.saveLocale(SupportedLocale locale)` SHALL return `Future<void>` (not `Future<Result<void>>`). It SHALL persist the locale name string via `LocalStorageService`.

#### Scenario: Save Traditional Chinese locale

- **GIVEN** the application is running
- **WHEN** `saveLocale(SupportedLocale.zhTW)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the locale key and `"zhTW"`

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
### Requirement: Load last seen version

`SettingsRepository` SHALL provide a `loadLastSeenVersion()` method that reads the `app_last_seen_version` key from `LocalStorageService` and returns a `String?`. A `null` return value SHALL indicate a fresh install (no version has been seen before).

#### Scenario: Fresh install returns null

- **GIVEN** no value is stored for key `app_last_seen_version`
- **WHEN** `loadLastSeenVersion()` is called
- **THEN** it SHALL return `null`

#### Scenario: Previously stored version returned

- **GIVEN** the value `'1.3.0'` is stored for key `app_last_seen_version`
- **WHEN** `loadLastSeenVersion()` is called
- **THEN** it SHALL return `'1.3.0'`


<!-- @trace
source: whats-new-onboarding
updated: 2026-04-05
code:
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
-->

---
### Requirement: Save last seen version

`SettingsRepository` SHALL provide a `saveLastSeenVersion(String version)` method that persists the given version string to `LocalStorageService` under the key `app_last_seen_version`.

#### Scenario: Version persisted successfully

- **GIVEN** the version string `'1.4.0'`
- **WHEN** `saveLastSeenVersion('1.4.0')` is called
- **THEN** the value `'1.4.0'` SHALL be stored under key `app_last_seen_version` in `LocalStorageService`

<!-- @trace
source: whats-new-onboarding
updated: 2026-04-05
code:
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
-->

---
### Requirement: Load app icon

`SettingsRepository.loadAppIcon()` SHALL return `AppIcon` directly. It SHALL read the `app_icon` key from `LocalStorageService`. If no persisted value exists or the value is unrecognized, it SHALL return `AppIcon.defaultIcon`.

#### Scenario: No persisted app icon

- **GIVEN** no app icon value is stored in `LocalStorageService`
- **WHEN** `loadAppIcon()` is called
- **THEN** it SHALL return `AppIcon.defaultIcon`

#### Scenario: Persisted app icon is new

- **GIVEN** `LocalStorageService` stores `"new"` for the app icon key
- **WHEN** `loadAppIcon()` is called
- **THEN** it SHALL return `AppIcon.newIcon`

#### Scenario: Unrecognized persisted value

- **GIVEN** `LocalStorageService` stores `"unknown"` for the app icon key
- **WHEN** `loadAppIcon()` is called
- **THEN** it SHALL return `AppIcon.defaultIcon`


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
### Requirement: Save app icon

`SettingsRepository.saveAppIcon(AppIcon icon)` SHALL return `Future<void>`. It SHALL persist the icon's `nativeKey` string via `LocalStorageService` under the `app_icon` key.

#### Scenario: Save new icon preference

- **GIVEN** the application is running
- **WHEN** `saveAppIcon(AppIcon.newIcon)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the app icon key and `"new"`

#### Scenario: Save default icon preference

- **GIVEN** the application is running
- **WHEN** `saveAppIcon(AppIcon.defaultIcon)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the app icon key and `"default"`

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