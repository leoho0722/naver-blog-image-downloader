## ADDED Requirements

### Requirement: Log save to gallery

`PhotoDetailViewModel` SHALL provide a `logSaveToGallery(String blogId)` method. It SHALL call `ref.read(logRepositoryProvider).logSaveToGallery(blogId: blogId, photoCount: 1, mode: 'single')` in a fire-and-forget manner.

#### Scenario: Log save operation

- **GIVEN** a successful native save operation
- **WHEN** `logSaveToGallery("abc123")` is called
- **THEN** `LogRepository.logSaveToGallery` SHALL be called with `blogId: "abc123"`, `photoCount: 1`, `mode: "single"`

## MODIFIED Requirements

### Requirement: PhotoDetailState immutable class

`PhotoDetailState` SHALL retain fields: `photos` (default `[]`), `blogId` (default `""`), `currentIndex` (default `0`), `saveOperation` (default `null`). It SHALL add a new field `cachedFiles` (Map\<String, File?\>, default `{}`). It SHALL remove fields: `cachedFile`, `fileSizeBytes`, `imageWidth`, `imageHeight` (metadata is now read by native viewers). It SHALL retain `copyWith`, `isSaving`, `isSaved`, `photo`, `totalCount` getters. It SHALL remove `formattedFileSize` and `formattedDimensions` getters.

#### Scenario: Simplified PhotoDetailState

- **GIVEN** a new `PhotoDetailState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `cachedFiles` SHALL be an empty map
- **AND** `saveOperation` SHALL be `null`
- **AND** no `cachedFile`, `fileSizeBytes`, `imageWidth`, `imageHeight` fields SHALL exist

### Requirement: Load photo detail

`PhotoDetailViewModel.loadAll()` SHALL accept `photos`, `blogId`, `initialIndex`, and `cachedFiles` parameters. It SHALL synchronously update the state with all values via `state = state.copyWith(...)`. It SHALL NOT load metadata (no `_loadMetadataForIndex`).

#### Scenario: Load photo list with cachedFiles

- **GIVEN** a list of photos, blogId, initialIndex, and cachedFiles map
- **WHEN** `loadAll(photos, blogId, initialIndex, cachedFiles)` is called
- **THEN** `state.photos` SHALL contain the provided photos
- **AND** `state.blogId` SHALL be the provided blogId
- **AND** `state.currentIndex` SHALL be the provided initialIndex
- **AND** `state.cachedFiles` SHALL be the provided cachedFiles map

### Requirement: Set current index

`setCurrentIndex(int index)` SHALL update `state.currentIndex` and reset `state.saveOperation` to `null`. It SHALL NOT lazy-load metadata.

#### Scenario: Switch to a different photo

- **GIVEN** the current index is 0
- **WHEN** `setCurrentIndex(2)` is called
- **THEN** `state.currentIndex` SHALL be `2`
- **AND** `state.saveOperation` SHALL be `null`

## REMOVED Requirements

### Requirement: Metadata caching
**Reason**: Metadata (file size, dimensions) is now computed by native viewers directly from the file system. The private `_metadataCache` map and `_loadMetadataForIndex` method are removed.
**Migration**: Native viewers read file info via FileManager/CGImageSource (iOS) or File.length()/BitmapFactory (Android).

#### Scenario: Metadata caching removed

- **WHEN** the `PhotoDetailViewModel` source is inspected
- **THEN** no `_metadataCache` field or `_loadMetadataForIndex` method SHALL exist

### Requirement: Save to gallery
**Reason**: Save-to-gallery is now executed directly by native viewers calling `PhotoService`. The ViewModel no longer calls `PhotoRepository.saveOneToGallery()`.
**Migration**: Native ViewModel calls `PhotoService` directly. Flutter ViewModel provides `logSaveToGallery()` for logging only.

#### Scenario: ViewModel saveToGallery removed

- **WHEN** the `PhotoDetailViewModel` source is inspected
- **THEN** no `saveToGallery()` method calling `PhotoRepository` SHALL exist

### Requirement: Operation logging in saveToGallery
**Reason**: Operation logging is now triggered by the `onSaveCompleted` callback from native, handled in `PhotoDetailView` which calls `viewModel.logSaveToGallery()`.
**Migration**: `PhotoDetailView`'s callback handler calls `viewModel.logSaveToGallery(blogId)`.

#### Scenario: ViewModel logging decoupled from save

- **WHEN** `logSaveToGallery` is called
- **THEN** it SHALL only log to `LogRepository` without performing any save operation
