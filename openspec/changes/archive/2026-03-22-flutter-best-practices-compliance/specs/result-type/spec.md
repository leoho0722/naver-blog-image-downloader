## ADDED Requirements

### Requirement: AppErrorType enum values

The `AppErrorType` enum in `lib/ui/core/app_error.dart` SHALL define the following values:

- `network` — network-related errors (timeout, no connectivity)
- `parsing` — data parsing errors (unexpected JSON format)
- `timeout` — operation timeout errors (polling exceeded limit)
- `gallery` — gallery saving errors (save to photo album failed)
- `serverError` — server-side processing errors (job failed)
- `unknown` — unclassifiable errors

#### Scenario: AppErrorType has all required values

- **WHEN** the `AppErrorType` enum is inspected
- **THEN** it SHALL contain exactly: `network`, `parsing`, `timeout`, `gallery`, `serverError`, `unknown`

#### Scenario: AppError used for gallery failures

- **WHEN** a gallery save operation fails
- **THEN** an `AppError` with type `AppErrorType.gallery` SHALL be thrown

#### Scenario: AppError used for timeout

- **WHEN** a polling operation exceeds the maximum attempts
- **THEN** a `Result.error` with `AppError(type: AppErrorType.timeout)` SHALL be returned

#### Scenario: AppError used for server errors

- **WHEN** a job status indicates failure
- **THEN** a `Result.error` with `AppError(type: AppErrorType.serverError)` SHALL be returned
