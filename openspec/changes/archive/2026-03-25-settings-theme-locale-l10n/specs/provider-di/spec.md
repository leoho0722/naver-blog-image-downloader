## MODIFIED Requirements

### Requirement: Service providers registered

The `lib/main.dart` file SHALL register the following services using `Provider` within a `MultiProvider`:

- `ApiService` SHALL be created with no arguments (uses Amplify config).
- `FileDownloadService` SHALL be created with a positional `Dio()` argument (i.e., `FileDownloadService(Dio())`).
- `GalleryService` SHALL be created with no arguments.
- `LocalStorageService` SHALL be created with a `SharedPreferences` instance obtained via `await SharedPreferences.getInstance()` before `runApp`.

#### Scenario: ApiService created with no arguments

- **WHEN** the `MultiProvider` initializes the `ApiService`
- **THEN** it SHALL create `ApiService()` with no constructor arguments (uses Amplify config)

#### Scenario: All four services are available in the widget tree

- **WHEN** a descendant widget calls `context.read<ApiService>()`
- **THEN** it SHALL receive a valid `ApiService` instance
- **AND** `context.read<FileDownloadService>()` SHALL return a valid instance
- **AND** `context.read<GalleryService>()` SHALL return a valid instance
- **AND** `context.read<LocalStorageService>()` SHALL return a valid instance

### Requirement: Repository providers registered

The `lib/main.dart` file SHALL register repositories within the `MultiProvider`:

- `CacheRepository` SHALL be registered using `Provider`.
- `PhotoRepository` SHALL be registered using `ProxyProvider4`, injecting `ApiService`, `FileDownloadService`, `GalleryService`, and `CacheRepository` as dependencies.
- `SettingsRepository` SHALL be registered using `Provider`, injecting `LocalStorageService` via `context.read<LocalStorageService>()`.

#### Scenario: CacheRepository is available

- **WHEN** a descendant widget calls `context.read<CacheRepository>()`
- **THEN** it SHALL receive a valid `CacheRepository` instance

#### Scenario: PhotoRepository receives all four dependencies

- **WHEN** the `ProxyProvider4` creates the `PhotoRepository`
- **THEN** it SHALL inject `ApiService`, `FileDownloadService`, `GalleryService`, and `CacheRepository`

#### Scenario: SettingsRepository receives LocalStorageService

- **WHEN** the `Provider` creates the `SettingsRepository`
- **THEN** it SHALL inject `LocalStorageService` obtained from the widget tree

### Requirement: NaverPhotoApp widget defined

The file `lib/app.dart` SHALL define a `NaverPhotoApp` class that extends `StatelessWidget`.

- The `build` method SHALL return a `MaterialApp.router`.
- The `routerConfig` property SHALL be set to the `appRouter` instance from `lib/routing/app_router.dart`.
- The `theme` property SHALL be set to `AppTheme.lightTheme`.
- The `darkTheme` property SHALL be set to `AppTheme.darkTheme`.
- The `themeMode` property SHALL be set to `AppSettingsViewModel.themeMode` obtained via `context.watch<AppSettingsViewModel>()`.
- The `locale` property SHALL be set to `AppSettingsViewModel.locale?.locale` (null means follow system).
- The `localizationsDelegates` property SHALL be set to `AppLocalizations.localizationsDelegates`.
- The `supportedLocales` property SHALL be set to `AppLocalizations.supportedLocales`.

#### Scenario: NaverPhotoApp uses MaterialApp.router

- **WHEN** `NaverPhotoApp.build()` is invoked
- **THEN** it SHALL return a `MaterialApp.router` widget

#### Scenario: NaverPhotoApp integrates GoRouter

- **WHEN** the `MaterialApp.router` is configured
- **THEN** its `routerConfig` SHALL reference the `appRouter` instance

#### Scenario: NaverPhotoApp applies both themes with themeMode

- **WHEN** the `MaterialApp.router` is configured
- **THEN** its `theme` SHALL be `AppTheme.lightTheme`
- **AND** its `darkTheme` SHALL be `AppTheme.darkTheme`
- **AND** its `themeMode` SHALL be sourced from `AppSettingsViewModel.themeMode`

#### Scenario: NaverPhotoApp configures localization

- **WHEN** the `MaterialApp.router` is configured
- **THEN** its `localizationsDelegates` SHALL be `AppLocalizations.localizationsDelegates`
- **AND** its `supportedLocales` SHALL be `AppLocalizations.supportedLocales`
- **AND** its `locale` SHALL be sourced from `AppSettingsViewModel.locale?.locale`

## ADDED Requirements

### Requirement: AppSettingsViewModel provider registered

The `MultiProvider` in `main.dart` SHALL register `AppSettingsViewModel` via `ChangeNotifierProvider` as the first ViewModel provider, injecting `SettingsRepository` via `context.read<SettingsRepository>()`. The `create` callback SHALL call `loadSettings()` on the newly created instance.

#### Scenario: AppSettingsViewModel DI wiring

- **GIVEN** the application starts
- **WHEN** `AppSettingsViewModel` is created via `ChangeNotifierProvider`
- **THEN** the constructor SHALL receive `SettingsRepository`
- **AND** `loadSettings()` SHALL be called immediately after creation

#### Scenario: AppSettingsViewModel is first ViewModel provider

- **WHEN** the `MultiProvider.providers` list is inspected
- **THEN** `AppSettingsViewModel` SHALL appear before all other `ChangeNotifierProvider` entries

### Requirement: SharedPreferences eagerly initialized

The `main()` function SHALL call `await SharedPreferences.getInstance()` before `runApp` and pass the result to `LocalStorageService`.

#### Scenario: SharedPreferences available before runApp

- **WHEN** `main()` executes
- **THEN** `SharedPreferences.getInstance()` SHALL complete before `runApp` is called
