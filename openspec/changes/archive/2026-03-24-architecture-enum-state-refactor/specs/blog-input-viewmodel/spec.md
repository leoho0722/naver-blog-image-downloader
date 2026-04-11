## MODIFIED Requirements

### Requirement: URL input state management

The `BlogInputViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts a `PhotoRepository` instance via the `required` named parameter `photoRepository`.

The ViewModel SHALL manage UI state through a single `FetchState` sealed class hierarchy instead of separate boolean and nullable fields. The sealed class SHALL have the following subtypes:
- `FetchIdle` — initial state, no operation in progress
- `FetchLoading` — fetch in progress, carries a `statusMessage` (String)
- `FetchError` — fetch failed, carries an error `message` (String)
- `FetchSuccess` — fetch succeeded, carries a `result` (FetchResult)

The ViewModel SHALL expose the following read-only convenience properties for backward compatibility:
- `blogUrl` (String) — the current URL input value
- `isLoading` (bool) — `true` when state is `FetchLoading`
- `errorMessage` (String?) — the error message when state is `FetchError`, otherwise `null`
- `fetchResult` (FetchResult?) — the fetch result when state is `FetchSuccess`, otherwise `null`
- `statusMessage` (String?) — the status message when state is `FetchLoading`, otherwise `null`

#### Scenario: Initial state

- **WHEN** a new `BlogInputViewModel` is created
- **THEN** the internal state SHALL be `FetchIdle`
- **AND** `blogUrl` SHALL be an empty string
- **AND** `isLoading` SHALL be `false`
- **AND** `errorMessage` SHALL be `null`
- **AND** `fetchResult` SHALL be `null`
- **AND** `statusMessage` SHALL be `null`

#### Scenario: URL value updated

- **WHEN** `onUrlChanged` is called with a URL string
- **THEN** `blogUrl` SHALL reflect the new value
- **AND** internal state SHALL reset to `FetchIdle`
- **AND** `notifyListeners` SHALL be called

### Requirement: Fetch photos with loading state and status message

The `fetchPhotos()` method SHALL manage state transitions through the `FetchState` sealed class.

- On invocation, state SHALL transition from `FetchIdle` to `FetchLoading`
- The `onStatusChanged` callback SHALL update the `statusMessage` within `FetchLoading`
- On success, state SHALL transition to `FetchSuccess`
- On failure, state SHALL transition to `FetchError`

#### Scenario: Successful fetch

- **GIVEN** `blogUrl` is a non-empty string
- **AND** `PhotoRepository.fetchPhotos` returns `Result.ok(fetchResult)`
- **WHEN** `fetchPhotos()` is called
- **THEN** state SHALL transition: `FetchIdle` → `FetchLoading` → `FetchSuccess`
- **AND** `fetchResult` SHALL hold the returned `FetchResult`
- **AND** `errorMessage` SHALL be `null`

#### Scenario: Failed fetch

- **GIVEN** `blogUrl` is a non-empty string
- **AND** `PhotoRepository.fetchPhotos` returns `Result.error(exception)`
- **WHEN** `fetchPhotos()` is called
- **THEN** state SHALL transition: `FetchIdle` → `FetchLoading` → `FetchError`
- **AND** `errorMessage` SHALL contain the error description
- **AND** `fetchResult` SHALL be `null`

#### Scenario: Duplicate fetch prevention

- **GIVEN** state is `FetchLoading`
- **WHEN** `fetchPhotos()` is called again
- **THEN** the method SHALL return immediately without making another repository call

### Requirement: Reset state

The `reset()` method SHALL set internal state to `FetchIdle`, clearing `fetchResult`, `errorMessage`, and `statusMessage`. It SHALL NOT reset `blogUrl`.

#### Scenario: Reset after successful fetch

- **GIVEN** state is `FetchSuccess`
- **WHEN** `reset()` is called
- **THEN** state SHALL be `FetchIdle`
- **AND** `fetchResult` SHALL be `null`
- **AND** `errorMessage` SHALL be `null`
- **AND** `statusMessage` SHALL be `null`
- **AND** `blogUrl` SHALL remain unchanged
- **AND** `notifyListeners` SHALL be called
