## MODIFIED Requirements

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

### Requirement: Onboarding steps registry

The system SHALL define a top-level `onboardingEntry` constant of type `WhatsNewEntry` in `lib/config/whats_new_registry.dart` containing exactly 4 items with direct Traditional Chinese text (as local fallback when API is unavailable). Items SHALL be `WhatsNewTextItem` instances with `String icon` names.

#### Scenario: Onboarding entry item count

- **GIVEN** the `onboardingEntry` constant
- **WHEN** its `items` list length is checked
- **THEN** it SHALL contain exactly 4 items

### Requirement: What's New version registry

The system SHALL define a top-level `whatsNewRegistry` constant of type `Map<String, WhatsNewEntry>` in `lib/config/whats_new_registry.dart` with direct Traditional Chinese text as local fallback. Version `'1.4.0'` SHALL have at least one entry.

#### Scenario: Registry lookup for existing version

- **GIVEN** the `whatsNewRegistry` map
- **WHEN** looking up key `'1.4.0'`
- **THEN** it SHALL return a non-null `WhatsNewEntry` with a non-empty items list

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

### Requirement: WhatsNewDataSource abstraction

The system SHALL define an abstract class `WhatsNewDataSource` with two async methods: `Future<WhatsNewEntry?> getOnboardingEntry({required String version, required String locale})` and `Future<WhatsNewEntry?> getWhatsNewEntry({required String version, required String locale})`. `WhatsNewDataSourceImpl` SHALL call the backend API (`POST /default/api/whatsNew` with `{ "version": "<version>", "locale": "<locale>" }`), cache the response, and convert the JSON items to `WhatsNewEntry`. On API failure, it SHALL fallback to local registry constants (`onboardingEntry` / `whatsNewRegistry`).

#### Scenario: API success returns server content

- **GIVEN** the API returns a valid response with onboarding and whatsNew arrays
- **WHEN** `getOnboardingEntry(version: "1.4.0", locale: "zh-TW")` is called
- **THEN** it SHALL return `WhatsNewEntry` built from the API response items in the requested locale

#### Scenario: API failure falls back to local registry

- **GIVEN** the API call fails (network error, timeout, non-200 status)
- **WHEN** `getOnboardingEntry(version: "1.4.0", locale: "en")` is called
- **THEN** it SHALL return the local `onboardingEntry` constant as fallback (Traditional Chinese)

#### Scenario: Cached response avoids duplicate API calls

- **GIVEN** `getOnboardingEntry(version: "1.4.0", locale: "zh-TW")` was called and API responded successfully
- **WHEN** `getWhatsNewEntry(version: "1.4.0", locale: "zh-TW")` is called with the same version and locale
- **THEN** it SHALL use the cached response without making another API call

## ADDED Requirements

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

### Requirement: Remove l10n key resolution

The system SHALL remove the `_resolveL10n` helper function from `whats_new_dialog.dart`. Dialog widgets SHALL directly use `item.title` and `item.description` for rendering. ARB files SHALL remove all onboarding step and whatsNew feature content keys (`onboardingStep*`, `whatsNew140Feature*`), retaining only UI structural keys (`whatsNewTitle`, `whatsNewOnboardingTitle`, `whatsNewDismissButton`, `whatsNewCloseButton`).

#### Scenario: Dialog renders direct text

- **GIVEN** a `WhatsNewTextItem` with title `"Feature Title"` and description `"Feature Desc"`
- **WHEN** the Dialog renders the item
- **THEN** it SHALL display `"Feature Title"` and `"Feature Desc"` directly without l10n lookup
