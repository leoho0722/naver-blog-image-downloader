## ADDED Requirements

### Requirement: Gallery state properties

The `PhotoGalleryViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts both a `PhotoRepository` instance and a `CacheRepository` instance via `required` named parameters.

The ViewModel SHALL expose the following read-only properties:
- `photos` (List\<PhotoEntity\>) — the loaded photo list
- `blogId` (String) — the blog identifier
- `selectedIds` (Set\<String\>) — the set of selected photo IDs
- `isSelectMode` (bool) — whether select mode is active
- `isSaving` (bool) — whether a save-to-gallery operation is in progress

#### Scenario: Initial state

- **WHEN** a new `PhotoGalleryViewModel` is created
- **THEN** `photos` SHALL be an empty list
- **AND** `blogId` SHALL be an empty string
- **AND** `selectedIds` SHALL be an empty set
- **AND** `isSelectMode` SHALL be `false`
- **AND** `isSaving` SHALL be `false`

### Requirement: Load photos

The `load` method SHALL accept a `List<PhotoEntity>` and a `String blogId`, storing them for display and subsequent operations.

#### Scenario: Load photo list

- **WHEN** `load` is called with a list of photos and a blogId
- **THEN** `photos` SHALL contain all provided `PhotoEntity` objects
- **AND** `blogId` SHALL equal the provided blogId
- **AND** `notifyListeners` SHALL be called

### Requirement: Toggle select mode

The `toggleSelectMode` method SHALL toggle the `isSelectMode` flag and clear selections when exiting select mode.

#### Scenario: Enter select mode

- **GIVEN** `isSelectMode` is `false`
- **WHEN** `toggleSelectMode()` is called
- **THEN** `isSelectMode` SHALL be `true`
- **AND** `notifyListeners` SHALL be called

#### Scenario: Exit select mode

- **GIVEN** `isSelectMode` is `true`
- **WHEN** `toggleSelectMode()` is called
- **THEN** `isSelectMode` SHALL be `false`
- **AND** `selectedIds` SHALL be empty
- **AND** `notifyListeners` SHALL be called

### Requirement: Toggle selection

The `toggleSelection` method SHALL add or remove a photoId from the selected set.

#### Scenario: Select a photo

- **GIVEN** a photoId is NOT in `selectedIds`
- **WHEN** `toggleSelection(photoId)` is called
- **THEN** `selectedIds` SHALL contain the photoId
- **AND** `notifyListeners` SHALL be called

#### Scenario: Deselect a photo

- **GIVEN** a photoId IS in `selectedIds`
- **WHEN** `toggleSelection(photoId)` is called
- **THEN** `selectedIds` SHALL NOT contain the photoId
- **AND** `notifyListeners` SHALL be called

### Requirement: Select all

The `selectAll` method SHALL select all photos if not all are selected, or deselect all if all are already selected.

#### Scenario: Select all when not all selected

- **GIVEN** `selectedIds` does not contain all photo IDs
- **WHEN** `selectAll()` is called
- **THEN** `selectedIds` SHALL contain every photo's ID from the `photos` list
- **AND** `notifyListeners` SHALL be called

#### Scenario: Deselect all when all selected

- **GIVEN** `selectedIds` contains all photo IDs
- **WHEN** `selectAll()` is called
- **THEN** `selectedIds` SHALL be empty
- **AND** `notifyListeners` SHALL be called

### Requirement: Save selected to gallery

The `saveSelectedToGallery` method SHALL save only the selected photos to the device gallery via `PhotoRepository.saveToGalleryFromCache`.

#### Scenario: Save selected photos

- **GIVEN** `selectedIds` contains one or more photo IDs
- **WHEN** `saveSelectedToGallery()` is called
- **THEN** `isSaving` SHALL be set to `true` before the save operation
- **AND** `PhotoRepository.saveToGalleryFromCache` SHALL be called for each selected photo
- **AND** `isSaving` SHALL be set to `false` after the operation completes
- **AND** `notifyListeners` SHALL be called

### Requirement: Save all to gallery

The `saveAllToGallery` method SHALL save all photos in the list to the device gallery via `PhotoRepository.saveToGalleryFromCache`.

#### Scenario: Save all photos

- **WHEN** `saveAllToGallery()` is called
- **THEN** `isSaving` SHALL be set to `true` before the save operation
- **AND** `PhotoRepository.saveToGalleryFromCache` SHALL be called for every photo in `photos`
- **AND** `isSaving` SHALL be set to `false` after the operation completes
- **AND** `notifyListeners` SHALL be called

### Requirement: Cached file access

The `cachedFile` method SHALL delegate to `CacheRepository.cachedFile` to retrieve the local cached file for a given photo.

#### Scenario: Retrieve cached file

- **GIVEN** a `PhotoEntity` and the current `blogId`
- **WHEN** `cachedFile(photo)` is called
- **THEN** the method SHALL return the `Future<File?>` from `CacheRepository.cachedFile`
