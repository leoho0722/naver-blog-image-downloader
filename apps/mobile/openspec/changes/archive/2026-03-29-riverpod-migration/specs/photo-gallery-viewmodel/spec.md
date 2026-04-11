## REMOVED Requirements

### Requirement: Gallery state properties

**Reason**: Replaced by Riverpod `Notifier<PhotoGalleryState>`. `ChangeNotifier` is removed. The `GalleryMode` enum and `GallerySaveErrorType` enum are removed.

**Migration**: Replace `ChangeNotifier` with `Notifier<PhotoGalleryState>`. Replace `GalleryMode` with `bool isSelectMode` + `AsyncValue<void>? saveOperation`. Replace `GallerySaveErrorType` with `AsyncError`.

### Requirement: Toggle selection mode

**Reason**: The `GalleryMode` enum is removed. Selection mode is now a `bool isSelectMode` field.

**Migration**: `toggleSelectMode()` SHALL toggle `state.isSelectMode` boolean instead of switching `GalleryMode` enum values.

## MODIFIED Requirements

### Requirement: Load photo list

`PhotoGalleryViewModel.load()` SHALL update the state with photos, blogId, and pre-fetched cached files via `state = state.copyWith(...)`.

#### Scenario: Successful load

- **GIVEN** a list of photos and a blogId
- **WHEN** `load(photos, blogId)` is called
- **THEN** `state.photos` SHALL contain the provided photos
- **AND** `state.blogId` SHALL be the provided blogId
- **AND** `state.cachedFiles` SHALL be populated with cached file references for each photo

### Requirement: Select or deselect photo

`toggleSelection(String photoId)` SHALL add or remove the photoId from `state.selectedIds` by creating a new `Set` instance.

#### Scenario: Select photo

- **GIVEN** `state.selectedIds` does not contain `"photo_1"`
- **WHEN** `toggleSelection("photo_1")` is called
- **THEN** `state.selectedIds` SHALL contain `"photo_1"`

#### Scenario: Deselect selected photo

- **GIVEN** `state.selectedIds` contains `"photo_1"`
- **WHEN** `toggleSelection("photo_1")` is called
- **THEN** `state.selectedIds` SHALL NOT contain `"photo_1"`

### Requirement: Save selected photos to gallery

`saveSelectedToGallery()` SHALL set `state.saveOperation` to `AsyncLoading`, call `PhotoRepository.saveToGalleryFromCache()`, and set `state.saveOperation` to `AsyncData(null)` on success or `AsyncError` on failure.

#### Scenario: Successful save

- **GIVEN** photos are selected and cached
- **WHEN** `saveSelectedToGallery()` is called
- **THEN** `state.saveOperation` SHALL transition to `AsyncLoading`
- **AND** on success, `state.saveOperation` SHALL be `AsyncData(null)`
- **AND** `state.selectedIds` SHALL be cleared
- **AND** `state.isSelectMode` SHALL be `false`

#### Scenario: Save failure

- **GIVEN** `PhotoRepository.saveToGalleryFromCache()` throws an exception
- **WHEN** `saveSelectedToGallery()` is called
- **THEN** `state.saveOperation` SHALL be `AsyncError` containing the exception
- **AND** `state.isSelectMode` SHALL be `false`

## ADDED Requirements

### Requirement: PhotoGalleryState immutable class

`PhotoGalleryState` SHALL be an immutable class with fields: `photos` (default `[]`), `blogId` (default `""`), `cachedFiles` (default `{}`), `selectedIds` (default `{}`), `isSelectMode` (default `false`), `saveOperation` (default `null`). It SHALL provide `copyWith` and `isSaving` computed getter.

#### Scenario: Default PhotoGalleryState

- **GIVEN** a new `PhotoGalleryState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `isSelectMode` SHALL be `false`
- **AND** `saveOperation` SHALL be `null`
- **AND** `isSaving` SHALL be `false`

### Requirement: PhotoGalleryViewModel as Notifier

`PhotoGalleryViewModel` SHALL extend the generated `_$PhotoGalleryViewModel` (Riverpod `Notifier<PhotoGalleryState>`). `build()` SHALL return `const PhotoGalleryState()`.

#### Scenario: Toggle select mode

- **GIVEN** `state.isSelectMode` is `false`
- **WHEN** `toggleSelectMode()` is called
- **THEN** `state.isSelectMode` SHALL be `true`

#### Scenario: Exit select mode clears selections

- **GIVEN** `state.isSelectMode` is `true` with selected photos
- **WHEN** `toggleSelectMode()` is called
- **THEN** `state.isSelectMode` SHALL be `false`
- **AND** `state.selectedIds` SHALL be empty
