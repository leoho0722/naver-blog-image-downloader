## ADDED Requirements

### Requirement: ApiService class using AWS Amplify SDK

The file `lib/data/services/api_service.dart` SHALL define an `ApiService` class that uses `Amplify.API.post()` to send REST requests to the backend Lambda API.

- `ApiService` SHALL have a constructor accepting optional named parameters `apiName` (String, default `'naverBlogApi'`) and `timeout` (Duration, default 30 seconds).
- `ApiService` SHALL store `apiName` and `timeout` as public final fields.
- `ApiService` SHALL define a static constant `_path` with value `'/api/photos'`.
- `ApiService` SHALL NOT accept or use `http.Client`. The base URL SHALL be managed by Amplify configuration (`amplifyconfiguration.dart`), not by `AppConfig.baseUrl`.

#### Scenario: ApiService is instantiated with defaults

- **WHEN** an `ApiService` is created with no arguments
- **THEN** `apiName` SHALL be `'naverBlogApi'` and `timeout` SHALL be 30 seconds

#### Scenario: ApiService uses Amplify.API.post for requests

- **WHEN** `submitJob` or `checkJobStatus` is called
- **THEN** the service SHALL use `Amplify.API.post()` with the configured `apiName` and `_path`

### Requirement: PhotoDownloadRequest DTO with action field

The file `lib/data/models/dtos/photo_download_request.dart` SHALL define a `PhotoDownloadRequest` class that encapsulates the request payload for the `/api/photos` endpoint.

- `PhotoDownloadRequest` SHALL have a `blogUrl` field (String, optional) for the blog URL.
- `PhotoDownloadRequest` SHALL have a `jobId` field (String, optional) for the job ID.
- `PhotoDownloadRequest` SHALL have an `action` field (String, required) indicating the request type (`"download"` or `"status"`).
- `PhotoDownloadRequest` SHALL provide named constructors: `PhotoDownloadRequest.download({required blogUrl})` and `PhotoDownloadRequest.status({required jobId})`.
- `PhotoDownloadRequest` SHALL provide a `toJson()` method that serializes the fields to a JSON-compatible map.

#### Scenario: Download action request

- **WHEN** a `PhotoDownloadRequest` is created with `PhotoDownloadRequest.download(blogUrl: url)`
- **THEN** `toJson()` SHALL return `{"blog_url": "<blogUrl>", "action": "download"}`

#### Scenario: Status action request

- **WHEN** a `PhotoDownloadRequest` is created with `PhotoDownloadRequest.status(jobId: id)`
- **THEN** `toJson()` SHALL return `{"job_id": "<jobId>", "action": "status"}`

### Requirement: JobStatusResponse DTO and JobStatus enum

The file `lib/data/models/dtos/job_status_response.dart` SHALL define a `JobStatusResponse` class and a `JobStatus` enum.

- `JobStatus` enum SHALL define three values: `processing`, `completed`, `failed`.
- `JobStatusResponse` SHALL have a `status` field of type `JobStatus`.
- `JobStatusResponse` SHALL have an optional `result` field containing the job result data.
- `JobStatusResponse` SHALL provide a `fromJson(Map<String, dynamic>)` factory constructor.
- When `status` is `completed`, the `result` field SHALL contain the photo download data.
- When `status` is `failed`, the `result` field SHALL contain the same structure as `completed`, with error details available in `result.errors`.

#### Scenario: Processing status parsed

- **GIVEN** a JSON response with `{"status": "processing"}`
- **WHEN** `JobStatusResponse.fromJson` is called
- **THEN** `status` SHALL be `JobStatus.processing`
- **AND** `result` SHALL be `null`

#### Scenario: Completed status parsed

- **GIVEN** a JSON response with `{"status": "completed", "result": {...}}`
- **WHEN** `JobStatusResponse.fromJson` is called
- **THEN** `status` SHALL be `JobStatus.completed`
- **AND** `result` SHALL contain the parsed result data

#### Scenario: Failed status parsed

- **GIVEN** a JSON response with `{"status": "failed", "result": {"errors": [...]}}`
- **WHEN** `JobStatusResponse.fromJson` is called
- **THEN** `status` SHALL be `JobStatus.failed`
- **AND** `result` SHALL contain the parsed result data with error details in `result.errors`

### Requirement: ApiServiceException defined inside api_service.dart

The class `ApiServiceException` SHALL be defined in `lib/data/services/api_service.dart` (NOT in a separate file).

- `ApiServiceException` SHALL implement `Exception`.
- `ApiServiceException` SHALL have a `message` field (String) describing the error.
- `ApiServiceException` SHALL have a `statusCode` field of type `int?` (nullable) containing the HTTP status code.
- `ApiServiceException` SHALL have a computed getter `isRetryable` (bool) that returns `true` when `statusCode` is 502, 503, or 504, and `false` otherwise (including when `statusCode` is `null`).
- `isRetryable` SHALL NOT be a constructor parameter.
- `ApiServiceException` SHALL override `toString()` to return `message`.

#### Scenario: Non-retryable error (400)

- **WHEN** an `ApiServiceException` is created with `statusCode: 400`
- **THEN** `isRetryable` SHALL be `false`

#### Scenario: Retryable error (503)

- **WHEN** an `ApiServiceException` is created with `statusCode: 503`
- **THEN** `isRetryable` SHALL be `true`

#### Scenario: Retryable error (502)

- **WHEN** an `ApiServiceException` is created with `statusCode: 502`
- **THEN** `isRetryable` SHALL be `true`

#### Scenario: Retryable error (504)

- **WHEN** an `ApiServiceException` is created with `statusCode: 504`
- **THEN** `isRetryable` SHALL be `true`

#### Scenario: No statusCode

- **WHEN** an `ApiServiceException` is created without a `statusCode`
- **THEN** `statusCode` SHALL be `null`
- **AND** `isRetryable` SHALL be `false`

#### Scenario: toString returns message

- **WHEN** `toString()` is called on an `ApiServiceException`
- **THEN** it SHALL return the `message` string

### Requirement: submitJob sends POST via Amplify to submit a download task

The `ApiService` SHALL provide a `submitJob` method that submits a download task to the Lambda API.

- `submitJob` SHALL accept a `String blogUrl` parameter.
- `submitJob` SHALL use `Amplify.API.post()` to send a POST request to `_path` (`'/api/photos'`), passing `apiName` and the request body via `HttpPayload.json()`.
- The request body SHALL be the JSON map from `PhotoDownloadRequest.download(blogUrl: blogUrl).toJson()`, which produces `{"blog_url": blogUrl, "action": "download"}`.
- `submitJob` SHALL return a `Future<String>` containing the `job_id` from the response.
- On a successful 2xx response, `submitJob` SHALL parse the response body and return the `job_id`.
- If `job_id` is missing from the response, `submitJob` SHALL throw an `ApiServiceException`.
- On non-2xx response, `submitJob` SHALL throw an `ApiServiceException` with the corresponding status code.

#### Scenario: Successful submit returns job_id

- **GIVEN** the Lambda API returns a 2xx response with a JSON body containing `"job_id": "abc-123"`
- **WHEN** `submitJob` is called with a valid blog URL
- **THEN** it SHALL return `"abc-123"`

#### Scenario: Submit request has correct body format

- **GIVEN** an `ApiService` instance
- **WHEN** `submitJob` is called with blog URL `"https://blog.naver.com/example/123"`
- **THEN** the POST request body SHALL contain `{"blog_url": "https://blog.naver.com/example/123", "action": "download"}`

#### Scenario: Submit with non-2xx response throws ApiServiceException

- **GIVEN** the Lambda API returns a 400 status code
- **WHEN** `submitJob` is called
- **THEN** it SHALL throw an `ApiServiceException` with the corresponding status code

### Requirement: _post helper handles Lambda proxy integration

The `ApiService` SHALL provide a private `_post` helper method that sends POST requests via `Amplify.API.post()` and handles Lambda proxy integration.

- `_post` SHALL accept a `Map<String, dynamic> body` parameter and an optional `Set<int>? acceptStatusCodes` parameter.
- When `acceptStatusCodes` is provided, `_post` SHALL accept only status codes in that set; otherwise it SHALL accept any 2xx status code.
- `_post` SHALL decode the response body as JSON.
- If the response JSON contains a `body` field that is a String, `_post` SHALL parse that inner body as JSON and return it (Lambda proxy integration handling).
- Otherwise, `_post` SHALL return the response JSON directly.
- On non-accepted status codes, `_post` SHALL throw an `ApiServiceException` with the status code.
- On `TimeoutException`, `_post` SHALL rethrow.
- On Amplify `ApiException`, `_post` SHALL throw an `ApiServiceException` wrapping the error message.

### Requirement: checkJobStatus sends POST via Amplify to poll job status

The `ApiService` SHALL provide a `checkJobStatus` method that polls the status of a submitted job.

- `checkJobStatus` SHALL accept a `String jobId` parameter.
- `checkJobStatus` SHALL call `_post` with `acceptStatusCodes: {200, 500}` to accept both success and failed business statuses.
- The request body SHALL be the JSON map from `PhotoDownloadRequest.status(jobId: jobId).toJson()`.
- `checkJobStatus` SHALL return a `Future<JobStatusResponse>`.
- HTTP 200 SHALL be accepted for `processing` and `completed` statuses.
- HTTP 500 SHALL be accepted for `failed` status (a valid business status, not an API error).
- On any other HTTP status code, the `_post` helper SHALL throw an `ApiServiceException`.

#### Scenario: Processing status returned

- **GIVEN** the Lambda API returns HTTP 200 with `{"status": "processing"}`
- **WHEN** `checkJobStatus` is called
- **THEN** it SHALL return a `JobStatusResponse` with `status` equal to `JobStatus.processing`

#### Scenario: Completed status returned with result

- **GIVEN** the Lambda API returns HTTP 200 with `{"status": "completed", "result": {...}}`
- **WHEN** `checkJobStatus` is called
- **THEN** it SHALL return a `JobStatusResponse` with `status` equal to `JobStatus.completed` and a populated `result`

#### Scenario: Failed status returned via HTTP 500

- **GIVEN** the Lambda API returns HTTP 500 with `{"status": "failed", "result": {"errors": ["timeout"]}}`
- **WHEN** `checkJobStatus` is called
- **THEN** it SHALL return a `JobStatusResponse` with `status` equal to `JobStatus.failed` and `result.errors` containing `["timeout"]`
- **AND** it SHALL NOT throw an exception

#### Scenario: Unexpected status code throws ApiServiceException

- **GIVEN** the Lambda API returns HTTP 403
- **WHEN** `checkJobStatus` is called
- **THEN** it SHALL throw an `ApiServiceException`

### Requirement: ApiServiceException unit tests

The file `test/data/services/api_service_test.dart` SHALL contain unit tests for `ApiServiceException` only (since `Amplify.API` cannot be easily mocked).

- Tests SHALL verify `isRetryable` returns `true` for status codes 502, 503, and 504.
- Tests SHALL verify `isRetryable` returns `false` for status codes 500 and 400.
- Tests SHALL verify `isRetryable` returns `false` when `statusCode` is `null`.
- Tests SHALL verify `toString()` returns the `message` string.

#### Scenario: All test cases pass

- **WHEN** the test suite is executed
- **THEN** all test cases SHALL pass without failures
