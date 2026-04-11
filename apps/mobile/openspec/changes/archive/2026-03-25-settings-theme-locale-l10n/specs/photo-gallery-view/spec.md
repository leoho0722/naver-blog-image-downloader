## ADDED Requirements

### Requirement: Localized UI text

All user-facing text in `PhotoGalleryView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals. This includes:

- AppBar title (parameterized with photo count)
- Tooltip text (cancel selection, select mode, select all, save selected, save all)
- Empty state message
- Saving progress text

#### Scenario: Gallery text in English

- **WHEN** the app locale is set to English
- **THEN** all user-facing text in `PhotoGalleryView` SHALL display English translations from `AppLocalizations`

#### Scenario: Gallery title shows photo count

- **WHEN** the gallery contains 10 photos and the locale is English
- **THEN** the AppBar title SHALL display the English parameterized title with count 10
