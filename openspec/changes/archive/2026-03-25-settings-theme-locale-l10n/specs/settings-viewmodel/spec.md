## ADDED Requirements

### Requirement: Settings page watches AppSettingsViewModel

The `SettingsView` SHALL use `context.watch<AppSettingsViewModel>()` in addition to `context.watch<SettingsViewModel>()` to access both cache-related state and app-wide preference state.

#### Scenario: Settings page accesses both ViewModels

- **WHEN** the `SettingsView` builds
- **THEN** it SHALL watch both `SettingsViewModel` (for cache operations) and `AppSettingsViewModel` (for theme mode and locale)
