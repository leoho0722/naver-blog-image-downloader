# app-settings-viewmodel Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Operation logging in setThemeMode

`AppSettingsViewModel.setThemeMode(ThemeMode mode)` SHALL log the settings change via `ref.read(logRepositoryProvider)` after updating the state.

`setThemeMode()` SHALL call `logSettingsChange` with the following parameters:

- `setting` -- the string `'theme'`
- `oldValue` -- the string representation of the previous `ThemeMode` value (e.g., `'ThemeMode.system'`)
- `newValue` -- the string representation of the new `ThemeMode` value (e.g., `'ThemeMode.dark'`)

The log call SHALL be fire-and-forget and SHALL NOT affect the state update or persistence behavior.

#### Scenario: Theme change logged

- **GIVEN** the current theme mode is `ThemeMode.system`
- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** `logSettingsChange` SHALL be called with `setting: 'theme'`, `oldValue: 'ThemeMode.system'`, `newValue: 'ThemeMode.dark'`
- **AND** the state SHALL still be updated optimistically to `ThemeMode.dark`

#### Scenario: Log failure does not affect theme change

- **GIVEN** `logSettingsChange` throws an exception internally
- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** the state SHALL still be updated to `ThemeMode.dark`
- **AND** `SettingsRepository.saveThemeMode()` SHALL still be called

---

### Requirement: Operation logging in setLocale

`AppSettingsViewModel.setLocale(SupportedLocale locale)` SHALL log the settings change via `ref.read(logRepositoryProvider)` after updating the state.

`setLocale()` SHALL call `logSettingsChange` with the following parameters:

- `setting` -- the string `'locale'`
- `oldValue` -- the string representation of the previous locale value (e.g., `'null'` or `'SupportedLocale.en'`)
- `newValue` -- the string representation of the new `SupportedLocale` value (e.g., `'SupportedLocale.ko'`)

The log call SHALL be fire-and-forget and SHALL NOT affect the state update or persistence behavior.

#### Scenario: Locale change logged

- **GIVEN** the current locale is `null`
- **WHEN** `setLocale(SupportedLocale.en)` is called
- **THEN** `logSettingsChange` SHALL be called with `setting: 'locale'`, `oldValue: 'null'`, `newValue: 'SupportedLocale.en'`
- **AND** the state SHALL still be updated optimistically to `SupportedLocale.en`

#### Scenario: Log failure does not affect locale change

- **GIVEN** `logSettingsChange` throws an exception internally
- **WHEN** `setLocale(SupportedLocale.ko)` is called
- **THEN** the state SHALL still be updated to `SupportedLocale.ko`
- **AND** `SettingsRepository.saveLocale()` SHALL still be called
