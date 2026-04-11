## REMOVED Requirements

### Requirement: Download state properties

**Reason**: Replaced by Riverpod `Notifier<DownloadViewModelState>`. The `DownloadState` enum is removed and replaced by `AsyncValue<DownloadBatchResult?>`.

**Migration**: Replace `ChangeNotifier` with `Notifier<DownloadViewModelState>`. Replace `DownloadState` enum with `AsyncValue<DownloadBatchResult?>` field.

## MODIFIED Requirements

### Requirement: Progress calculation

`DownloadViewModelState.progress` SHALL return `completed / total` as a `double` (0.0 to 1.0). If `total` is 0, it SHALL return 0.0.

#### Scenario: Progress with valid total

- **GIVEN** `DownloadViewModelState` has `completed: 3` and `total: 10`
- **WHEN** `progress` is accessed
- **THEN** it SHALL return `0.3`

#### Scenario: Progress with zero total

- **GIVEN** `DownloadViewModelState` has `total: 0`
- **WHEN** `progress` is accessed
- **THEN** it SHALL return `0.0`

### Requirement: Start download with progress tracking

`DownloadViewModel.startDownload()` SHALL set `downloadResult` to `AsyncLoading` at start, update `completed`/`total` during download via `onProgress` callback, and set `downloadResult` to `AsyncData(result)` on completion or `AsyncError` on failure.

#### Scenario: Successful batch download

- **GIVEN** a list of photos to download
- **WHEN** `startDownload(photos, blogId, blogUrl)` is called
- **THEN** `state.downloadResult` SHALL transition to `AsyncLoading`
- **AND** `state.completed` and `state.total` SHALL update with each progress callback
- **AND** on completion, `state.downloadResult` SHALL be `AsyncData(DownloadBatchResult(...))`

#### Scenario: Duplicate download prevention

- **GIVEN** `state.downloadResult` is `AsyncLoading` (download in progress)
- **WHEN** `startDownload()` is called again
- **THEN** the call SHALL return immediately without starting a new download

## ADDED Requirements

### Requirement: DownloadViewModelState immutable class

`DownloadViewModelState` SHALL be an immutable class with fields: `completed` (default `0`), `total` (default `0`), `downloadResult` (default `AsyncData(null)`). It SHALL provide `copyWith`, `progress`, `isDownloading`, and `result` computed getters.

#### Scenario: Default DownloadViewModelState

- **GIVEN** a new `DownloadViewModelState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `completed` SHALL be `0`
- **AND** `total` SHALL be `0`
- **AND** `downloadResult` SHALL be `AsyncData(null)`
- **AND** `isDownloading` SHALL be `false`

### Requirement: DownloadViewModel as Notifier

`DownloadViewModel` SHALL extend the generated `_$DownloadViewModel` (Riverpod `Notifier<DownloadViewModelState>`). `build()` SHALL return `const DownloadViewModelState()`.

#### Scenario: DownloadViewModel initial state

- **GIVEN** `downloadViewModelProvider` is first accessed
- **WHEN** `build()` is called
- **THEN** it SHALL return a `DownloadViewModelState` with all default values
