## MODIFIED Requirements

### Requirement: PhotoRepository fetchPhotos return type

`PhotoRepository.fetchPhotos()` SHALL return `Future<FetchResult>` directly instead of `Future<Result<FetchResult>>`. On failure, it SHALL throw the exception (e.g., `AppError`, `TimeoutException`, `ApiServiceException`) instead of wrapping it in `Result.error`.

#### Scenario: Successful fetch returns FetchResult directly

- **GIVEN** the API returns a completed job with photo URLs
- **WHEN** `fetchPhotos(blogUrl)` is called
- **THEN** it SHALL return a `FetchResult` instance directly (not wrapped in `Result.ok`)

#### Scenario: Failed fetch throws exception

- **GIVEN** the API job fails with a server error
- **WHEN** `fetchPhotos(blogUrl)` is called
- **THEN** it SHALL throw an `AppError` with `type: AppErrorType.serverError`
- **AND** SHALL NOT return `Result.error`

#### Scenario: Timeout throws TimeoutException

- **GIVEN** the polling exceeds maximum attempts
- **WHEN** `fetchPhotos(blogUrl)` is called
- **THEN** it SHALL throw an `AppError` with `type: AppErrorType.timeout`
