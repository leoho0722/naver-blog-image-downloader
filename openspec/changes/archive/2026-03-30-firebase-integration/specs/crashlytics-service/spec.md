## ADDED Requirements

### Requirement: CrashlyticsService provider defined (keepAlive)

The file `lib/data/services/crashlytics_service.dart` SHALL define a `CrashlyticsService` class annotated with `@Riverpod(keepAlive: true)`, producing a singleton provider that persists for the lifetime of the application.

- The `CrashlyticsService` SHALL wrap `FirebaseCrashlytics.instance` to provide a testable abstraction over Firebase Crashlytics.
- The generated provider SHALL be a keepAlive provider so that the `CrashlyticsService` instance is never disposed.

#### Scenario: CrashlyticsService provider is created as a singleton

- **WHEN** `crashlyticsServiceProvider` is read from a `ProviderContainer`
- **THEN** it SHALL return a `CrashlyticsService` instance
- **AND** subsequent reads SHALL return the same instance

#### Scenario: CrashlyticsService wraps FirebaseCrashlytics.instance

- **WHEN** a `CrashlyticsService` is instantiated
- **THEN** it SHALL delegate all operations to `FirebaseCrashlytics.instance`

### Requirement: setUserId

The `CrashlyticsService` class SHALL provide a `setUserId` method that sets the user identifier on Firebase Crashlytics for crash report association.

- `setUserId` SHALL accept a `String uid` parameter.
- `setUserId` SHALL call `FirebaseCrashlytics.instance.setUserIdentifier(uid)`.
- `setUserId` SHALL return `Future<void>`.

#### Scenario: User identifier set successfully

- **GIVEN** a valid UID string `"user-abc-123"`
- **WHEN** `setUserId("user-abc-123")` is called
- **THEN** `FirebaseCrashlytics.instance.setUserIdentifier` SHALL be called with `"user-abc-123"`

#### Scenario: User identifier updated

- **GIVEN** a user identifier has already been set
- **WHEN** `setUserId` is called with a new UID
- **THEN** `FirebaseCrashlytics.instance.setUserIdentifier` SHALL be called with the new UID, replacing the previous value

### Requirement: recordError (fatal and non-fatal)

The `CrashlyticsService` class SHALL provide a `recordError` method that reports errors to Firebase Crashlytics.

- `recordError` SHALL accept the following parameters:
  - `dynamic error` -- the error object to report
  - `StackTrace stackTrace` -- the stack trace associated with the error
  - `bool fatal` -- optional named parameter, defaults to `false`, indicating whether the error is fatal
- `recordError` SHALL call `FirebaseCrashlytics.instance.recordError(error, stackTrace, fatal: fatal)`.
- `recordError` SHALL return `Future<void>`.

#### Scenario: Non-fatal error recorded

- **GIVEN** an exception and its stack trace
- **WHEN** `recordError(error, stackTrace)` is called without specifying `fatal`
- **THEN** `FirebaseCrashlytics.instance.recordError` SHALL be called with `fatal: false`

#### Scenario: Fatal error recorded

- **GIVEN** an exception and its stack trace
- **WHEN** `recordError(error, stackTrace, fatal: true)` is called
- **THEN** `FirebaseCrashlytics.instance.recordError` SHALL be called with `fatal: true`

#### Scenario: Error with various types

- **GIVEN** an error of type `String`, `Exception`, or `Error`
- **WHEN** `recordError` is called with the error
- **THEN** it SHALL forward the error to `FirebaseCrashlytics.instance.recordError` regardless of type

### Requirement: log breadcrumb

The `CrashlyticsService` class SHALL provide a `log` method that writes a breadcrumb log message to Firebase Crashlytics.

- `log` SHALL accept a `String message` parameter.
- `log` SHALL call `FirebaseCrashlytics.instance.log(message)`.
- Breadcrumb logs are attached to the next crash report and help diagnose the sequence of events leading to a crash.

#### Scenario: Breadcrumb log written

- **GIVEN** a log message `"User tapped download button"`
- **WHEN** `log("User tapped download button")` is called
- **THEN** `FirebaseCrashlytics.instance.log` SHALL be called with `"User tapped download button"`

#### Scenario: Multiple breadcrumb logs

- **GIVEN** multiple log messages are written in sequence
- **WHEN** `log` is called three times with different messages
- **THEN** `FirebaseCrashlytics.instance.log` SHALL be called three times with the corresponding messages in order
