## ADDED Requirements

### Requirement: Localized UI text

All user-facing text in `BlogInputView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals. This includes:

- AppBar title
- TextField labelText and hintText
- Button labels (fetch, cancel, paste)
- Dialog titles and content (error, clipboard detection, fetch failure warning)
- Tooltip text

#### Scenario: UI text displayed in English

- **WHEN** the app locale is set to English
- **THEN** all user-facing text in `BlogInputView` SHALL display English translations from `AppLocalizations`

#### Scenario: UI text displayed in Traditional Chinese

- **WHEN** the app locale is set to zh_TW
- **THEN** all user-facing text in `BlogInputView` SHALL display Traditional Chinese text from `AppLocalizations`

### Requirement: Error message mapping from ViewModel enum

The `BlogInputView` SHALL map `FetchErrorType` enum values from `BlogInputViewModel` to localized error messages using `AppLocalizations.of(context)`.

#### Scenario: FetchErrorType.emptyUrl mapped to localized message

- **WHEN** the ViewModel's `FetchState` is `FetchError` with `errorType` `FetchErrorType.emptyUrl`
- **THEN** the view SHALL display the localized empty URL error message from `AppLocalizations`

#### Scenario: FetchErrorType.timeout mapped to localized message

- **WHEN** the ViewModel's `FetchState` is `FetchError` with `errorType` `FetchErrorType.timeout`
- **THEN** the view SHALL display the localized timeout error message from `AppLocalizations`

### Requirement: Loading phase mapping from ViewModel enum

The `BlogInputView` SHALL map `FetchLoadingPhase` enum values from `BlogInputViewModel` to localized status messages using `AppLocalizations.of(context)`.

#### Scenario: FetchLoadingPhase.submitting mapped to localized message

- **WHEN** the ViewModel's `FetchState` is `FetchLoading` with `phase` `FetchLoadingPhase.submitting`
- **THEN** the view SHALL display the localized "submitting" status message from `AppLocalizations`
