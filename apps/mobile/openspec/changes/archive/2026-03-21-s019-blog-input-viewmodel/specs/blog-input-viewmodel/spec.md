## ADDED Requirements

### Requirement: URL input state management

The `BlogInputViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts a `PhotoRepository` instance via the `required` named parameter `photoRepository`.

The ViewModel SHALL expose the following read-only properties:
- `blogUrl` (String) — the current URL input value
- `isLoading` (bool) — whether a fetch operation is in progress
- `errorMessage` (String?) — the current error message, or null
- `fetchResult` (FetchResult?) — the fetch result, or null
- `statusMessage` (String?) — the current status message reflecting the async job progress, or null

#### Scenario: Initial state

- **WHEN** a new `BlogInputViewModel` is created
- **THEN** `blogUrl` SHALL be an empty string
- **AND** `isLoading` SHALL be `false`
- **AND** `errorMessage` SHALL be `null`
- **AND** `fetchResult` SHALL be `null`
- **AND** `statusMessage` SHALL be `null`

#### Scenario: URL value updated

- **WHEN** `onUrlChanged` is called with a URL string
- **THEN** `blogUrl` SHALL reflect the new value
- **AND** `notifyListeners` SHALL be called

### Requirement: Empty URL validation

The `fetchPhotos()` method SHALL validate that `blogUrl` is not empty before initiating a fetch operation.

#### Scenario: Fetch with empty URL

- **GIVEN** `blogUrl` is an empty string
- **WHEN** `fetchPhotos()` is called
- **THEN** `errorMessage` SHALL be set to a non-null error message
- **AND** `isLoading` SHALL remain `false`
- **AND** no call to `PhotoRepository.fetchPhotos` SHALL be made

### Requirement: Fetch photos with loading state and status message

The `fetchPhotos()` method SHALL manage the loading state, status message, and delegate to `PhotoRepository.fetchPhotos`.

- `fetchPhotos()` SHALL pass an `onStatusChanged` callback to `PhotoRepository.fetchPhotos`.
- The `onStatusChanged` callback receives a `JobStatus` enum value. The ViewModel SHALL map the `JobStatus` enum to a user-facing string internally.
- When the callback is invoked, `statusMessage` SHALL be updated with the mapped string and `notifyListeners()` SHALL be called.
- After the fetch operation completes (success or failure), `statusMessage` SHALL be cleared to `null`.

#### Scenario: Successful fetch

- **GIVEN** `blogUrl` is a non-empty string
- **AND** `PhotoRepository.fetchPhotos` returns `Result.ok(fetchResult)`
- **WHEN** `fetchPhotos()` is called
- **THEN** `isLoading` SHALL be set to `true` before the repository call
- **AND** `isLoading` SHALL be set to `false` after the repository call completes
- **AND** `fetchResult` SHALL hold the returned `FetchResult`
- **AND** `errorMessage` SHALL be `null`
- **AND** `statusMessage` SHALL be `null` after completion

#### Scenario: Failed fetch

- **GIVEN** `blogUrl` is a non-empty string
- **AND** `PhotoRepository.fetchPhotos` returns `Result.error(exception)`
- **WHEN** `fetchPhotos()` is called
- **THEN** `isLoading` SHALL be set to `true` before the repository call
- **AND** `isLoading` SHALL be set to `false` after the repository call completes
- **AND** `errorMessage` SHALL contain the error description
- **AND** `fetchResult` SHALL remain `null`
- **AND** `statusMessage` SHALL be `null` after completion

#### Scenario: Status message updates during fetch

- **GIVEN** `blogUrl` is a non-empty string
- **AND** the `onStatusChanged` callback is invoked during `PhotoRepository.fetchPhotos`
- **WHEN** the callback receives a `JobStatus` enum value
- **THEN** `statusMessage` SHALL be updated to the corresponding user-facing string mapped internally by the ViewModel
- **AND** `notifyListeners()` SHALL be called

#### Scenario: Duplicate fetch prevention

- **GIVEN** `isLoading` is `true`
- **WHEN** `fetchPhotos()` is called again
- **THEN** the method SHALL return immediately without making another repository call

### Requirement: Reset state

The `reset()` method SHALL clear `fetchResult`, `errorMessage`, and `statusMessage`. It SHALL NOT reset `blogUrl`.

#### Scenario: Reset after successful fetch

- **GIVEN** `fetchResult` holds a value
- **WHEN** `reset()` is called
- **THEN** `fetchResult` SHALL be `null`
- **AND** `errorMessage` SHALL be `null`
- **AND** `statusMessage` SHALL be `null`
- **AND** `blogUrl` SHALL remain unchanged
- **AND** `notifyListeners` SHALL be called
