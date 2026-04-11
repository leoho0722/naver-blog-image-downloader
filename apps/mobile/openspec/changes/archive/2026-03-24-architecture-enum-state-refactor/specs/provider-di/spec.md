## MODIFIED Requirements

### Requirement: ViewModel providers registered

The `MultiProvider` in `main.dart` SHALL register `PhotoDetailViewModel` with the following dependencies:
- `cacheRepository`: obtained via `context.read<CacheRepository>()`
- `photoRepository`: obtained via `context.read<PhotoRepository>()`

The `PhotoDetailViewModel` provider SHALL NOT inject `GalleryService` directly. Gallery operations SHALL be delegated through `PhotoRepository`.

#### Scenario: PhotoDetailViewModel DI wiring

- **GIVEN** the application starts
- **WHEN** `PhotoDetailViewModel` is created via `ChangeNotifierProvider`
- **THEN** the constructor SHALL receive `PhotoRepository` and `CacheRepository`
- **AND** SHALL NOT receive `GalleryService`
