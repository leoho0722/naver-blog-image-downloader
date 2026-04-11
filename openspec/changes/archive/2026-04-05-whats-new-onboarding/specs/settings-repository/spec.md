## ADDED Requirements

### Requirement: Load last seen version

`SettingsRepository` SHALL provide a `loadLastSeenVersion()` method that reads the `app_last_seen_version` key from `LocalStorageService` and returns a `String?`. A `null` return value SHALL indicate a fresh install (no version has been seen before).

#### Scenario: Fresh install returns null

- **GIVEN** no value is stored for key `app_last_seen_version`
- **WHEN** `loadLastSeenVersion()` is called
- **THEN** it SHALL return `null`

#### Scenario: Previously stored version returned

- **GIVEN** the value `'1.3.0'` is stored for key `app_last_seen_version`
- **WHEN** `loadLastSeenVersion()` is called
- **THEN** it SHALL return `'1.3.0'`

### Requirement: Save last seen version

`SettingsRepository` SHALL provide a `saveLastSeenVersion(String version)` method that persists the given version string to `LocalStorageService` under the key `app_last_seen_version`.

#### Scenario: Version persisted successfully

- **GIVEN** the version string `'1.4.0'`
- **WHEN** `saveLastSeenVersion('1.4.0')` is called
- **THEN** the value `'1.4.0'` SHALL be stored under key `app_last_seen_version` in `LocalStorageService`
