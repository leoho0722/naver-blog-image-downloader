## ADDED Requirements

### Requirement: SaveState enum

The `PhotoDetailViewModel` file SHALL define a `SaveState` enum with three values: `idle`, `saving`, and `saved`. The ViewModel SHALL use `SaveState` instead of separate `isSaving` and `isSaved` boolean flags to represent the save operation state.

#### Scenario: SaveState enum values

- **GIVEN** the `SaveState` enum
- **WHEN** its values are inspected
- **THEN** it SHALL contain exactly `idle`, `saving`, and `saved`

### Requirement: Photo list management

The `PhotoDetailViewModel` SHALL manage a list of `PhotoEntity` objects and a current index. It SHALL expose `photos` (List<PhotoEntity>), `currentIndex` (int), and `totalCount` (int) as read-only properties.

#### Scenario: Initial list state

- **GIVEN** a newly created `PhotoDetailViewModel`
- **WHEN** its list properties are inspected
- **THEN** `photos` SHALL be an empty list
- **AND** `currentIndex` SHALL be `0`
- **AND** `totalCount` SHALL be `0`

### Requirement: Metadata caching

The `PhotoDetailViewModel` SHALL maintain a metadata cache (`Map<int, _PhotoMetadata>`) to avoid redundant I/O and image decoding when revisiting previously viewed photos. The `_PhotoMetadata` class SHALL hold `cachedFile` (File?), `fileSizeBytes` (int?), `imageWidth` (int?), and `imageHeight` (int?).

#### Scenario: Cached metadata retrieval

- **GIVEN** a photo at index N has been loaded previously
- **WHEN** `setCurrentIndex` is called with index N again
- **THEN** the ViewModel SHALL retrieve metadata from the cache
- **AND** SHALL NOT call `CacheRepository.cachedFile` again for that index

### Requirement: Set current index

The `PhotoDetailViewModel` SHALL provide a `setCurrentIndex(int index)` method. When called, it SHALL update `_currentIndex`, reset `_saveState` to `SaveState.idle`, load metadata for the new index (from cache or I/O), and call `notifyListeners()`.

#### Scenario: Switch to a different photo

- **GIVEN** a loaded ViewModel with multiple photos
- **WHEN** `setCurrentIndex` is called with a different index
- **THEN** `currentIndex` SHALL equal the new index
- **AND** `photo` SHALL return the `PhotoEntity` at the new index
- **AND** `saveState` SHALL be `SaveState.idle`
- **AND** `notifyListeners` SHALL be called

## MODIFIED Requirements

### Requirement: Detail state properties

The `PhotoDetailViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts both a `CacheRepository` instance via the `required` named parameter `cacheRepository` and a `GalleryService` instance via the `required` named parameter `galleryService`.

The ViewModel SHALL expose the following read-only properties:
- `photo` (PhotoEntity?) — the currently loaded photo entity, computed from `_photos[_currentIndex]`
- `photos` (List<PhotoEntity>) — the full photo list
- `currentIndex` (int) — the index of the currently displayed photo
- `totalCount` (int) — the total number of photos
- `blogId` (String) — the blog identifier
- `cachedFile` (File?) — the cached file for the current photo, retrieved from metadata cache
- `fileSizeBytes` (int?) — the file size in bytes for the current photo
- `imageWidth` (int?) — the image width in pixels for the current photo
- `imageHeight` (int?) — the image height in pixels for the current photo
- `saveState` (SaveState) — the current save operation state
- `formattedFileSize` (String) — human-readable file size string
- `formattedDimensions` (String) — human-readable image dimensions string

#### Scenario: Initial state

- **WHEN** a new `PhotoDetailViewModel` is created
- **THEN** `photo` SHALL be `null`
- **AND** `photos` SHALL be an empty list
- **AND** `currentIndex` SHALL be `0`
- **AND** `totalCount` SHALL be `0`
- **AND** `blogId` SHALL be an empty string
- **AND** `cachedFile` SHALL be `null`
- **AND** `saveState` SHALL be `SaveState.idle`

### Requirement: Load photo detail

The `loadAll` method SHALL be async. It SHALL accept a `List<PhotoEntity>`, a `String blogId`, and an `int initialIndex`. It SHALL store the photo list and blogId, set `_currentIndex` to `initialIndex`, then load metadata (cached file, file size, image dimensions) for the current photo via `CacheRepository` and `ui.instantiateImageCodec`, and call `notifyListeners()`.

#### Scenario: Load photo list

- **WHEN** `loadAll` is called with a list of photos, a blogId, and an initialIndex
- **THEN** `photos` SHALL hold the provided list
- **AND** `blogId` SHALL equal the provided blogId
- **AND** `currentIndex` SHALL equal the provided initialIndex
- **AND** `photo` SHALL return the `PhotoEntity` at initialIndex
- **AND** `cachedFile` SHALL hold the resolved cached file for the initial photo
- **AND** `notifyListeners` SHALL be called

### Requirement: Save to gallery

The `saveToGallery()` method SHALL save the current photo (at `_currentIndex`) to the device gallery via `GalleryService`.

#### Scenario: Save photo to gallery

- **GIVEN** `cachedFile` holds a valid File
- **WHEN** `saveToGallery()` is called
- **THEN** `saveState` SHALL transition from `idle` to `saving` before the save operation
- **AND** `GalleryService` SHALL be called to save the file
- **AND** `saveState` SHALL transition to `saved` after successful save
- **AND** `notifyListeners` SHALL be called

#### Scenario: Save prevented when already saving

- **GIVEN** `saveState` is `saving`
- **WHEN** `saveToGallery()` is called
- **THEN** the method SHALL return immediately without performing any operation

#### Scenario: Permission denied

- **GIVEN** `GalleryService.requestPermission()` returns `false`
- **WHEN** `saveToGallery()` is called
- **THEN** `saveState` SHALL return to `idle`
- **AND** `notifyListeners` SHALL be called
