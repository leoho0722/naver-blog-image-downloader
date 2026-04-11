## ADDED Requirements

### Requirement: PhotoRepository construction

The `PhotoRepository` class SHALL accept four required dependencies via its constructor: `ApiService`, `FileDownloadService`, `GalleryService`, and `CacheRepository`. All dependencies SHALL be stored as private final fields.

#### Scenario: All dependencies injected

- **WHEN** a `PhotoRepository` is constructed with all four dependencies
- **THEN** the instance SHALL be created without error

#### Scenario: Dependencies accessible internally

- **WHEN** `fetchPhotos` is called on a properly constructed `PhotoRepository`
- **THEN** it SHALL use the injected `ApiService` and `CacheRepository` to perform the operation

### Requirement: BlogId derivation in fetchPhotos

The `fetchPhotos(String blogUrl, {void Function(JobStatus)? onStatusChanged})` method SHALL derive a `blogId` by calling `CacheRepository.blogId(blogUrl)` before making the API call.

#### Scenario: BlogId derived from URL

- **WHEN** `fetchPhotos` is called with a blog URL
- **THEN** `CacheRepository.blogId` SHALL be called with the same URL to derive the blogId

### Requirement: Job submission via ApiService.submitJob

The `fetchPhotos` method SHALL call `ApiService.submitJob(blogUrl)` to submit a download task and obtain a `job_id`.

- `fetchPhotos` SHALL call `submitJob` with the provided `blogUrl`.
- `fetchPhotos` SHALL store the returned `job_id` for subsequent status polling.

#### Scenario: Successful job submission

- **WHEN** `fetchPhotos` is called and `ApiService.submitJob` returns a `job_id`
- **THEN** the `job_id` SHALL be used for subsequent `checkJobStatus` calls

#### Scenario: Job submission failure

- **WHEN** `ApiService.submitJob` throws an `ApiServiceException`
- **THEN** `fetchPhotos` SHALL return `Result.error` wrapping the exception

### Requirement: Async polling loop with 3-second interval

After obtaining a `job_id`, the `fetchPhotos` method SHALL poll `ApiService.checkJobStatus(jobId)` at 3-second intervals until the job completes, fails, or the maximum attempt count is reached.

- The polling interval SHALL be 3 seconds.
- The maximum number of polling attempts SHALL be 200 (total maximum duration: 10 minutes).
- On `JobStatus.processing`, `fetchPhotos` SHALL wait 3 seconds and poll again.
- On `JobStatus.completed`, `fetchPhotos` SHALL exit the polling loop and proceed with the result.
- On `JobStatus.failed`, `fetchPhotos` SHALL extract the error message from `result.errors` and return `Result.error`.
- If the maximum attempt count is exceeded, `fetchPhotos` SHALL return `Result.error` with a timeout error.

#### Scenario: Polling until completed

- **GIVEN** `checkJobStatus` returns `processing` twice then `completed`
- **WHEN** `fetchPhotos` is called
- **THEN** it SHALL poll three times total, waiting 3 seconds between each poll
- **AND** it SHALL proceed with the completed result

#### Scenario: Polling receives failed status

- **GIVEN** `checkJobStatus` returns `processing` once then `failed` with `result.errors` containing `["server timeout"]`
- **WHEN** `fetchPhotos` is called
- **THEN** it SHALL return `Result.error` with an exception message derived from `result.errors`

#### Scenario: Polling timeout after max attempts

- **GIVEN** `checkJobStatus` returns `processing` for 200 consecutive calls
- **WHEN** `fetchPhotos` is called
- **THEN** it SHALL return `Result.error` with a timeout error after 200 attempts

### Requirement: onStatusChanged callback

The `fetchPhotos` method SHALL accept an optional `onStatusChanged` callback parameter of type `void Function(JobStatus)?`.

- When provided, `fetchPhotos` SHALL invoke the callback to report status changes during the async polling process.
- The callback SHALL be invoked after job submission and during polling status transitions.

#### Scenario: Callback invoked during polling

- **GIVEN** `onStatusChanged` is provided
- **WHEN** `fetchPhotos` submits a job and polls for status
- **THEN** the callback SHALL be invoked with `JobStatus` enum values reflecting the current stage

#### Scenario: Callback not provided

- **GIVEN** `onStatusChanged` is `null`
- **WHEN** `fetchPhotos` is called
- **THEN** the method SHALL proceed normally without invoking any callback

### Requirement: DTO to Entity conversion after completed result

After the polling loop completes with `JobStatus.completed`, `fetchPhotos` SHALL convert the result's image URL list to `PhotoEntity` instances using the `toEntities()` method.

#### Scenario: Successful conversion

- **WHEN** the polling loop returns a completed result
- **THEN** `result.toEntities()` SHALL be used to convert the image URLs to `PhotoEntity` instances
- **AND** the resulting list SHALL contain the same number of entities as image URLs

#### Scenario: Empty photo list from completed result

- **WHEN** the completed result contains an empty list of photos
- **THEN** `fetchPhotos` SHALL return a `Result.ok` containing a `FetchResult` with an empty photo list

### Requirement: Cache status check in fetchPhotos

After converting DTOs to entities, `fetchPhotos` SHALL extract all filenames from the photo entities and call `CacheRepository.isBlogFullyCached(blogId, filenames)` to determine the cache status.

#### Scenario: Blog is fully cached

- **WHEN** all photo filenames exist in the cache
- **THEN** the `FetchResult.isFullyCached` field SHALL be `true`

#### Scenario: Blog is not fully cached

- **WHEN** one or more photo filenames are missing from the cache
- **THEN** the `FetchResult.isFullyCached` field SHALL be `false`

### Requirement: Result wrapping

The `fetchPhotos` method SHALL return `Result<FetchResult>`. On success, it SHALL return `Result.ok(fetchResult)`. On any exception, it SHALL catch the exception and return `Result.error(e)`.

#### Scenario: Successful fetch returns Result.ok

- **WHEN** the entire fetchPhotos flow (submit → poll → convert → cache check) completes without exception
- **THEN** a `Result.ok` containing the `FetchResult` SHALL be returned

#### Scenario: API error returns Result.error

- **WHEN** `ApiService.submitJob` or `ApiService.checkJobStatus` throws an exception
- **THEN** `fetchPhotos` SHALL return `Result.error` wrapping the exception

#### Scenario: Cache check error returns Result.error

- **WHEN** `CacheRepository.isBlogFullyCached` throws an exception
- **THEN** `fetchPhotos` SHALL return `Result.error` wrapping the exception
