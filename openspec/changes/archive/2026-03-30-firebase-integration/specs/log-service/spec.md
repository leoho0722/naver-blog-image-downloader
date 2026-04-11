## ADDED Requirements

### Requirement: LogService provider defined (keepAlive)

The file `lib/data/services/log_service.dart` SHALL define a `LogService` class annotated with `@Riverpod(keepAlive: true)`, producing a singleton provider that persists for the lifetime of the application.

- The `LogService` constructor SHALL accept an optional `FirebaseFirestore` parameter for testability, defaulting to `FirebaseFirestore.instance` when not provided.
- The generated provider SHALL be a keepAlive provider so that the `LogService` instance is never disposed.

#### Scenario: LogService provider is created as a singleton

- **WHEN** `logServiceProvider` is read from a `ProviderContainer`
- **THEN** it SHALL return a `LogService` instance
- **AND** subsequent reads SHALL return the same instance

#### Scenario: LogService accepts custom FirebaseFirestore for testing

- **GIVEN** a mock `FirebaseFirestore` instance
- **WHEN** a `LogService` is constructed with the mock
- **THEN** it SHALL use the provided mock instead of `FirebaseFirestore.instance`

#### Scenario: LogService defaults to FirebaseFirestore.instance

- **WHEN** a `LogService` is constructed without arguments
- **THEN** it SHALL use `FirebaseFirestore.instance` internally

### Requirement: writeLog writes to Firestore

The `LogService` class SHALL provide a `writeLog` method that writes a log document to the user's log subcollection in Firestore.

- `writeLog` SHALL accept the following parameters:
  - `required String userId` -- the authenticated user's UID
  - `required String type` -- the log event type (e.g., `"fetch_photos"`, `"download"`)
  - `required Map<String, dynamic> data` -- the event-specific payload
  - `Map<String, dynamic>? deviceInfo` -- optional device information metadata
- `writeLog` SHALL return `Future<void>`.
- `writeLog` SHALL write a document to the Firestore path `users/{userId}/logs/{auto-id}` using the `add()` method on the collection reference.

#### Scenario: Log document written successfully

- **GIVEN** a valid userId, type, data, and optional deviceInfo
- **WHEN** `writeLog` is called
- **THEN** a new document SHALL be created at `users/{userId}/logs/{auto-id}`

#### Scenario: writeLog uses correct Firestore path

- **GIVEN** a userId of `"user-abc-123"`
- **WHEN** `writeLog` is called
- **THEN** the document SHALL be written to the collection `users/user-abc-123/logs`

### Requirement: Silent error handling

The `writeLog` method SHALL catch all exceptions silently. Logging failures MUST NOT propagate to the caller or affect application behavior.

- On any exception, `writeLog` SHALL call `debugPrint` with the error message for development diagnostics.
- `writeLog` SHALL NOT rethrow any exception.

#### Scenario: Firestore write fails

- **GIVEN** the Firestore write operation throws an exception (e.g., network error, permission denied)
- **WHEN** `writeLog` is called
- **THEN** the exception SHALL be caught silently
- **AND** `debugPrint` SHALL be called with the error information
- **AND** no exception SHALL propagate to the caller

#### Scenario: Firestore unavailable

- **GIVEN** the Firestore service is unreachable
- **WHEN** `writeLog` is called
- **THEN** the method SHALL complete without throwing
- **AND** `debugPrint` SHALL be called with the error information

### Requirement: Document structure

Each log document written by `writeLog` SHALL contain the following fields:

- `type` (String) -- the log event type, taken from the `type` parameter
- `timestamp` (FieldValue) -- set to `FieldValue.serverTimestamp()` for server-side timestamp
- `data` (Map) -- the event-specific payload, taken from the `data` parameter
- `deviceInfo` (Map, optional) -- included in the document only when the `deviceInfo` parameter is non-null

#### Scenario: Document with all fields

- **GIVEN** `type` is `"fetch_photos"`, `data` is `{"blogUrl": "https://..."}`, and `deviceInfo` is `{"os": "iOS", "version": "17.0"}`
- **WHEN** `writeLog` is called
- **THEN** the written document SHALL contain `type`, `timestamp` (server timestamp), `data`, and `deviceInfo` fields

#### Scenario: Document without deviceInfo

- **GIVEN** `type` is `"download"`, `data` is `{"blogId": "abc"}`, and `deviceInfo` is `null`
- **WHEN** `writeLog` is called
- **THEN** the written document SHALL contain `type`, `timestamp`, and `data` fields
- **AND** the `deviceInfo` field SHALL be omitted from the document

#### Scenario: Timestamp uses server time

- **WHEN** `writeLog` is called
- **THEN** the `timestamp` field SHALL be set to `FieldValue.serverTimestamp()`
- **AND** it SHALL NOT use a client-side `DateTime`
