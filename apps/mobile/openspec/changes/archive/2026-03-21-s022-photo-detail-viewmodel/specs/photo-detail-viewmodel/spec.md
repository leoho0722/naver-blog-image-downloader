## ADDED Requirements

### Requirement: Detail state properties

The `PhotoDetailViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts both a `CacheRepository` instance via the `required` named parameter `cacheRepository` and a `GalleryService` instance via the `required` named parameter `galleryService`.

The ViewModel SHALL expose the following read-only properties:
- `photo` (PhotoEntity?) — the currently loaded photo entity
- `blogId` (String) — the blog identifier
- `cachedFile` (File?) — the cached file for the loaded photo, or null
- `fileSizeBytes` (int?) — the file size in bytes, or null
- `imageWidth` (int?) — the image width in pixels, or null
- `imageHeight` (int?) — the image height in pixels, or null
- `isSaving` (bool) — whether a save-to-gallery operation is in progress
- `isSaved` (bool) — whether the photo has been saved to gallery
- `formattedFileSize` (String) — human-readable file size string
- `formattedDimensions` (String) — human-readable image dimensions string

#### Scenario: Initial state

- **WHEN** a new `PhotoDetailViewModel` is created
- **THEN** `photo` SHALL be `null`
- **AND** `blogId` SHALL be an empty string
- **AND** `cachedFile` SHALL be `null`
- **AND** `fileSizeBytes` SHALL be `null`
- **AND** `imageWidth` SHALL be `null`
- **AND** `imageHeight` SHALL be `null`
- **AND** `isSaving` SHALL be `false`
- **AND** `isSaved` SHALL be `false`

### Requirement: Load photo detail

The `load` method SHALL be async. It SHALL accept a `PhotoEntity` and a `String blogId`, store them, then read the cached file, determine file size, and decode image dimensions via `ui.instantiateImageCodec`.

#### Scenario: Load single photo

- **WHEN** `load` is called with a `PhotoEntity` and a `blogId`
- **THEN** `photo` SHALL hold the provided `PhotoEntity`
- **AND** `blogId` SHALL equal the provided blogId
- **AND** `cachedFile` SHALL hold the resolved cached file (or null if not found)
- **AND** `fileSizeBytes` SHALL hold the file size in bytes (or null if no file)
- **AND** `imageWidth` and `imageHeight` SHALL hold the decoded image dimensions (or null if decoding fails)
- **AND** `notifyListeners` SHALL be called

### Requirement: Save to gallery

The `saveToGallery()` method SHALL save the cached photo to the device gallery via `GalleryService`.

#### Scenario: Save photo to gallery

- **GIVEN** `cachedFile` holds a valid File
- **WHEN** `saveToGallery()` is called
- **THEN** `isSaving` SHALL be set to `true` before the save operation
- **AND** `GalleryService` SHALL be called to save the file
- **AND** `isSaved` SHALL be set to `true` after successful save
- **AND** `isSaving` SHALL be set to `false` after the operation completes
- **AND** `notifyListeners` SHALL be called
