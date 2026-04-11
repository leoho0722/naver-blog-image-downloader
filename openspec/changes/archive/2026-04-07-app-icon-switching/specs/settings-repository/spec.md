## ADDED Requirements

### Requirement: Load app icon

`SettingsRepository.loadAppIcon()` SHALL return `AppIcon` directly. It SHALL read the `app_icon` key from `LocalStorageService`. If no persisted value exists or the value is unrecognized, it SHALL return `AppIcon.defaultIcon`.

#### Scenario: No persisted app icon

- **GIVEN** no app icon value is stored in `LocalStorageService`
- **WHEN** `loadAppIcon()` is called
- **THEN** it SHALL return `AppIcon.defaultIcon`

#### Scenario: Persisted app icon is new

- **GIVEN** `LocalStorageService` stores `"new"` for the app icon key
- **WHEN** `loadAppIcon()` is called
- **THEN** it SHALL return `AppIcon.newIcon`

#### Scenario: Unrecognized persisted value

- **GIVEN** `LocalStorageService` stores `"unknown"` for the app icon key
- **WHEN** `loadAppIcon()` is called
- **THEN** it SHALL return `AppIcon.defaultIcon`

### Requirement: Save app icon

`SettingsRepository.saveAppIcon(AppIcon icon)` SHALL return `Future<void>`. It SHALL persist the icon's `nativeKey` string via `LocalStorageService` under the `app_icon` key.

#### Scenario: Save new icon preference

- **GIVEN** the application is running
- **WHEN** `saveAppIcon(AppIcon.newIcon)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the app icon key and `"new"`

#### Scenario: Save default icon preference

- **GIVEN** the application is running
- **WHEN** `saveAppIcon(AppIcon.defaultIcon)` is called
- **THEN** `LocalStorageService.setString` SHALL be called with the app icon key and `"default"`
