## ADDED Requirements

### Requirement: Runtime theme mode switching

The `MaterialApp.router` in `lib/app.dart` SHALL accept a `themeMode` property from `AppSettingsViewModel.themeMode`, enabling runtime switching between system, light, and dark themes.

#### Scenario: ThemeMode.system follows device setting

- **WHEN** `AppSettingsViewModel.themeMode` is `ThemeMode.system`
- **THEN** `MaterialApp.router` SHALL use the device's current brightness setting to select between `AppTheme.lightTheme` and `AppTheme.darkTheme`

#### Scenario: ThemeMode.dark forces dark theme

- **WHEN** `AppSettingsViewModel.themeMode` is `ThemeMode.dark`
- **THEN** `MaterialApp.router` SHALL apply `AppTheme.darkTheme` regardless of device brightness

#### Scenario: ThemeMode.light forces light theme

- **WHEN** `AppSettingsViewModel.themeMode` is `ThemeMode.light`
- **THEN** `MaterialApp.router` SHALL apply `AppTheme.lightTheme` regardless of device brightness
