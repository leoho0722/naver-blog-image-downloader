## MODIFIED Requirements

### Requirement: ViewModel providers registered

The `lib/main.dart` file SHALL register the following ViewModels using `ChangeNotifierProvider` within the `MultiProvider`:

- `BlogInputViewModel` SHALL be created via `ChangeNotifierProvider` with `PhotoRepository` injected via `context.read`.
- `DownloadViewModel` SHALL be created via `ChangeNotifierProvider` with `PhotoRepository` injected via `context.read`.
- `PhotoGalleryViewModel` SHALL be created via `ChangeNotifierProvider` with `PhotoRepository` and `CacheRepository` injected via `context.read`.
- `PhotoDetailViewModel` SHALL be created via `ChangeNotifierProvider` with `CacheRepository` and `GalleryService` injected via `context.read`.
- `SettingsViewModel` SHALL be created via `ChangeNotifierProvider` with `CacheRepository` injected via `context.read`.

`ChangeNotifierProxyProvider` SHALL NOT be used for ViewModel registration when the `update` callback does not modify the ViewModel instance.

#### Scenario: ViewModels use ChangeNotifierProvider

- **WHEN** the MultiProvider initializes the ViewModel providers
- **THEN** all five ViewModels SHALL use `ChangeNotifierProvider`, NOT `ChangeNotifierProxyProvider`

#### Scenario: ViewModels receive dependencies via context.read

- **WHEN** a ViewModel is created in the `create` callback
- **THEN** dependencies SHALL be obtained via `context.read<T>()` in the constructor
