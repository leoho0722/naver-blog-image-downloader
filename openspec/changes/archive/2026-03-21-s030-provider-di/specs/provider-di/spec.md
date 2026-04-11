## ADDED Requirements

### Requirement: Service providers registered

The `lib/main.dart` file SHALL register the following services using `Provider` within a `MultiProvider`:

- `ApiService` SHALL be created with no arguments (uses Amplify config).
- `FileDownloadService` SHALL be created with a positional `Dio()` argument (i.e., `FileDownloadService(Dio())`).
- `GalleryService` SHALL be created with no arguments.

#### Scenario: ApiService created with no arguments

- **WHEN** the `MultiProvider` initializes the `ApiService`
- **THEN** it SHALL create `ApiService()` with no constructor arguments (uses Amplify config)

#### Scenario: All three services are available in the widget tree

- **WHEN** a descendant widget calls `context.read<ApiService>()`
- **THEN** it SHALL receive a valid `ApiService` instance
- **AND** `context.read<FileDownloadService>()` SHALL return a valid instance
- **AND** `context.read<GalleryService>()` SHALL return a valid instance

### Requirement: Repository providers registered

The `lib/main.dart` file SHALL register repositories within the `MultiProvider`:

- `CacheRepository` SHALL be registered using `Provider`.
- `PhotoRepository` SHALL be registered using `ProxyProvider4`, injecting `ApiService`, `FileDownloadService`, `GalleryService`, and `CacheRepository` as dependencies.

#### Scenario: CacheRepository is available

- **WHEN** a descendant widget calls `context.read<CacheRepository>()`
- **THEN** it SHALL receive a valid `CacheRepository` instance

#### Scenario: PhotoRepository receives all four dependencies

- **WHEN** the `ProxyProvider4` creates the `PhotoRepository`
- **THEN** it SHALL inject `ApiService`, `FileDownloadService`, `GalleryService`, and `CacheRepository`

### Requirement: ViewModel providers registered

The `lib/main.dart` file SHALL register the following ViewModels as `ChangeNotifier` providers:

- `BlogInputViewModel` SHALL be registered using `ChangeNotifierProxyProvider` with `PhotoRepository` as its dependency.
- `DownloadViewModel` SHALL be registered using `ChangeNotifierProxyProvider` with `PhotoRepository` as its dependency.
- `PhotoGalleryViewModel` SHALL be registered using `ChangeNotifierProxyProvider2` with `PhotoRepository` and `CacheRepository` as its dependencies.
- `PhotoDetailViewModel` SHALL be registered using `ChangeNotifierProxyProvider2` with `CacheRepository` and `GalleryService` as its dependencies.
- `SettingsViewModel` SHALL be registered using `ChangeNotifierProxyProvider` with `CacheRepository` as its dependency.

#### Scenario: BlogInputViewModel depends on PhotoRepository

- **WHEN** the `ChangeNotifierProxyProvider` for `BlogInputViewModel` is configured
- **THEN** it SHALL receive `PhotoRepository` via the `update` callback

#### Scenario: PhotoGalleryViewModel depends on two repositories

- **WHEN** the `ChangeNotifierProxyProvider2` for `PhotoGalleryViewModel` is configured
- **THEN** it SHALL receive both `PhotoRepository` and `CacheRepository`

#### Scenario: PhotoDetailViewModel depends on CacheRepository and GalleryService

- **WHEN** the `ChangeNotifierProxyProvider2` for `PhotoDetailViewModel` is configured
- **THEN** it SHALL receive both `CacheRepository` and `GalleryService`

#### Scenario: All ViewModels are accessible

- **WHEN** a descendant widget calls `context.watch<BlogInputViewModel>()`
- **THEN** it SHALL receive a valid `BlogInputViewModel` instance
- **AND** all other ViewModels SHALL be accessible via their respective types

### Requirement: NaverPhotoApp widget defined

The file `lib/app.dart` SHALL define a `NaverPhotoApp` class that extends `StatelessWidget`.

- The `build` method SHALL return a `MaterialApp.router`.
- The `routerConfig` property SHALL be set to the `appRouter` instance from `lib/routing/app_router.dart`.
- The `theme` property SHALL be set to `AppTheme.lightTheme`.
- The `darkTheme` property SHALL be set to `AppTheme.darkTheme`.

#### Scenario: NaverPhotoApp uses MaterialApp.router

- **WHEN** `NaverPhotoApp.build()` is invoked
- **THEN** it SHALL return a `MaterialApp.router` widget

#### Scenario: NaverPhotoApp integrates GoRouter

- **WHEN** the `MaterialApp.router` is configured
- **THEN** its `routerConfig` SHALL reference the `appRouter` instance

#### Scenario: NaverPhotoApp applies both themes

- **WHEN** the `MaterialApp.router` is configured
- **THEN** its `theme` SHALL be `AppTheme.lightTheme`
- **AND** its `darkTheme` SHALL be `AppTheme.darkTheme`

### Requirement: main function defined

The file `lib/main.dart` SHALL define a `main()` function that calls `runApp()` with a `MultiProvider` wrapping `NaverPhotoApp` as its child.

#### Scenario: App launches with MultiProvider

- **WHEN** `main()` is executed
- **THEN** `runApp()` SHALL be called with a `MultiProvider` widget
- **AND** the `MultiProvider.child` SHALL be `const NaverPhotoApp()`

#### Scenario: Provider registration order

- **WHEN** the `MultiProvider.providers` list is inspected
- **THEN** Service providers SHALL appear before Repository providers
- **AND** Repository providers SHALL appear before ViewModel providers
