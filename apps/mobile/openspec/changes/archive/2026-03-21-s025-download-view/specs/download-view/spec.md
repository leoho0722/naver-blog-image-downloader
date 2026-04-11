## ADDED Requirements

### Requirement: DownloadDialog as AlertDialog popup

The `DownloadDialog` SHALL be an `AlertDialog` popup (not a routed page). It SHALL render download progress UI within the dialog content.

#### Scenario: Dialog displayed as AlertDialog

- **WHEN** the download flow is triggered
- **THEN** a `DownloadDialog` SHALL be shown as an `AlertDialog` popup

### Requirement: Circular progress indicator with value

The `DownloadDialog` SHALL render a `CircularProgressIndicator` with its `value` property bound to `viewModel.progress`. The progress value SHALL range from 0.0 to 1.0, representing the download completion ratio.

#### Scenario: Progress indicator reflects download progress

- **WHEN** the DownloadDialog is rendered
- **THEN** a CircularProgressIndicator SHALL be displayed with `value` equal to `viewModel.progress`

#### Scenario: Progress updates in real time

- **WHEN** `viewModel.progress` changes during download
- **THEN** the CircularProgressIndicator SHALL update to reflect the new progress value

### Requirement: Completed count and total count text

The `DownloadDialog` SHALL display a text showing the number of completed downloads and the total count in the format `"${viewModel.completed} / ${viewModel.total}"`.

#### Scenario: Count text displayed

- **WHEN** the DownloadDialog is rendered
- **THEN** a Text widget SHALL display the completed and total counts in "completed / total" format

### Requirement: Download status text

The `DownloadDialog` SHALL display a status text that reads "下載中..." when `viewModel.isDownloading` is true, and "下載完成" when `viewModel.isDownloading` is false.

#### Scenario: Downloading in progress

- **WHEN** `viewModel.isDownloading` is true
- **THEN** the status text SHALL display "下載中..."

#### Scenario: Download completed

- **WHEN** `viewModel.isDownloading` is false
- **THEN** the status text SHALL display "下載完成"

### Requirement: Failed count display

The `DownloadDialog` SHALL display the number of failed photo downloads when `viewModel.result` is not null and `viewModel.result.isAllSuccessful` is false. The text SHALL follow the format `"${viewModel.result.failedPhotos.length} 張下載失敗"`.

#### Scenario: All downloads successful

- **WHEN** `viewModel.result` is null or `viewModel.result.isAllSuccessful` is true
- **THEN** no failure count text SHALL be displayed

#### Scenario: Some downloads failed

- **WHEN** `viewModel.result` is not null and `viewModel.result.isAllSuccessful` is false
- **THEN** a Text widget SHALL display the number of failed photos followed by "張下載失敗"

### Requirement: Auto-close on completion

The `DownloadDialog` SHALL automatically close via `Navigator.pop(true)` when the download process completes. The caller SHALL handle navigation to the gallery page.

#### Scenario: Download finishes

- **WHEN** the download process completes (all photos downloaded or attempted)
- **THEN** the dialog SHALL auto-close via `Navigator.pop(true)`
- **AND** the caller SHALL be responsible for navigating to the photo gallery page
