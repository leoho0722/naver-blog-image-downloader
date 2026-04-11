## MODIFIED Requirements

### Requirement: Detail state properties

The `PhotoDetailViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts a `CacheRepository` instance via the `required` named parameter `cacheRepository` and a `PhotoRepository` instance via the `required` named parameter `photoRepository`.

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

### Requirement: Save to gallery

The `saveToGallery()` method SHALL save the current photo (at `_currentIndex`) to the device gallery via `PhotoRepository.saveOneToGallery`.

#### Scenario: Save photo to gallery

- **GIVEN** `cachedFile` holds a valid File
- **WHEN** `saveToGallery()` is called
- **THEN** `saveState` SHALL transition from `idle` to `saving` before the save operation
- **AND** `PhotoRepository.saveOneToGallery` SHALL be called with the file path
- **AND** on `Result.ok`, `saveState` SHALL transition to `saved`
- **AND** `notifyListeners` SHALL be called

#### Scenario: Save fails with error

- **GIVEN** `cachedFile` holds a valid File
- **AND** `PhotoRepository.saveOneToGallery` returns `Result.error`
- **WHEN** `saveToGallery()` is called
- **THEN** `saveState` SHALL return to `idle`
- **AND** `notifyListeners` SHALL be called

#### Scenario: Save prevented when already saving

- **GIVEN** `saveState` is `saving`
- **WHEN** `saveToGallery()` is called
- **THEN** the method SHALL return immediately without performing any operation

#### Scenario: Permission denied

- **GIVEN** `PhotoRepository.saveOneToGallery` returns `Result.error` with permission denial
- **WHEN** `saveToGallery()` is called
- **THEN** `saveState` SHALL return to `idle`
- **AND** `notifyListeners` SHALL be called
