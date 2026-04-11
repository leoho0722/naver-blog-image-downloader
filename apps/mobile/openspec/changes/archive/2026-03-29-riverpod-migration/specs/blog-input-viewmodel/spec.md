## REMOVED Requirements

### Requirement: URL input state management

**Reason**: Replaced by the new Riverpod-based state management. `BlogInputViewModel` no longer extends `ChangeNotifier`. State is managed via `Notifier<BlogInputState>` with `AsyncValue<FetchResult?>`.

**Migration**: Replace `ChangeNotifier` with `Notifier<BlogInputState>`. Replace `notifyListeners()` with immutable state updates via `state = state.copyWith(...)`.

### Requirement: Fetch photos with loading state and status message

**Reason**: Replaced by `AsyncValue<FetchResult?>` field in `BlogInputState`. The `FetchState` sealed class (FetchIdle/FetchLoading/FetchError/FetchSuccess) is removed.

**Migration**: Use `AsyncValue<FetchResult?>` where `AsyncData(null)` = idle, `AsyncLoading` = fetching, `AsyncData(result)` = success, `AsyncError` = failure. Keep `FetchLoadingPhase` as a separate state field.

### Requirement: Human-readable error messages

**Reason**: Error messages are now localized in the View layer based on `FetchException.errorType`, not via a ViewModel method.

**Migration**: View layer maps `FetchException.errorType` to localized strings directly.

## MODIFIED Requirements

### Requirement: Empty URL validation

`BlogInputViewModel.fetchPhotos()` SHALL set `state.fetchResult` to `AsyncError(FetchException(errorType: FetchErrorType.emptyUrl), stackTrace)` when the blog URL is empty.

#### Scenario: Fetch with empty URL

- **GIVEN** the `blogUrl` in state is an empty string
- **WHEN** `fetchPhotos()` is called
- **THEN** `state.fetchResult` SHALL be `AsyncError` containing a `FetchException` with `errorType: FetchErrorType.emptyUrl`

### Requirement: Reset state

`BlogInputViewModel.reset()` SHALL reset `fetchResult` to `AsyncData(null)` and `loadingPhase` to `null`, while preserving `blogUrl`.

#### Scenario: Reset after successful fetch

- **GIVEN** the state has `fetchResult: AsyncData(someFetchResult)`
- **WHEN** `reset()` is called
- **THEN** `state.fetchResult` SHALL be `AsyncData(null)`
- **AND** `state.blogUrl` SHALL be preserved
- **AND** `state.loadingPhase` SHALL be `null`

### Requirement: FetchErrorType enum

`FetchErrorType` SHALL remain as an enum with values: `emptyUrl`, `timeout`, `serverUnavailable`, `apiFailed`, `serverError`, `networkError`, `unknown`.

#### Scenario: All error types defined

- **GIVEN** the `FetchErrorType` enum is defined
- **WHEN** inspecting its values
- **THEN** it SHALL contain exactly: `emptyUrl`, `timeout`, `serverUnavailable`, `apiFailed`, `serverError`, `networkError`, `unknown`

### Requirement: FetchLoadingPhase enum

`FetchLoadingPhase` SHALL remain as an enum with values: `submitting`, `processing`, `completed`.

#### Scenario: All loading phases defined

- **GIVEN** the `FetchLoadingPhase` enum is defined
- **WHEN** inspecting its values
- **THEN** it SHALL contain exactly: `submitting`, `processing`, `completed`

## ADDED Requirements

### Requirement: BlogInputState immutable class

`BlogInputState` SHALL be an immutable class with fields: `blogUrl` (default `""`), `fetchResult` (default `AsyncData(null)`), and `loadingPhase` (default `null`). It SHALL provide a `copyWith` method, an `isLoading` computed getter, and a `fetchResultValue` computed getter.

#### Scenario: Default BlogInputState

- **GIVEN** a new `BlogInputState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `blogUrl` SHALL be `""`
- **AND** `fetchResult` SHALL be `AsyncData(null)`
- **AND** `loadingPhase` SHALL be `null`
- **AND** `isLoading` SHALL be `false`

### Requirement: FetchException class

`FetchException` SHALL implement `Exception` and carry `errorType` (`FetchErrorType`) and optional `statusCode` (`int?`). It SHALL be used within `AsyncError` to preserve domain-specific error information.

#### Scenario: FetchException with errorType and statusCode

- **GIVEN** a `FetchException` is created with `errorType: FetchErrorType.serverUnavailable` and `statusCode: 503`
- **WHEN** it is wrapped in `AsyncError`
- **THEN** the `AsyncError.error` SHALL be a `FetchException` with `errorType == FetchErrorType.serverUnavailable` and `statusCode == 503`

### Requirement: BlogInputViewModel as Notifier

`BlogInputViewModel` SHALL extend the generated `_$BlogInputViewModel` (Riverpod `Notifier<BlogInputState>`). `build()` SHALL return `const BlogInputState()`. Dependencies SHALL be accessed via `ref.read`.

#### Scenario: Fetch photos with AsyncValue lifecycle

- **GIVEN** the state has a non-empty `blogUrl`
- **WHEN** `fetchPhotos()` is called
- **THEN** `state.fetchResult` SHALL transition to `AsyncLoading`
- **AND** `state.loadingPhase` SHALL be set to `FetchLoadingPhase.submitting`
- **AND** on success, `state.fetchResult` SHALL be `AsyncData(fetchResult)` with `loadingPhase: null`
- **AND** on failure, `state.fetchResult` SHALL be `AsyncError(FetchException(...))` with `loadingPhase: null`

#### Scenario: Loading phase updates during polling

- **GIVEN** `fetchPhotos()` is in progress
- **WHEN** `onStatusChanged` callback reports `JobStatus.processing`
- **THEN** `state.loadingPhase` SHALL be `FetchLoadingPhase.processing`

#### Scenario: Exception mapping to FetchException

- **GIVEN** the repository throws a `TimeoutException`
- **WHEN** `fetchPhotos()` catches the exception
- **THEN** it SHALL set `state.fetchResult` to `AsyncError(FetchException(errorType: FetchErrorType.timeout))`
