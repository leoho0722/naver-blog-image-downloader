## ADDED Requirements

### Requirement: ProviderScope at app root

The `main()` function SHALL wrap `NaverPhotoApp` with `ProviderScope` from `flutter_riverpod`. `SharedPreferences` SHALL be passed via `sharedPreferencesProvider.overrideWithValue(prefs)`.

#### Scenario: App launches with ProviderScope

- **GIVEN** the application starts
- **WHEN** `main()` is executed
- **THEN** `runApp()` SHALL be called with a `ProviderScope` widget
- **AND** `sharedPreferencesProvider` SHALL be overridden with the pre-initialized `SharedPreferences` instance
- **AND** the `ProviderScope.child` SHALL be `const NaverPhotoApp()`

---

### Requirement: Service providers with keepAlive

All service providers SHALL be defined using `@Riverpod(keepAlive: true)` annotation as top-level functions co-located in each service file.

- `apiServiceProvider` SHALL create `ApiService()` with no arguments.
- `fileDownloadServiceProvider` SHALL create `FileDownloadService(Dio())`.
- `galleryServiceProvider` SHALL create `GalleryService()` with no arguments.
- `sharedPreferencesProvider` SHALL throw `UnimplementedError` (overridden at runtime).
- `localStorageServiceProvider` SHALL create `LocalStorageService` with `ref.watch(sharedPreferencesProvider)`.

#### Scenario: All service providers available

- **GIVEN** the app is running with `ProviderScope`
- **WHEN** a consumer calls `ref.read(apiServiceProvider)`
- **THEN** it SHALL receive a valid `ApiService` instance
- **AND** `ref.read(fileDownloadServiceProvider)` SHALL return a valid instance
- **AND** `ref.read(galleryServiceProvider)` SHALL return a valid instance
- **AND** `ref.read(localStorageServiceProvider)` SHALL return a valid instance

#### Scenario: Service providers are keepAlive

- **GIVEN** the app is running
- **WHEN** no widget is watching a service provider
- **THEN** the service provider SHALL NOT be disposed (keepAlive behavior)

---

### Requirement: Repository providers with keepAlive

All repository providers SHALL be defined using `@Riverpod(keepAlive: true)` annotation co-located in each repository file. Dependencies SHALL be resolved via `ref.watch`.

- `cacheRepositoryProvider` SHALL create `CacheRepository()`.
- `settingsRepositoryProvider` SHALL create `SettingsRepository` with `ref.watch(localStorageServiceProvider)`.
- `photoRepositoryProvider` SHALL create `PhotoRepository` with `ref.watch(apiServiceProvider)`, `ref.watch(fileDownloadServiceProvider)`, `ref.watch(galleryServiceProvider)`, and `ref.watch(cacheRepositoryProvider)`.

#### Scenario: PhotoRepository receives all dependencies

- **GIVEN** the app is running with `ProviderScope`
- **WHEN** `photoRepositoryProvider` is first accessed
- **THEN** it SHALL inject `ApiService`, `FileDownloadService`, `GalleryService`, and `CacheRepository` via `ref.watch`

#### Scenario: Repository providers are keepAlive

- **GIVEN** the app is running
- **WHEN** no widget is watching a repository provider
- **THEN** the repository provider SHALL NOT be disposed

---

### Requirement: ViewModel providers with code generation

All ViewModel providers SHALL be defined using `@riverpod` or `@Riverpod(keepAlive: true)` annotation on the ViewModel class.

- `AppSettingsViewModel` SHALL use `@Riverpod(keepAlive: true)` and extend the generated `_$AppSettingsViewModel` base class.
- `BlogInputViewModel`, `DownloadViewModel`, `PhotoGalleryViewModel`, `PhotoDetailViewModel`, `SettingsViewModel` SHALL use `@riverpod` (auto-dispose) and extend their respective generated base classes.

#### Scenario: AppSettingsViewModel is keepAlive

- **GIVEN** the app navigates away from all screens
- **WHEN** no widget watches `appSettingsViewModelProvider`
- **THEN** the provider SHALL NOT be disposed (keepAlive for MaterialApp theme/locale)

#### Scenario: Feature ViewModels auto-dispose

- **GIVEN** a user navigates to a screen that watches `blogInputViewModelProvider`
- **WHEN** the user navigates away and no widget watches the provider
- **THEN** the provider SHALL be automatically disposed

---

### Requirement: NaverPhotoApp as ConsumerWidget

`NaverPhotoApp` SHALL extend `ConsumerWidget` and use `ref.watch(appSettingsViewModelProvider)` to reactively access theme mode and locale.

#### Scenario: NaverPhotoApp uses ConsumerWidget

- **WHEN** `NaverPhotoApp.build()` is invoked
- **THEN** it SHALL use `ref.watch(appSettingsViewModelProvider)` to obtain `AsyncValue<AppSettingsState>`
- **AND** SHALL use `AsyncValue.when()` to handle loading, error, and data states
- **AND** the `data` branch SHALL configure `MaterialApp.router` with `themeMode` and `locale` from `AppSettingsState`

---

### Requirement: Provider registration order

Service providers SHALL be defined in service files, repository providers in repository files, and ViewModel providers in ViewModel files. There SHALL be no centralized provider registration file.

#### Scenario: Provider co-location

- **GIVEN** a developer inspects the codebase
- **WHEN** looking for `apiServiceProvider`
- **THEN** it SHALL be defined in `lib/data/services/api_service.dart`
- **AND** its generated code SHALL be in `api_service.g.dart`
