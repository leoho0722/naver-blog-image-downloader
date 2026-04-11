## MODIFIED Requirements

### Requirement: AppSettingsViewModel constructor

`AppSettingsViewModel` SHALL extend the generated `_$AppSettingsViewModel` base class (Riverpod `AsyncNotifier`). It SHALL NOT extend `ChangeNotifier`. Dependencies SHALL be accessed via `ref.read` instead of constructor injection.

#### Scenario: AppSettingsViewModel created via Riverpod

- **GIVEN** the app is running with `ProviderScope`
- **WHEN** `appSettingsViewModelProvider` is first accessed
- **THEN** `AppSettingsViewModel` SHALL be created as an `AsyncNotifier`
- **AND** SHALL access `SettingsRepository` via `ref.read(settingsRepositoryProvider)`

### Requirement: AppSettingsViewModel state properties

`AppSettingsViewModel` SHALL expose its state as `AsyncValue<AppSettingsState>`. `AppSettingsState` SHALL be an immutable class with `themeMode` (default `ThemeMode.system`) and `locale` (default `null`).

#### Scenario: Initial state

- **GIVEN** `AppSettingsViewModel` has not yet completed initialization
- **WHEN** `appSettingsViewModelProvider` is watched
- **THEN** it SHALL return `AsyncLoading`

### Requirement: Load settings

`AppSettingsViewModel.build()` SHALL asynchronously load theme mode and locale from `SettingsRepository` and return an `AppSettingsState`. There SHALL be no separate `loadSettings()` method.

#### Scenario: Load persisted settings

- **GIVEN** `SettingsRepository` has persisted theme `dark` and locale `en`
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(AppSettingsState(themeMode: ThemeMode.dark, locale: SupportedLocale.en))`

#### Scenario: Repository returns default values

- **GIVEN** `SettingsRepository` has no persisted values
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(AppSettingsState(themeMode: ThemeMode.system, locale: null))`

### Requirement: Set theme mode

`setThemeMode(ThemeMode mode)` SHALL optimistically update the state to `AsyncData` with the new theme mode, then persist via `SettingsRepository`.

#### Scenario: Switch to dark mode

- **GIVEN** the current state is `AsyncData(AppSettingsState(themeMode: ThemeMode.system))`
- **WHEN** `setThemeMode(ThemeMode.dark)` is called
- **THEN** the state SHALL immediately become `AsyncData(AppSettingsState(themeMode: ThemeMode.dark))`
- **AND** `SettingsRepository.saveThemeMode(ThemeMode.dark)` SHALL be called

### Requirement: Set locale

`setLocale(SupportedLocale locale)` SHALL optimistically update the state to `AsyncData` with the new locale, then persist via `SettingsRepository`.

#### Scenario: Switch to English

- **GIVEN** the current state has `locale: null`
- **WHEN** `setLocale(SupportedLocale.en)` is called
- **THEN** the state SHALL immediately become `AsyncData` with `locale: SupportedLocale.en`
- **AND** `SettingsRepository.saveLocale(SupportedLocale.en)` SHALL be called
