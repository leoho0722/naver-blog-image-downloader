## REMOVED Requirements

### Requirement: Detail state properties

**Reason**: Replaced by Riverpod `Notifier<PhotoDetailState>`. `ChangeNotifier` is removed. The `SaveState` enum is replaced by `AsyncValue<void>?`.

**Migration**: Replace `ChangeNotifier` with `Notifier<PhotoDetailState>`. Replace `SaveState` enum with `AsyncValue<void>? saveOperation` field.

### Requirement: SaveState enum

**Reason**: Replaced by `AsyncValue<void>?` where `null` = idle, `AsyncLoading` = saving, `AsyncData` = saved, `AsyncError` = failed.

**Migration**: Replace `SaveState.idle` with `null`, `SaveState.saving` with `AsyncLoading()`, `SaveState.saved` with `AsyncData(null)`.

## MODIFIED Requirements

### Requirement: Load photo detail

`PhotoDetailViewModel.loadAll()` SHALL update the state with photos, blogId, and initial index via `state = state.copyWith(...)`. Metadata SHALL be loaded for the initial index and stored in the Notifier's private `_metadataCache` field (not part of the state).

#### Scenario: Load photo list

- **GIVEN** a list of photos, blogId, and initialIndex
- **WHEN** `loadAll(photos, blogId, initialIndex)` is called
- **THEN** `state.photos` SHALL contain the provided photos
- **AND** `state.blogId` SHALL be the provided blogId
- **AND** `state.currentIndex` SHALL be the provided initialIndex
- **AND** `state.saveOperation` SHALL be `null`
- **AND** metadata for the initial index SHALL be loaded into the state

### Requirement: Save to gallery

`saveToGallery()` SHALL set `state.saveOperation` to `AsyncLoading`, call `PhotoRepository.saveOneToGallery()`, and set `state.saveOperation` to `AsyncData(null)` on success or revert to `null` on failure.

#### Scenario: Save photo to gallery

- **GIVEN** the current photo has a cached file
- **WHEN** `saveToGallery()` is called
- **THEN** `state.saveOperation` SHALL transition to `AsyncLoading`
- **AND** on success, `state.saveOperation` SHALL be `AsyncData(null)`

#### Scenario: Save fails with error

- **GIVEN** `PhotoRepository.saveOneToGallery()` throws an exception
- **WHEN** `saveToGallery()` is called
- **THEN** `state.saveOperation` SHALL revert to `null` (idle)

#### Scenario: Save prevented when already saving

- **GIVEN** `state.saveOperation` is `AsyncLoading`
- **WHEN** `saveToGallery()` is called
- **THEN** the call SHALL return immediately without starting a new save

### Requirement: Metadata caching

Metadata (cached file, file size, image dimensions) SHALL be cached in a private `Map<int, _PhotoMetadata>` field on the Notifier. It SHALL NOT be part of the `PhotoDetailState`. Only the current index's metadata SHALL be exposed via state fields.

#### Scenario: Cached metadata retrieval

- **GIVEN** metadata for index 0 has been loaded
- **WHEN** `setCurrentIndex(0)` is called
- **THEN** the metadata SHALL be retrieved from cache without re-reading the file

### Requirement: Set current index

`setCurrentIndex(int index)` SHALL update `state.currentIndex`, reset `state.saveOperation` to `null`, and lazy-load metadata if not already cached.

#### Scenario: Switch to a different photo

- **GIVEN** the current index is 0
- **WHEN** `setCurrentIndex(2)` is called
- **THEN** `state.currentIndex` SHALL be `2`
- **AND** `state.saveOperation` SHALL be `null`
- **AND** metadata for index 2 SHALL be loaded if not cached

## ADDED Requirements

### Requirement: PhotoDetailState immutable class

`PhotoDetailState` SHALL be an immutable class with fields: `photos` (default `[]`), `blogId` (default `""`), `currentIndex` (default `0`), `saveOperation` (default `null`), `cachedFile` (default `null`), `fileSizeBytes` (default `null`), `imageWidth` (default `null`), `imageHeight` (default `null`). It SHALL provide `copyWith`, `isSaving`, `isSaved`, `photo`, `totalCount`, `formattedFileSize`, and `formattedDimensions` computed getters.

#### Scenario: Default PhotoDetailState

- **GIVEN** a new `PhotoDetailState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `saveOperation` SHALL be `null`
- **AND** `isSaving` SHALL be `false`
- **AND** `isSaved` SHALL be `false`

### Requirement: PhotoDetailViewModel as Notifier

`PhotoDetailViewModel` SHALL extend the generated `_$PhotoDetailViewModel` (Riverpod `Notifier<PhotoDetailState>`). `build()` SHALL return `const PhotoDetailState()`.

#### Scenario: PhotoDetailViewModel initial state

- **GIVEN** `photoDetailViewModelProvider` is first accessed
- **WHEN** `build()` is called
- **THEN** it SHALL return a `PhotoDetailState` with all default values
