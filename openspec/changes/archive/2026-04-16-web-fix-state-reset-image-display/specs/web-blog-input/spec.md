## MODIFIED Requirements

### Requirement: Fetch photos with three-phase progress

The BlogInputForm SHALL call `submitJob(blogUrl)` to initiate photo extraction and then poll `checkJobStatus(jobId)` every 3 seconds (max 200 attempts). The UI SHALL display three progress phases: submitting, processing, and completed. On success, the HomePage effect SHALL first call `navigate()` to `/gallery/:blogId` with `fetchResult` and `jobId` as router state, then call `reset()` to clear the blog input store. The store reset MUST NOT occur before navigation is queued. Photo filenames extracted from image URLs SHALL be decoded via `decodeURIComponent()` before storage in the `PhotoEntity.filename` field.

#### Scenario: Successful fetch with navigation

- **WHEN** user submits a valid URL and the job completes with 10 images
- **THEN** the progress indicator shows submitting → processing → completed, then navigates to `/gallery/<blogId>` with `fetchResult` and `jobId` in router state

#### Scenario: Store reset after navigation

- **WHEN** the HomePage effect detects `fetchPhase === "completed"` with a non-null `fetchResult`
- **THEN** `navigate()` is called first, then `reset()` clears `blogUrl`, `fetchPhase`, `fetchResult`, and `jobId`

#### Scenario: Encoded filename decoding

- **WHEN** an image URL path segment contains URL-encoded characters (e.g., `%EC%82%AC%EC%A7%84.jpg`)
- **THEN** the `PhotoEntity.filename` stores the decoded string (e.g., `1_사진.jpg`)

#### Scenario: Fetch timeout after max attempts

- **WHEN** polling reaches 200 attempts without completion
- **THEN** a timeout error is displayed to the user

#### Scenario: Fetch failure from server

- **WHEN** the server returns job status "failed"
- **THEN** an error dialog displays the server error message
