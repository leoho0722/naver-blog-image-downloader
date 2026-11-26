## MODIFIED Requirements

### Requirement: Download progress dialog

The DownloadProgress component SHALL display a native modal dialog while a packaging request is active. While packaging, the dialog SHALL show the localized packaging text and hint together with an indeterminate native `<progress>` element whose accessible name is the packaging text; under `prefers-reduced-motion: reduce` the indeterminate animation SHALL slow down instead of stopping. While packaging, Escape and other close requests SHALL NOT close the dialog. When packaging completes, the browser download SHALL be triggered automatically and the dialog SHALL show a success summary with the photo count and an OK button. When packaging fails, the dialog SHALL show the error message and a close button. The success and failure messages SHALL be rendered inside a `role="status"` region so that assistive technologies announce them. In the completed and failed states, activating the OK or close button, or pressing Escape, SHALL close the dialog and reset the download state to idle.

#### Scenario: Show packaging progress

- **WHEN** packaging is in progress
- **THEN** a modal dialog displays the packaging text with an indeterminate `<progress>` element named by that text

#### Scenario: Escape is ignored while packaging

- **WHEN** packaging is in progress and the user presses Escape
- **THEN** the dialog stays open and packaging continues

#### Scenario: Completion triggers the download and shows a summary

- **WHEN** the download URL is obtained for a package of 12 photos
- **THEN** the browser navigates to the download URL and the dialog shows the success summary for 12 photos with an OK button inside a status region

#### Scenario: Show error with close button

- **WHEN** packaging fails
- **THEN** the dialog shows the error message inside a status region and a close button

#### Scenario: Escape closes after completion or failure

- **WHEN** the dialog shows the success summary or the error message and the user presses Escape
- **THEN** the dialog closes and the download phase returns to idle
