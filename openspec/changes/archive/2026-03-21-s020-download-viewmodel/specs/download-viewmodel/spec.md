## ADDED Requirements

### Requirement: Download state properties

The `DownloadViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts a `PhotoRepository` instance via the `required` named parameter `photoRepository`.

The ViewModel SHALL expose the following read-only properties:
- `completed` (int) — the number of photos that have finished downloading
- `total` (int) — the total number of photos to download
- `isDownloading` (bool) — whether a download operation is in progress
- `result` (DownloadBatchResult?) — the batch download result, or null
- `progress` (double) — the download progress ratio from 0.0 to 1.0

#### Scenario: Initial state

- **WHEN** a new `DownloadViewModel` is created
- **THEN** `completed` SHALL be `0`
- **AND** `total` SHALL be `0`
- **AND** `isDownloading` SHALL be `false`
- **AND** `result` SHALL be `null`
- **AND** `progress` SHALL be `0.0`

### Requirement: Progress calculation

The `progress` getter SHALL compute the download progress as `completed / total`.

#### Scenario: Progress with valid total

- **GIVEN** `total` is greater than 0
- **WHEN** `progress` is accessed
- **THEN** the value SHALL equal `completed / total` as a double

#### Scenario: Progress with zero total

- **GIVEN** `total` is `0`
- **WHEN** `progress` is accessed
- **THEN** the value SHALL be `0.0`

### Requirement: Start download with progress tracking

The `startDownload` method SHALL accept `required List<PhotoEntity> photos` and `required String blogId` parameters, set the downloading state, invoke `PhotoRepository.downloadAllToCache`, track progress via callback, and store the result.

#### Scenario: Successful batch download

- **GIVEN** a list of `PhotoEntity` objects and a `blogId`
- **WHEN** `startDownload` is called
- **THEN** `isDownloading` SHALL be set to `true` before the repository call
- **AND** `total` SHALL be set to the length of the photos list
- **AND** `completed` SHALL be updated incrementally as each photo completes
- **AND** `notifyListeners` SHALL be called on each progress update
- **AND** after the repository call completes, `result` SHALL hold the returned `DownloadBatchResult`
- **AND** `isDownloading` SHALL be set to `false`

#### Scenario: Duplicate download prevention

- **GIVEN** `isDownloading` is `true`
- **WHEN** `startDownload` is called again
- **THEN** the method SHALL return immediately without starting another download
