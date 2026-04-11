## ADDED Requirements

### Requirement: WhatsNewFeature data model

The system SHALL define a `WhatsNewFeature` class in `lib/config/whats_new_registry.dart` with three properties: `IconData icon`, `String titleKey`, and `String descriptionKey`. The `titleKey` and `descriptionKey` SHALL be identifiers used by the View layer to resolve localized strings via `AppLocalizations`.

#### Scenario: Feature item with all properties

- **GIVEN** a `WhatsNewFeature` instance with icon, titleKey, and descriptionKey
- **WHEN** the instance is inspected
- **THEN** all three properties SHALL be accessible and non-null

### Requirement: Onboarding steps registry

The system SHALL define a top-level `onboardingSteps` constant of type `List<WhatsNewFeature>` in `lib/config/whats_new_registry.dart` containing exactly 4 items representing the app usage guide: (1) paste blog URL, (2) fetch all photos, (3) download and save, (4) browse photos.

#### Scenario: Onboarding steps count

- **GIVEN** the `onboardingSteps` list
- **WHEN** its length is checked
- **THEN** it SHALL contain exactly 4 items

### Requirement: What's New version registry

The system SHALL define a top-level `whatsNewRegistry` constant of type `Map<String, List<WhatsNewFeature>>` in `lib/config/whats_new_registry.dart` mapping version strings to their feature lists. Version `'1.4.0'` SHALL have at least one placeholder feature entry.

#### Scenario: Registry lookup for existing version

- **GIVEN** the `whatsNewRegistry` map
- **WHEN** looking up key `'1.4.0'`
- **THEN** it SHALL return a non-empty list of `WhatsNewFeature`

#### Scenario: Registry lookup for unknown version

- **GIVEN** the `whatsNewRegistry` map
- **WHEN** looking up a key that does not exist (e.g., `'99.0.0'`)
- **THEN** it SHALL return `null`

### Requirement: WhatsNewViewModel sealed state

The system SHALL define a `WhatsNewViewModel` using `@riverpod` (auto-dispose) in `lib/ui/whats_new/view_model/whats_new_view_model.dart`. The state SHALL be `AsyncValue<WhatsNewState>` where `WhatsNewState` is a sealed class with three subtypes: `WhatsNewHidden`, `WhatsNewOnboarding` (with `version` and `steps`), and `WhatsNewUpdate` (with `version` and `features`).

#### Scenario: First install returns onboarding state

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns `null`
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewOnboarding` with the current app version and the 4 onboarding steps

#### Scenario: Same version returns hidden state

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns the current app version
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewHidden`

#### Scenario: Updated version with registry entry returns update state

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns a version different from current
- **AND** `whatsNewRegistry` contains an entry for the current version
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewUpdate` with the current version and features from the registry

#### Scenario: Updated version without registry entry returns hidden and saves version

- **GIVEN** `SettingsRepository.loadLastSeenVersion()` returns a version different from current
- **AND** `whatsNewRegistry` does NOT contain an entry for the current version
- **WHEN** `WhatsNewViewModel.build()` completes
- **THEN** the state SHALL be `WhatsNewHidden`
- **AND** `saveLastSeenVersion` SHALL be called with the current version

### Requirement: WhatsNewViewModel dismiss method

`WhatsNewViewModel.dismiss()` SHALL call `SettingsRepository.saveLastSeenVersion()` with the current version, update the state to `WhatsNewHidden`, and fire-and-forget a page navigation log via `LogRepository`.

#### Scenario: Dismiss saves version and hides

- **GIVEN** the current state is `WhatsNewOnboarding` or `WhatsNewUpdate`
- **WHEN** `dismiss()` is called
- **THEN** `saveLastSeenVersion` SHALL be called with the current app version
- **AND** the state SHALL transition to `WhatsNewHidden`

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

### Requirement: Localized What's New strings

All 5 ARB files SHALL contain localized strings for: `whatsNewTitle` (with `{version}` placeholder), `whatsNewOnboardingTitle`, `whatsNewDismissButton`, `onboardingStep1Title`, `onboardingStep1Desc`, `onboardingStep2Title`, `onboardingStep2Desc`, `onboardingStep3Title`, `onboardingStep3Desc`, `onboardingStep4Title`, `onboardingStep4Desc`, and at least one `whatsNew140Feature1Title` / `whatsNew140Feature1Desc` placeholder pair.

#### Scenario: All locale files contain required keys

- **GIVEN** the 5 ARB files (en, ja, ko, zh, zh_TW)
- **WHEN** their contents are inspected
- **THEN** each file SHALL contain all the keys listed above with appropriate translations
