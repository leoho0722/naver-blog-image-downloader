## ADDED Requirements

### Requirement: URL text input with paste button

The BlogInputForm SHALL provide a text input field for entering Naver Blog URLs and a paste button that reads from `navigator.clipboard.readText()`. The input field SHALL display a placeholder hint showing the expected URL format.

#### Scenario: User types a URL

- **WHEN** user types `https://blog.naver.com/user/12345` into the input field
- **THEN** the input value updates to the typed URL

#### Scenario: User clicks paste button

- **WHEN** user clicks the paste button and clipboard contains `https://blog.naver.com/user/12345`
- **THEN** the input field is populated with the clipboard content

#### Scenario: Clipboard is empty

- **WHEN** user clicks the paste button and clipboard is empty
- **THEN** a toast notification informs the user that the clipboard is empty

### Requirement: Drag-and-drop URL support

The BlogInputForm SHALL accept URLs dragged and dropped onto the input area. The component SHALL extract text from the `DataTransfer` object and validate it as a Naver Blog URL.

#### Scenario: Valid URL dropped

- **WHEN** user drops text `https://blog.naver.com/user/12345` onto the input area
- **THEN** the input field is populated with the dropped URL

#### Scenario: Invalid text dropped

- **WHEN** user drops non-URL text onto the input area
- **THEN** the input is rejected and the field remains unchanged

### Requirement: URL validation before submission

The BlogInputForm SHALL validate the URL using the Naver URL validator before submission. Invalid URLs SHALL prevent submission and display an error message. Empty URLs SHALL show an empty URL error.

#### Scenario: Submit valid URL

- **WHEN** user enters a valid Naver Blog URL and clicks the fetch button
- **THEN** the fetch process begins

#### Scenario: Submit invalid URL

- **WHEN** user enters `https://example.com` and clicks the fetch button
- **THEN** an error message is displayed and no API call is made

#### Scenario: Submit empty URL

- **WHEN** user clicks the fetch button with an empty input
- **THEN** an empty URL error message is displayed

### Requirement: Clipboard detection on window focus

The BlogInputForm SHALL listen for `window focus` events and check the clipboard for Naver Blog URLs. When a valid URL is detected, the user SHALL be prompted to paste it.

#### Scenario: Valid URL detected in clipboard on focus

- **WHEN** user switches back to the browser tab and clipboard contains a valid Naver Blog URL
- **THEN** a prompt appears asking if the user wants to paste the URL

### Requirement: Fetch photos with three-phase progress

The BlogInputForm SHALL call `submitJob(blogUrl)` to initiate photo extraction and then poll `checkJobStatus(jobId)` every 3 seconds (max 200 attempts). The UI SHALL display three progress phases: submitting, processing, and completed. On success, the app SHALL navigate to `/gallery/:blogId`.

#### Scenario: Successful fetch with navigation

- **WHEN** user submits a valid URL and the job completes with 10 images
- **THEN** the progress indicator shows submitting → processing → completed, then navigates to `/gallery/<blogId>`

#### Scenario: Fetch timeout after max attempts

- **WHEN** polling reaches 200 attempts without completion
- **THEN** a timeout error is displayed to the user

#### Scenario: Fetch failure from server

- **WHEN** the server returns job status "failed"
- **THEN** an error dialog displays the server error message
