# whats-new-onboarding Specification

## Purpose

TBD - created by archiving change 'whats-new-onboarding'. Update Purpose after archive.

## Requirements

### Requirement: WhatsNewFeature data model

The system SHALL define a sealed class `WhatsNewItem` in `lib/config/whats_new_registry.dart` with two common properties: `String title` and `String description` (direct display text, NOT l10n keys). It SHALL have two subtypes: `WhatsNewTextItem` (with `String icon` — Material Icon name string) and `WhatsNewImageItem` (with `String base64Image`).

#### Scenario: Text item with icon name string

- **GIVEN** a `WhatsNewTextItem` instance with icon name `"auto_awesome"`, title, and description
- **WHEN** the instance is inspected
- **THEN** `icon` SHALL be a non-empty String and `title`/`description` SHALL be display-ready text

#### Scenario: Image item with base64 image

- **GIVEN** a `WhatsNewImageItem` instance with base64Image, title, and description
- **WHEN** the instance is inspected
- **THEN** `base64Image` SHALL be a non-empty String and `title`/`description` SHALL be display-ready text


<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->

---
### Requirement: Onboarding steps registry

The system SHALL define a top-level `onboardingEntry` constant of type `WhatsNewEntry` in `lib/config/whats_new_registry.dart` containing exactly 4 items with direct Traditional Chinese text (as local fallback when API is unavailable). Items SHALL be `WhatsNewTextItem` instances with `String icon` names.

#### Scenario: Onboarding entry item count

- **GIVEN** the `onboardingEntry` constant
- **WHEN** its `items` list length is checked
- **THEN** it SHALL contain exactly 4 items


<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->

---
### Requirement: What's New version registry

The system SHALL define a top-level `whatsNewRegistry` constant of type `Map<String, WhatsNewEntry>` in `lib/config/whats_new_registry.dart` with direct Traditional Chinese text as local fallback. Version `'1.4.0'` SHALL have at least one entry.

#### Scenario: Registry lookup for existing version

- **GIVEN** the `whatsNewRegistry` map
- **WHEN** looking up key `'1.4.0'`
- **THEN** it SHALL return a non-null `WhatsNewEntry` with a non-empty items list


<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->

---
### Requirement: WhatsNewViewModel sealed state

`WhatsNewViewModel` SHALL use `@Riverpod(keepAlive: true)` and its `build()` method SHALL obtain content through `WhatsNewDataSource` (async). When `getOnboardingEntry()` returns `null`, the ViewModel SHALL silently save the current version and return `WhatsNewHidden`. When `getWhatsNewEntry()` returns `null`, the same behavior SHALL apply. Both `version` and `locale` parameters SHALL be passed to DataSource methods. The `locale` SHALL be obtained from `AppSettingsViewModel` (user's preferred locale), falling back to the device's default locale when no preference is set. All scenarios SHALL log via `LogRepository`.

#### Scenario: First install returns onboarding state

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns `null` and `hasExistingData()` returns `false`
- **AND** `WhatsNewDataSource.getOnboardingEntry(version, locale)` returns a non-null `WhatsNewEntry`
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewOnboarding` with the entry from the data source
- **AND** a fire-and-forget log SHALL be recorded

#### Scenario: First install with null onboarding entry saves version and hides

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns `null` and `hasExistingData()` returns `false`
- **AND** `WhatsNewDataSource.getOnboardingEntry(version, locale)` returns `null`
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** `saveLastSeenVersion` SHALL be called and the state SHALL be `WhatsNewHidden`
- **AND** a fire-and-forget log SHALL be recorded

#### Scenario: Upgrade returns what's new state

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns a version different from current
- **AND** `WhatsNewDataSource.getWhatsNewEntry(currentVersion, locale)` returns a non-null `WhatsNewEntry`
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewUpdate`
- **AND** a fire-and-forget log SHALL be recorded

#### Scenario: Updated version with null entry saves version and hides

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns a version different from current
- **AND** `WhatsNewDataSource.getWhatsNewEntry(currentVersion, locale)` returns `null`
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** `saveLastSeenVersion` SHALL be called and the state SHALL be `WhatsNewHidden`
- **AND** a fire-and-forget log SHALL be recorded

#### Scenario: Same version returns hidden state

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns the current app version
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewHidden`
- **AND** a fire-and-forget log SHALL be recorded

#### Scenario: PackageInfo unavailable returns hidden state

- **GIVEN** `PackageInfo.fromPlatform()` throws an exception
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewHidden`
- **AND** a fire-and-forget log SHALL be recorded


<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->

---
### Requirement: WhatsNewViewModel dismiss method

`WhatsNewViewModel.dismiss()` SHALL call `SettingsRepository.saveLastSeenVersion()` with the current version, update the state to `WhatsNewHidden`, and fire-and-forget a page navigation log via `LogRepository`.

#### Scenario: Dismiss saves version and hides

- **GIVEN** the current state is `WhatsNewOnboarding` or `WhatsNewUpdate`
- **WHEN** `dismiss()` is called
- **THEN** `saveLastSeenVersion` SHALL be called with the current app version
- **AND** the state SHALL transition to `WhatsNewHidden`


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
### Requirement: What's New fullscreen dialog UI

The system SHALL provide a `showWhatsNewDialog()` function in `lib/ui/whats_new/widgets/whats_new_view.dart` that displays a fullscreen `Dialog` with: a title section, a scrollable list of feature items (each with icon, title, description), and a `FilledButton` dismiss button at the bottom. The dialog SHALL NOT be dismissible by tapping outside (`barrierDismissible: false`).

#### Scenario: Onboarding dialog displayed

- **GIVEN** the state is `WhatsNewOnboarding`
- **WHEN** `showWhatsNewDialog` is called
- **THEN** the dialog title SHALL be the localized onboarding title (e.g., "Welcome")
- **AND** the feature list SHALL show 4 onboarding steps with localized text

#### Scenario: What's New dialog displayed

- **GIVEN** the state is `WhatsNewUpdate` for version `'1.4.0'`
- **WHEN** `showWhatsNewDialog` is called
- **THEN** the dialog title SHALL contain the version string (e.g., "What's New in v1.4.0")
- **AND** the feature list SHALL show the features from the registry

#### Scenario: Dismiss button closes dialog

- **GIVEN** the fullscreen dialog is displayed
- **WHEN** the user taps the dismiss button
- **THEN** the dialog SHALL close


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
### Requirement: BlogInputView triggers What's New check

`BlogInputView` SHALL check the `WhatsNewViewModel` state in a `WidgetsBinding.instance.addPostFrameCallback` within `initState()`. If the state is NOT `WhatsNewHidden`, it SHALL display the fullscreen dialog and call `dismiss()` after the dialog is closed.

#### Scenario: Post-frame callback triggers check

- **GIVEN** `BlogInputView` is mounted
- **WHEN** the first frame completes
- **THEN** the system SHALL read `whatsNewViewModelProvider.future` and show the dialog if the state is not `WhatsNewHidden`

#### Scenario: Dialog not shown when hidden

- **GIVEN** the `WhatsNewViewModel` state is `WhatsNewHidden`
- **WHEN** the first frame completes
- **THEN** no dialog SHALL be shown


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
### Requirement: Localized What's New strings

All 5 ARB files SHALL contain localized strings for: `whatsNewTitle` (with `{version}` placeholder), `whatsNewOnboardingTitle`, `whatsNewDismissButton`, `onboardingStep1Title`, `onboardingStep1Desc`, `onboardingStep2Title`, `onboardingStep2Desc`, `onboardingStep3Title`, `onboardingStep3Desc`, `onboardingStep4Title`, `onboardingStep4Desc`, and at least one `whatsNew140Feature1Title` / `whatsNew140Feature1Desc` placeholder pair.

#### Scenario: All locale files contain required keys

- **GIVEN** the 5 ARB files (en, ja, ko, zh, zh_TW)
- **WHEN** their contents are inspected
- **THEN** each file SHALL contain all the keys listed above with appropriate translations

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
### Requirement: WhatsNewResponse DTO

The system SHALL define a `WhatsNewResponse` class in `lib/data/models/whats_new_response.dart` with properties: `String version`, `List<WhatsNewItemDto> onboarding`, `List<WhatsNewItemDto> whatsNew`. `WhatsNewItemDto` SHALL have: `String type` (`"text"` or `"image"`), `String? icon`, `String? base64Image`, `String title`, `String description`. Both classes SHALL have `fromJson` factory constructors for JSON deserialization.

#### Scenario: Deserialize text item from JSON

- **GIVEN** a JSON object `{ "type": "text", "icon": "auto_awesome", "title": "Feature", "description": "Desc" }`
- **WHEN** `WhatsNewItemDto.fromJson` is called
- **THEN** `type` SHALL be `"text"`, `icon` SHALL be `"auto_awesome"`, `base64Image` SHALL be `null`

#### Scenario: Deserialize image item from JSON

- **GIVEN** a JSON object `{ "type": "image", "base64Image": "iVBOR...", "title": "Feature", "description": "Desc" }`
- **WHEN** `WhatsNewItemDto.fromJson` is called
- **THEN** `type` SHALL be `"image"`, `base64Image` SHALL be `"iVBOR..."`, `icon` SHALL be `null`


<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->

---
### Requirement: Icon name resolution

The system SHALL provide a `resolveIcon(String name)` function that maps Material Icon name strings (e.g., `"auto_awesome"`, `"content_paste"`, `"photo_library"`, `"download"`, `"swipe"`) to their corresponding `IconData`. Unknown icon names SHALL fallback to `Icons.info_outline`.

#### Scenario: Known icon name resolves correctly

- **GIVEN** the icon name `"auto_awesome"`
- **WHEN** `resolveIcon("auto_awesome")` is called
- **THEN** it SHALL return `Icons.auto_awesome`

#### Scenario: Unknown icon name returns fallback

- **GIVEN** an unknown icon name `"nonexistent_icon"`
- **WHEN** `resolveIcon("nonexistent_icon")` is called
- **THEN** it SHALL return `Icons.info_outline`


<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->

---
### Requirement: Remove l10n key resolution

The system SHALL remove the `_resolveL10n` helper function from `whats_new_dialog.dart`. Dialog widgets SHALL directly use `item.title` and `item.description` for rendering. ARB files SHALL remove all onboarding step and whatsNew feature content keys (`onboardingStep*`, `whatsNew140Feature*`), retaining only UI structural keys (`whatsNewTitle`, `whatsNewOnboardingTitle`, `whatsNewDismissButton`, `whatsNewCloseButton`).

#### Scenario: Dialog renders direct text

- **GIVEN** a `WhatsNewTextItem` with title `"Feature Title"` and description `"Feature Desc"`
- **WHEN** the Dialog renders the item
- **THEN** it SHALL display `"Feature Title"` and `"Feature Desc"` directly without l10n lookup

<!-- @trace
source: whats-new-multi-format
updated: 2026-04-06
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_request.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/data/models/whats_new_item.dart
  - naver_blog_image_downloader/lib/config/whats_new_icon_resolver.dart
  - naver_blog_image_downloader/lib/data/models/dtos/whats_new_response.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/services/whats_new_data_source.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
-->