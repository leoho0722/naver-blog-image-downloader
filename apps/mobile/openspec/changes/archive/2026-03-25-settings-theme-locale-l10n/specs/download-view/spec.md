## ADDED Requirements

### Requirement: Localized UI text

All user-facing text in `DownloadView` (download dialog) SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals. This includes:

- Dialog title
- Status text (downloading, completed)
- Failed count message (parameterized with count)

#### Scenario: Download dialog text in English

- **WHEN** the app locale is set to English
- **THEN** all status text and labels in the download dialog SHALL display English translations from `AppLocalizations`

#### Scenario: Download dialog text in Traditional Chinese

- **WHEN** the app locale is set to zh_TW
- **THEN** all status text and labels in the download dialog SHALL display Traditional Chinese text from `AppLocalizations`
