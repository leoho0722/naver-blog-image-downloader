# photo-detail-viewmodel Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Operation logging in saveToGallery

`PhotoDetailViewModel.saveToGallery()` SHALL log the operation result via `ref.read(logRepositoryProvider)` after the save operation completes successfully.

On success, `saveToGallery()` SHALL call `logSaveToGallery` with the following parameters:

- `mode` -- the string `'single'`
- `blogId` -- the blog identifier from the current state
- `photoCount` -- the integer `1`

On failure (when an exception is caught), `saveToGallery()` SHALL call `logError` with the caught exception, stack trace, and context string `'saveToGallery'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful single save logs operation

- **GIVEN** the current photo has a cached file
- **WHEN** `saveToGallery()` completes successfully
- **THEN** `logSaveToGallery` SHALL be called with `mode: 'single'` and `photoCount: 1`

#### Scenario: Failed single save logs error

- **GIVEN** `PhotoRepository.saveOneToGallery()` throws an exception
- **WHEN** the exception is caught in `saveToGallery()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior (reverting `saveOperation` to `null`) SHALL remain unchanged

#### Scenario: Log failure does not affect save result

- **GIVEN** `logSaveToGallery` throws an exception internally
- **WHEN** `saveToGallery()` completes successfully
- **THEN** `state.saveOperation` SHALL still be `AsyncData(null)`
- **AND** no error SHALL be surfaced to the user
