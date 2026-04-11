## ADDED Requirements

### Requirement: Localized UI text

All user-facing text in `PhotoDetailView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals. This includes:

- File info labels (file info title, file size, photo dimensions)
- Save button text and status indicators

#### Scenario: Detail view text in English

- **WHEN** the app locale is set to English
- **THEN** all file info labels and action text in `PhotoDetailView` SHALL display English translations from `AppLocalizations`

#### Scenario: Detail view text in Traditional Chinese

- **WHEN** the app locale is set to zh_TW
- **THEN** all file info labels and action text in `PhotoDetailView` SHALL display Traditional Chinese text from `AppLocalizations`
