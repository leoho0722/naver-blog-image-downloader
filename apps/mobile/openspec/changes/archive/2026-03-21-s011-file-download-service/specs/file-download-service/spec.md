## ADDED Requirements

### Requirement: FileDownloadService class with injectable Dio

The file `lib/data/services/file_download_service.dart` SHALL define a `FileDownloadService` class that accepts a `Dio` instance via its constructor.

- `FileDownloadService` SHALL store the injected `Dio` as a private final field.
- The constructor SHALL require a single positional parameter of type `Dio`.

#### Scenario: FileDownloadService is instantiated with Dio

- **WHEN** a `FileDownloadService` is created with a `Dio` instance
- **THEN** it SHALL be successfully instantiated without errors

#### Scenario: FileDownloadService uses the injected Dio for downloads

- **WHEN** `downloadFile` is called
- **THEN** the service SHALL use the injected `Dio` instance to perform the download

### Requirement: Streaming download to temp file

The `FileDownloadService` SHALL provide a `downloadFile` method that downloads a file using Dio's streaming download capability.

- `downloadFile` SHALL accept a `String url` (download source) and a `String savePath` (destination path) parameter.
- `downloadFile` SHALL use `dio.download()` to stream the file to the specified `savePath`.
- `downloadFile` SHALL return a `Future<String>` containing the saved file path.

#### Scenario: File downloaded successfully

- **GIVEN** a valid URL pointing to a downloadable file
- **WHEN** `downloadFile` is called with the URL and a save path
- **THEN** the file SHALL be downloaded to the specified `savePath` and the path SHALL be returned

### Requirement: Retry up to 3 times with exponential backoff

The `downloadFile` method SHALL implement a retry mechanism with exponential backoff when a `DioException` occurs.

- The method SHALL retry up to 3 times after the initial attempt (4 total attempts).
- The delay between retries SHALL follow exponential backoff: 1 second, 2 seconds, 4 seconds.
- Only `DioException` errors SHALL trigger a retry.
- If all retries are exhausted, the method SHALL throw the last `DioException`.

#### Scenario: Download succeeds on second attempt

- **GIVEN** the first download attempt fails with a `DioException`
- **WHEN** `downloadFile` retries
- **THEN** the second attempt SHALL succeed and the file path SHALL be returned

#### Scenario: All retries exhausted

- **GIVEN** all 4 download attempts (1 initial + 3 retries) fail with `DioException`
- **WHEN** `downloadFile` completes all retry attempts
- **THEN** it SHALL throw the last `DioException`

#### Scenario: Exponential backoff timing

- **GIVEN** a download that requires retries
- **WHEN** the first retry occurs
- **THEN** it SHALL wait 1 second before the second attempt, 2 seconds before the third, and 4 seconds before the fourth

### Requirement: 30-second receive timeout

The `downloadFile` method SHALL configure a 30-second receive timeout for the download operation.

- The `receiveTimeout` option SHALL be set to 30 seconds on the download request.

#### Scenario: Download exceeds receive timeout

- **GIVEN** a download that takes longer than 30 seconds to receive data
- **WHEN** the timeout is exceeded
- **THEN** a `DioException` with type `receiveTimeout` SHALL be raised
