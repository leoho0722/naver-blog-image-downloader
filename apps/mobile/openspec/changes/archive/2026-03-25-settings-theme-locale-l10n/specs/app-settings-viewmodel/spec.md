## ADDED Requirements

### Requirement: AppSettingsViewModel constructor

The `AppSettingsViewModel` class SHALL extend `ChangeNotifier` and accept a `SettingsRepository` instance via the `required` named parameter `settingsRepository`.

#### Scenario: AppSettingsViewModel created with SettingsRepository

- **WHEN** an `AppSettingsViewModel` is instantiated
- **THEN** it SHALL store the `SettingsRepository` reference for internal use

### Requirement: AppSettingsViewModel state properties

The `AppSettingsViewModel` SHALL expose the following read-only properties:

- `themeMode` (ThemeMode) — the current theme mode, defaulting to `ThemeMode.system`
- `locale` (SupportedLocale?) — the current locale, defaulting to `null` (follow system)

#### Scenario: Initial state

- **WHEN** a new `AppSettingsViewModel` is created (before `loadSettings` is called)
- **THEN** `themeMode` SHALL be `ThemeMode.system`
- **AND** `locale` SHALL be `null`

### Requirement: Load settings

The `loadSettings` method SHALL read persisted theme mode and locale from `SettingsRepository` and update the corresponding properties.

#### Scenario: Load persisted settings

- **WHEN** `loadSettings()` is called
- **THEN** the ViewModel SHALL call `SettingsRepository.loadThemeMode()` and update `themeMode` with the result
- **AND** SHALL call `SettingsRepository.loadLocale()` and update `locale` with the result
- **AND** SHALL call `notifyListeners()`

#### Scenario: Repository returns error

- **WHEN** `loadSettings()` is called and a repository method returns `Result.error`
- **THEN** the ViewModel SHALL keep the default value for that property
- **AND** SHALL still call `notifyListeners()`

### Requirement: Set theme mode

The `setThemeMode` method SHALL update the `themeMode` property, call `notifyListeners()`, and persist the value via `SettingsRepository.saveThemeMode`.

#### Scenario: Switch to dark mode

- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** `themeMode` SHALL be updated to `ThemeMode.dark`
- **AND** `notifyListeners()` SHALL be called
- **AND** `SettingsRepository.saveThemeMode(ThemeMode.dark)` SHALL be invoked

### Requirement: Set locale

The `setLocale` method SHALL update the `locale` property, call `notifyListeners()`, and persist the value via `SettingsRepository.saveLocale`.

#### Scenario: Switch to English

- **WHEN** `setLocale(SupportedLocale.en)` is called
- **THEN** `locale` SHALL be updated to `SupportedLocale.en`
- **AND** `notifyListeners()` SHALL be called
- **AND** `SettingsRepository.saveLocale(SupportedLocale.en)` SHALL be invoked
