## ADDED Requirements

### Requirement: Light theme defined

The file `lib/config/theme.dart` SHALL define a light `ThemeData` accessible via `AppTheme.lightTheme`.

- The light theme SHALL have `useMaterial3` set to `true`.
- The light theme SHALL include a `ColorScheme` with `Brightness.light`.
- The light theme SHALL use `ColorScheme.fromSeed` with a defined seed color.

#### Scenario: Light theme uses Material 3

- **WHEN** `AppTheme.lightTheme` is inspected
- **THEN** its `useMaterial3` property SHALL be `true`

#### Scenario: Light theme has correct brightness

- **WHEN** the `colorScheme` of `AppTheme.lightTheme` is inspected
- **THEN** its `brightness` SHALL be `Brightness.light`

### Requirement: Dark theme defined

The file `lib/config/theme.dart` SHALL define a dark `ThemeData` accessible via `AppTheme.darkTheme`.

- The dark theme SHALL have `useMaterial3` set to `true`.
- The dark theme SHALL include a `ColorScheme` with `Brightness.dark`.
- The dark theme SHALL use `ColorScheme.fromSeed` with the same seed color as the light theme.

#### Scenario: Dark theme uses Material 3

- **WHEN** `AppTheme.darkTheme` is inspected
- **THEN** its `useMaterial3` property SHALL be `true`

#### Scenario: Dark theme has correct brightness

- **WHEN** the `colorScheme` of `AppTheme.darkTheme` is inspected
- **THEN** its `brightness` SHALL be `Brightness.dark`

### Requirement: AppTheme class structure

The `AppTheme` class SHALL be declared as `abstract final class` to prevent instantiation and inheritance.

#### Scenario: AppTheme cannot be instantiated

- **WHEN** an attempt is made to instantiate `AppTheme`
- **THEN** the Dart compiler SHALL reject the code at compile time

#### Scenario: Both themes use the same seed color

- **WHEN** `AppTheme.lightTheme` and `AppTheme.darkTheme` are inspected
- **THEN** both SHALL be generated from the same seed color value
