# photo-gallery-viewmodel Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Operation logging in saveSelectedToGallery

`PhotoGalleryViewModel.saveSelectedToGallery()` SHALL log operation results via `ref.read(logRepositoryProvider)` after the save operation completes or fails.

On success, `saveSelectedToGallery()` SHALL call `logSaveToGallery` with the following parameters:

- `mode` -- the string `'selected'`
- `blogId` -- the blog identifier
- `photoCount` -- the number of selected photos saved

On failure (when an exception is caught), `saveSelectedToGallery()` SHALL call `logError` with the caught exception, stack trace, and context string `'saveSelectedToGallery'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful selected save logs operation

- **GIVEN** 5 photos are selected for saving
- **WHEN** `saveSelectedToGallery()` completes successfully
- **THEN** `logSaveToGallery` SHALL be called with `mode: 'selected'` and `photoCount: 5`

#### Scenario: Failed selected save logs error

- **GIVEN** the gallery save operation throws an exception
- **WHEN** the exception is caught in `saveSelectedToGallery()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior SHALL remain unchanged

---

### Requirement: Operation logging in saveAllToGallery

`PhotoGalleryViewModel.saveAllToGallery()` SHALL log operation results via `ref.read(logRepositoryProvider)` after the save operation completes or fails.

On success, `saveAllToGallery()` SHALL call `logSaveToGallery` with the following parameters:

- `mode` -- the string `'all'`
- `blogId` -- the blog identifier
- `photoCount` -- the total number of photos saved

On failure (when an exception is caught), `saveAllToGallery()` SHALL call `logError` with the caught exception, stack trace, and context string `'saveAllToGallery'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful save-all logs operation

- **GIVEN** a gallery has 20 photos
- **WHEN** `saveAllToGallery()` completes successfully
- **THEN** `logSaveToGallery` SHALL be called with `mode: 'all'` and `photoCount: 20`

#### Scenario: Failed save-all logs error

- **GIVEN** the gallery save operation throws an exception
- **WHEN** the exception is caught in `saveAllToGallery()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior SHALL remain unchanged
