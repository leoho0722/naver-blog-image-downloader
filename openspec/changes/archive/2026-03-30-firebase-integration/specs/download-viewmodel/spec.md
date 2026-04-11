# download-viewmodel Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Operation logging in startDownload

`DownloadViewModel.startDownload()` SHALL log operation results via `ref.read(logRepositoryProvider)` after the download batch completes or fails.

On success (when `DownloadBatchResult` is obtained), `startDownload()` SHALL call `logDownload` with the following parameters:

- `blogId` -- the blog identifier for the downloaded batch
- `successCount` -- the number of photos successfully downloaded
- `failedCount` -- the number of photos that failed to download
- `skippedCount` -- the number of photos skipped (already cached)
- `totalCount` -- the total number of photos in the batch
- `durationMs` -- the elapsed time of the download operation in milliseconds

On failure (when an exception is caught), `startDownload()` SHALL call `logError` with the caught exception, stack trace, and context string `'startDownload'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful download logs batch result

- **GIVEN** a list of 10 photos is provided for download
- **WHEN** `startDownload()` completes with 8 successes, 1 failure, and 1 skipped
- **THEN** `logDownload` SHALL be called with `successCount: 8`, `failedCount: 1`, `skippedCount: 1`, `totalCount: 10`
- **AND** `durationMs` SHALL reflect the actual elapsed time

#### Scenario: Failed download logs error

- **GIVEN** `PhotoRepository.downloadAllToCache()` throws an exception
- **WHEN** the exception is caught in `startDownload()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior SHALL remain unchanged

#### Scenario: Log failure does not affect download result

- **GIVEN** `logDownload` throws an exception internally
- **WHEN** `startDownload()` completes successfully
- **THEN** the `DownloadBatchResult` SHALL still be stored in state
- **AND** no error SHALL be surfaced to the user
