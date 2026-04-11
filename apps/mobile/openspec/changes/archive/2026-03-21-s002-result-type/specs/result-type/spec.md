## ADDED Requirements

### Requirement: Result sealed class defined

The file `lib/ui/core/result.dart` SHALL define a `Result<T>` sealed class with two final subclasses: `Ok<T>` and `Error<T>`.

- `Result<T>` SHALL be a sealed class with a `const` constructor.
- `Result<T>` SHALL provide a factory constructor `Result.ok(T value)` that creates an `Ok<T>` instance.
- `Result<T>` SHALL provide a factory constructor `Result.error(Exception error)` that creates an `Error<T>` instance.

#### Scenario: Ok subclass holds a value

- **WHEN** `Result.ok(value)` is called with a value of type `T`
- **THEN** the returned `Ok<T>` instance SHALL expose the value via a `value` property of type `T`

#### Scenario: Error subclass holds an exception

- **WHEN** `Result.error(exception)` is called with an `Exception`
- **THEN** the returned `Error<T>` instance SHALL expose the exception via an `error` property of type `Exception`

#### Scenario: Exhaustive pattern matching

- **WHEN** a `Result<T>` is used in a switch expression
- **THEN** the Dart compiler SHALL enforce exhaustive matching on `Ok` and `Error` cases

### Requirement: AppError exception defined

The file `lib/ui/core/app_error.dart` SHALL define an `AppError` class that implements `Exception`.

- `AppError` SHALL have a `type` property of type `AppErrorType`.
- `AppError` SHALL have a `message` property of type `String`.

#### Scenario: AppErrorType enumeration

- **WHEN** the `AppErrorType` enum is inspected
- **THEN** it SHALL contain at least the following values: `network`, `parsing`, `unknown`

#### Scenario: AppError creation

- **WHEN** an `AppError` is created with a type and message
- **THEN** both properties SHALL be accessible on the instance

#### Scenario: AppError toString

- **WHEN** `toString()` is called on an `AppError` instance
- **THEN** it SHALL return a string that includes the error type and message
