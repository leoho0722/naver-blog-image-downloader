## MODIFIED Requirements

### Requirement: Gallery state properties

PhotoGalleryViewModel SHALL extend `ChangeNotifier` and manage the gallery interaction mode through a `GalleryMode` enum with three values: `browsing`, `selecting`, `saving`. The ViewModel SHALL NOT use separate boolean flags for select mode and saving state.

PhotoGalleryViewModel SHALL call `notifyListeners()` after every state change.

PhotoGalleryViewModel SHALL expose the following read-only properties:
- `photos` (List<PhotoEntity>) — the loaded photo list
- `blogId` (String) — the Blog identifier
- `mode` (GalleryMode) — the current gallery interaction mode
- `isSelectMode` (bool) — convenience getter, `true` when mode is `selecting` or `saving`
- `selectedIds` (Set<String>) — the set of selected photo identifiers
- `isSaving` (bool) — convenience getter, `true` when mode is `saving`
- `errorMessage` (String?) — the error message from the last failed save operation, or null

#### Scenario: Initial state

- **WHEN** a new `PhotoGalleryViewModel` is created
- **THEN** `mode` SHALL be `GalleryMode.browsing`
- **AND** `isSelectMode` SHALL be `false`
- **AND** `isSaving` SHALL be `false`
- **AND** `selectedIds` SHALL be an empty set
- **AND** `errorMessage` SHALL be `null`

### Requirement: Save selected to gallery

The `saveSelectedToGallery()` method SHALL save selected photos to the gallery and handle the `Result<void>` return value from `PhotoRepository.saveToGalleryFromCache` using a switch statement.

#### Scenario: Save selected photos succeeds

- **GIVEN** mode is `selecting` with photos selected
- **WHEN** `saveSelectedToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.ok`
- **THEN** mode SHALL transition: `selecting` → `saving` → `browsing`
- **AND** `selectedIds` SHALL be cleared

#### Scenario: Save selected photos fails

- **GIVEN** mode is `selecting` with photos selected
- **WHEN** `saveSelectedToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.error`
- **THEN** mode SHALL transition: `selecting` → `saving` → `browsing`
- **AND** `errorMessage` SHALL contain the error description

### Requirement: Save all to gallery

The `saveAllToGallery()` method SHALL save all photos to the gallery and handle the `Result<void>` return value from `PhotoRepository.saveToGalleryFromCache` using a switch statement.

#### Scenario: Save all photos succeeds

- **GIVEN** photos are loaded
- **WHEN** `saveAllToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.ok`
- **THEN** mode SHALL transition: `browsing` → `saving` → `browsing`

#### Scenario: Save all photos fails

- **GIVEN** photos are loaded
- **WHEN** `saveAllToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.error`
- **THEN** mode SHALL transition: `browsing` → `saving` → `browsing`
- **AND** `errorMessage` SHALL contain the error description
