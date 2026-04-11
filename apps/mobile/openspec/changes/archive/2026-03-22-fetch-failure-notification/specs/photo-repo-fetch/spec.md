## MODIFIED Requirements

### Requirement: Result wrapping

When `fetchPhotos` completes successfully (job status is `completed`), it SHALL return `Result.ok(FetchResult(...))` with:
- `photos`: the list of `PhotoEntity` converted from the response
- `blogId`: the derived blog identifier
- `blogUrl`: the original blog URL
- `isFullyCached`: the cache status check result
- `totalImages`: the `totalImages` value from `PhotoDownloadResponse`
- `failureDownloads`: the `failureDownloads` value from `PhotoDownloadResponse`
- `fetchErrors`: the `errors` list from `PhotoDownloadResponse`

When the job status is `failed`, it SHALL return `Result.error` with the error message.

When polling exceeds `_maxPollAttempts`, it SHALL return `Result.error` with a timeout message.

#### Scenario: Completed with no fetch errors

- **WHEN** the job status is `completed` and `response.failureDownloads` is `0`
- **THEN** the returned `FetchResult.failureDownloads` SHALL be `0`
- **AND** the returned `FetchResult.fetchErrors` SHALL be an empty list

#### Scenario: Completed with fetch errors

- **WHEN** the job status is `completed` and `response.failureDownloads` is greater than `0`
- **THEN** the returned `FetchResult.totalImages` SHALL match `response.totalImages`
- **AND** the returned `FetchResult.failureDownloads` SHALL match `response.failureDownloads`
- **AND** the returned `FetchResult.fetchErrors` SHALL contain the error messages from `response.errors`
- **AND** the returned `FetchResult.photos` SHALL still contain the successfully fetched photos

#### Scenario: Failed job status

- **WHEN** the job status is `failed`
- **THEN** `Result.error` SHALL be returned with the error message
