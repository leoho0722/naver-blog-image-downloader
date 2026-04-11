## MODIFIED Requirements

### Requirement: Download state properties

DownloadViewModel SHALL extend `ChangeNotifier` and manage the download lifecycle through a `DownloadState` enum with three values: `idle`, `downloading`, `completed`. The ViewModel SHALL NOT use a separate boolean flag for the downloading state.

DownloadViewModel SHALL call `notifyListeners()` after every state change.

DownloadViewModel SHALL expose the following read-only properties:
- `completed` (int) — the number of photos that have been downloaded
- `total` (int) — the total number of photos to download
- `progress` (double) — the download progress as a value between 0.0 and 1.0
- `isDownloading` (bool) — convenience getter, `true` when state is `downloading`
- `downloadState` (DownloadState) — the current download state enum value
- `result` (DownloadBatchResult?) — the result of the last download operation

#### Scenario: Initial state

- **WHEN** a new `DownloadViewModel` is created
- **THEN** `downloadState` SHALL be `DownloadState.idle`
- **AND** `isDownloading` SHALL be `false`
- **AND** `completed` SHALL be `0`
- **AND** `total` SHALL be `0`
- **AND** `result` SHALL be `null`

#### Scenario: Download lifecycle

- **GIVEN** download state is `idle`
- **WHEN** `startDownload` is called with a list of photos
- **THEN** state SHALL transition: `idle` → `downloading` → `completed`
- **AND** `isDownloading` SHALL be `true` during the `downloading` phase
- **AND** `result` SHALL hold the `DownloadBatchResult` after completion

#### Scenario: Duplicate download prevention

- **GIVEN** download state is `downloading`
- **WHEN** `startDownload` is called again
- **THEN** the method SHALL return immediately without starting another download
