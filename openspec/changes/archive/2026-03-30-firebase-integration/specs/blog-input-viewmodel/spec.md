# blog-input-viewmodel Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Operation logging in fetchPhotos

`BlogInputViewModel.fetchPhotos()` SHALL log operation results via `ref.read(logRepositoryProvider)` after each fetch attempt completes.

On success (when `FetchResult` is obtained), `fetchPhotos()` SHALL call `logFetchPhotos` with the following parameters:

- `blogUrl` -- the input blog URL
- `blogId` -- the computed blog identifier
- `resultCount` -- the number of photo URLs returned by the API
- `isFromCache` -- whether the result was served from local cache
- `totalImages` -- the total number of images in the fetch result
- `failureDownloads` -- the number of failed image downloads (if any)
- `durationMs` -- the elapsed time of the fetch operation in milliseconds

On failure (when an exception is caught), `fetchPhotos()` SHALL:

1. Call `logFetchPhotosError` with the `blogUrl` and the error message
2. Call `logError` with the caught exception, stack trace, and context string `'fetchPhotos'`

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful fetch logs operation data

- **GIVEN** a valid Naver blog URL is provided
- **WHEN** `fetchPhotos()` completes successfully with a `FetchResult` containing 15 photos
- **THEN** `logFetchPhotos` SHALL be called with `resultCount: 15` and the computed `blogId`
- **AND** `durationMs` SHALL reflect the actual elapsed time

#### Scenario: Failed fetch logs error details

- **GIVEN** the API returns an error during `fetchPhotos()`
- **WHEN** the exception is caught
- **THEN** `logFetchPhotosError` SHALL be called with the blog URL and error message
- **AND** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior (setting `errorMessage`) SHALL remain unchanged

#### Scenario: Log failure does not affect fetch result

- **GIVEN** `logFetchPhotos` throws an exception internally
- **WHEN** `fetchPhotos()` completes successfully
- **THEN** the `FetchResult` SHALL still be stored in state
- **AND** no error SHALL be surfaced to the user
