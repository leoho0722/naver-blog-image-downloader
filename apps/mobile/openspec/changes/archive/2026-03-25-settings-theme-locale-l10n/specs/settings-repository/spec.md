## ADDED Requirements

### Requirement: SettingsRepository constructor

The `SettingsRepository` class SHALL accept a `LocalStorageService` instance via the `required` named parameter `localStorageService`.

#### Scenario: SettingsRepository created with LocalStorageService

- **WHEN** a `SettingsRepository` is instantiated
- **THEN** it SHALL store the `LocalStorageService` reference for internal use

### Requirement: Load theme mode

The `loadThemeMode` method SHALL read the persisted theme mode string from `LocalStorageService` using the key `app_theme_mode` and return a `Result<ThemeMode>`.

- If the stored value is `"system"`, it SHALL return `Result.ok(ThemeMode.system)`.
- If the stored value is `"light"`, it SHALL return `Result.ok(ThemeMode.light)`.
- If the stored value is `"dark"`, it SHALL return `Result.ok(ThemeMode.dark)`.
- If no value is stored (null), it SHALL return `Result.ok(ThemeMode.system)` as the default.

#### Scenario: No persisted theme mode

- **WHEN** `loadThemeMode()` is called and no value exists for key `app_theme_mode`
- **THEN** the method SHALL return `Result.ok(ThemeMode.system)`

#### Scenario: Persisted theme mode is dark

- **WHEN** `loadThemeMode()` is called and the stored value is `"dark"`
- **THEN** the method SHALL return `Result.ok(ThemeMode.dark)`

### Requirement: Save theme mode

The `saveThemeMode` method SHALL persist the given `ThemeMode` value as a string via `LocalStorageService.setString` using the key `app_theme_mode` and return `Future<Result<void>>`.

#### Scenario: Save light theme mode

- **WHEN** `saveThemeMode(ThemeMode.light)` is called
- **THEN** `LocalStorageService.setString("app_theme_mode", "light")` SHALL be invoked
- **AND** the method SHALL return `Result.ok`

### Requirement: Load locale

The `loadLocale` method SHALL read the persisted locale string from `LocalStorageService` using the key `app_locale` and return a `Result<SupportedLocale?>`.

- If the stored value matches a `SupportedLocale` enum name, it SHALL return the corresponding `SupportedLocale`.
- If no value is stored (null), it SHALL return `Result.ok(null)` indicating no explicit preference.

#### Scenario: No persisted locale

- **WHEN** `loadLocale()` is called and no value exists for key `app_locale`
- **THEN** the method SHALL return `Result.ok(null)`

#### Scenario: Persisted locale is English

- **WHEN** `loadLocale()` is called and the stored value is `"en"`
- **THEN** the method SHALL return `Result.ok(SupportedLocale.en)`

### Requirement: Save locale

The `saveLocale` method SHALL persist the given `SupportedLocale` value as a string via `LocalStorageService.setString` using the key `app_locale` and return `Future<Result<void>>`.

#### Scenario: Save Traditional Chinese locale

- **WHEN** `saveLocale(SupportedLocale.zhTW)` is called
- **THEN** `LocalStorageService.setString("app_locale", "zhTW")` SHALL be invoked
- **AND** the method SHALL return `Result.ok`
