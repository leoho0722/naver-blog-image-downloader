## MODIFIED Requirements

### Requirement: Load theme mode

`SettingsRepository.loadThemeMode()` SHALL return `ThemeMode` directly (not wrapped in `Result`). If no persisted value exists, it SHALL return `ThemeMode.system`.

#### Scenario: No persisted theme mode

- **GIVEN** no theme mode is stored in `LocalStorageService`
- **WHEN** `loadThemeMode()` is called
- **THEN** it SHALL return `ThemeMode.system`

#### Scenario: Persisted theme mode is dark

- **GIVEN** `LocalStorageService` stores `"dark"` for the theme mode key
- **WHEN** `loadThemeMode()` is called
- **THEN** it SHALL return `ThemeMode.dark`

### Requirement: Save theme mode

`SettingsRepository.saveThemeMode(ThemeMode mode)` SHALL return `Future<void>` (not `Future<Result<void>>`). It SHALL persist the theme mode name string via `LocalStorageService`.

#### Scenario: Save light theme mode

- **GIVEN** the application is running
- **WHEN** `saveThemeMode(ThemeMode.light)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the theme mode key and `"light"`

### Requirement: Load locale

`SettingsRepository.loadLocale()` SHALL return `SupportedLocale?` directly (not wrapped in `Result`). If no persisted value exists, it SHALL return `null`.

#### Scenario: No persisted locale

- **GIVEN** no locale is stored in `LocalStorageService`
- **WHEN** `loadLocale()` is called
- **THEN** it SHALL return `null`

#### Scenario: Persisted locale is English

- **GIVEN** `LocalStorageService` stores `"en"` for the locale key
- **WHEN** `loadLocale()` is called
- **THEN** it SHALL return `SupportedLocale.en`

### Requirement: Save locale

`SettingsRepository.saveLocale(SupportedLocale locale)` SHALL return `Future<void>` (not `Future<Result<void>>`). It SHALL persist the locale name string via `LocalStorageService`.

#### Scenario: Save Traditional Chinese locale

- **GIVEN** the application is running
- **WHEN** `saveLocale(SupportedLocale.zhTW)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the locale key and `"zhTW"`
