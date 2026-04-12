## ADDED Requirements

### Requirement: Download triggers backend packaging API

The download flow SHALL call the backend `package` action with `job_id` and optional `indices`. For "Download All", `indices` SHALL be omitted. For "Download Selected", `indices` SHALL contain the indices of selected photos. For single image download, `indices` SHALL contain a single index.

#### Scenario: Trigger download all

- **WHEN** user clicks "Download All as ZIP"
- **THEN** the system sends `{ "action": "package", "job_id": "<id>" }` to the backend

#### Scenario: Trigger download selected

- **WHEN** user has photos at indices 0, 3, 7 selected and clicks "Download Selected as ZIP"
- **THEN** the system sends `{ "action": "package", "job_id": "<id>", "indices": [0, 3, 7] }` to the backend

### Requirement: Poll packaging status until completion

The download flow SHALL poll `package_status` every 3 seconds after submitting a package request. Polling SHALL continue until the status is "completed" or "failed", or until a maximum of 200 attempts.

#### Scenario: Packaging completes successfully

- **WHEN** the packaging status changes from "processing" to "completed"
- **THEN** polling stops and the download URL is obtained

#### Scenario: Packaging fails

- **WHEN** the packaging status changes to "failed"
- **THEN** polling stops and an error message is displayed to the user

#### Scenario: Packaging times out

- **WHEN** polling reaches 200 attempts without completion
- **THEN** a timeout error is displayed to the user

### Requirement: Trigger browser download via pre-signed URL

When packaging is completed, the system SHALL trigger a browser download by setting `window.location.href` to the pre-signed S3 download URL. This approach avoids CORS restrictions since browser navigation is not subject to CORS checks.

#### Scenario: Automatic download after packaging completes

- **WHEN** packaging status is "completed" with a `download_url`
- **THEN** the browser navigates to `download_url`, triggering the ZIP file download

### Requirement: Download progress dialog

The DownloadProgress component SHALL display a modal dialog during the packaging process. It SHALL show "packaging..." text while processing. On completion, the download SHALL trigger automatically. On failure, an error message SHALL be displayed with a retry option.

#### Scenario: Show packaging progress

- **WHEN** packaging is in progress
- **THEN** a modal dialog displays "packaging..." with a loading indicator

#### Scenario: Show error with retry

- **WHEN** packaging fails
- **THEN** the dialog shows an error message and a retry button

#### Scenario: Dialog closes after download triggers

- **WHEN** the download URL is obtained and navigation is triggered
- **THEN** the dialog closes automatically
