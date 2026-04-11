## MODIFIED Requirements

### Requirement: AppSettingsViewModel state properties

`AppSettingsViewModel` SHALL expose its state as `AsyncValue<AppSettingsState>`. `AppSettingsState` SHALL be an immutable class with `themeMode` (default `ThemeMode.system`), `locale` (default `null`), and `appIcon` (default `AppIcon.defaultIcon`).

#### Scenario: Initial state

- **GIVEN** `AppSettingsViewModel` has not yet completed initialization
- **WHEN** `appSettingsViewModelProvider` is watched
- **THEN** it SHALL return `AsyncLoading`

### Requirement: Load settings

`AppSettingsViewModel.build()` SHALL asynchronously load theme mode, locale, and app icon from `SettingsRepository` and return an `AppSettingsState`. There SHALL be no separate `loadSettings()` method.

#### Scenario: Load persisted settings

- **GIVEN** `SettingsRepository` has persisted theme `dark`, locale `en`, and app icon `new`
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(AppSettingsState(themeMode: ThemeMode.dark, locale: SupportedLocale.en, appIcon: AppIcon.newIcon))`

#### Scenario: Repository returns default values

- **GIVEN** `SettingsRepository` has no persisted values
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(AppSettingsState(themeMode: ThemeMode.system, locale: null, appIcon: AppIcon.defaultIcon))`

## ADDED Requirements

### Requirement: Set app icon

`setAppIcon(AppIcon icon)` SHALL optimistically update the state to `AsyncData` with the new app icon, then persist via `SettingsRepository.saveAppIcon()`, then call `AppIconService.setAppIcon()` with the icon's `nativeKey` to trigger the native platform icon switch, then log the change via `LogRepository.logSettingsChange()`.

#### Scenario: Switch to new icon

- **GIVEN** the current state has `appIcon: AppIcon.defaultIcon`
- **WHEN** `setAppIcon(AppIcon.newIcon)` is called
- **THEN** the state SHALL immediately become `AsyncData` with `appIcon: AppIcon.newIcon`
- **AND** `SettingsRepository.saveAppIcon(AppIcon.newIcon)` SHALL be called
- **AND** `AppIconService.setAppIcon("new")` SHALL be called
- **AND** `LogRepository.logSettingsChange` SHALL be called with `setting: 'appIcon'`, `oldValue: 'default'`, `newValue: 'new'`

#### Scenario: Switch back to default icon

- **GIVEN** the current state has `appIcon: AppIcon.newIcon`
- **WHEN** `setAppIcon(AppIcon.defaultIcon)` is called
- **THEN** the state SHALL immediately become `AsyncData` with `appIcon: AppIcon.defaultIcon`
- **AND** `AppIconService.setAppIcon("default")` SHALL be called

### Requirement: Operation logging in setAppIcon

`AppSettingsViewModel.setAppIcon(AppIcon icon)` SHALL log the settings change via `ref.read(logRepositoryProvider)` after the icon switch completes.

`setAppIcon()` SHALL call `logSettingsChange` with the following parameters:

- `setting` -- the string `'appIcon'`
- `oldValue` -- the `nativeKey` of the previous `AppIcon` value
- `newValue` -- the `nativeKey` of the new `AppIcon` value

The log call SHALL be fire-and-forget and SHALL NOT affect the state update or native icon switch behavior.

#### Scenario: App icon change logged

- **GIVEN** the current app icon is `AppIcon.defaultIcon`
- **WHEN** `setAppIcon(AppIcon.newIcon)` is called
- **THEN** `logSettingsChange` SHALL be called with `setting: 'appIcon'`, `oldValue: 'default'`, `newValue: 'new'`

#### Scenario: Log failure does not affect icon change

- **GIVEN** `logSettingsChange` throws an exception internally
- **WHEN** `setAppIcon(AppIcon.newIcon)` is called
- **THEN** the state SHALL still be updated to `AppIcon.newIcon`
- **AND** the native icon switch SHALL still complete
