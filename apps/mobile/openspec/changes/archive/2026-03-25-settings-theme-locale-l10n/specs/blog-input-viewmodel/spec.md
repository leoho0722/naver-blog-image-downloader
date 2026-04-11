## ADDED Requirements

### Requirement: FetchErrorType enum

A `FetchErrorType` enum SHALL be defined with the following values:

- `emptyUrl` — user submitted an empty URL
- `timeout` — request timed out
- `serverUnavailable` — server returned a retryable error
- `apiFailed` — API call failed (non-retryable)
- `serverError` — server-side processing error
- `networkError` — network connectivity issue
- `unknown` — unclassified error

#### Scenario: All error types defined

- **WHEN** `FetchErrorType.values` is inspected
- **THEN** it SHALL contain exactly 7 values: `emptyUrl`, `timeout`, `serverUnavailable`, `apiFailed`, `serverError`, `networkError`, `unknown`

### Requirement: FetchLoadingPhase enum

A `FetchLoadingPhase` enum SHALL be defined with the following values:

- `submitting` — task submission in progress
- `processing` — server processing the request
- `completed` — processing completed

#### Scenario: All loading phases defined

- **WHEN** `FetchLoadingPhase.values` is inspected
- **THEN** it SHALL contain exactly 3 values: `submitting`, `processing`, `completed`

## MODIFIED Requirements

### Requirement: Fetch photos with loading state and status message

The `fetchPhotos` method SHALL manage state transitions using `FetchLoadingPhase` enum instead of hardcoded status message strings:

- On submission: `FetchLoading(phase: FetchLoadingPhase.submitting)`
- On `JobStatus.processing`: `FetchLoading(phase: FetchLoadingPhase.processing)`
- On `JobStatus.completed`: `FetchLoading(phase: FetchLoadingPhase.completed)`

The `FetchLoading` class SHALL carry a `phase` property of type `FetchLoadingPhase` instead of a `statusMessage` property of type `String`.

On error, the method SHALL map exceptions to `FetchErrorType` enum values instead of calling `_humanReadableError()`:

- `TimeoutException` → `FetchErrorType.timeout`
- `ApiServiceException` with `isRetryable` true → `FetchErrorType.serverUnavailable`
- `ApiServiceException` without `isRetryable` → `FetchErrorType.apiFailed`
- `AppError` with `AppErrorType.serverError` → `FetchErrorType.serverError`
- `AppError` with `AppErrorType.network` → `FetchErrorType.networkError`
- `AppError` with `AppErrorType.timeout` → `FetchErrorType.timeout`
- All other exceptions → `FetchErrorType.unknown`

The `FetchError` class SHALL carry an `errorType` property of type `FetchErrorType` (and optionally a nullable `statusCode` of type `int?`) instead of a `message` property of type `String`.

#### Scenario: FetchLoading carries phase enum

- **WHEN** a `FetchLoading` state is created
- **THEN** it SHALL have a `phase` property of type `FetchLoadingPhase`
- **AND** it SHALL NOT have a `statusMessage` property

#### Scenario: FetchError carries errorType enum

- **WHEN** a `FetchError` state is created
- **THEN** it SHALL have an `errorType` property of type `FetchErrorType`
- **AND** it SHALL NOT have a `message` property of type `String`

#### Scenario: TimeoutException maps to FetchErrorType.timeout

- **WHEN** `fetchPhotos()` catches a `TimeoutException`
- **THEN** the state SHALL transition to `FetchError(errorType: FetchErrorType.timeout)`

#### Scenario: ApiServiceException with retryable maps to serverUnavailable

- **WHEN** `fetchPhotos()` catches an `ApiServiceException` with `isRetryable` true
- **THEN** the state SHALL transition to `FetchError(errorType: FetchErrorType.serverUnavailable)`

### Requirement: Human-readable error messages

The `_humanReadableError()` method SHALL be removed. Error message generation SHALL be delegated to the View layer, which maps `FetchErrorType` enum values to localized strings via `AppLocalizations`.

#### Scenario: No humanReadableError method

- **WHEN** the `BlogInputViewModel` class is inspected
- **THEN** it SHALL NOT contain a `_humanReadableError` method
