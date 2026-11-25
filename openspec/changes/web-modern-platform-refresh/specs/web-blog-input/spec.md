## ADDED Requirements

### Requirement: Accessible URL input field

The BlogInputForm URL input SHALL be associated with a visually hidden `<label>` whose text comes from the localized key `blogInputUrlLabel`; the placeholder SHALL remain a format hint only. The input SHALL set `name="blogUrl"`, `required`, `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`, and `enterkeyhint="go"`, and its computed font size SHALL be at least 16px so that iOS Safari does not zoom the page when the input gains focus. The form SHALL set `noValidate` so that validation errors are always reported by the app's localized messages instead of the browser's native validation bubble. When an error message is shown, it SHALL be rendered with `role="alert"` and referenced by the input's `aria-describedby`; for the empty-URL and invalid-URL errors the input SHALL also set `aria-invalid="true"`. The paste button SHALL NOT carry an `aria-label` that duplicates its visible text.

#### Scenario: Input has a programmatic label

- **WHEN** the home page renders the blog input form
- **THEN** the URL input's accessible name is the localized `blogInputUrlLabel` text

#### Scenario: App validation replaces the native bubble

- **WHEN** the user submits `blog.naver.com/user/1` without a scheme
- **THEN** no native validation bubble appears, the localized invalid-URL message is shown with `role="alert"`, and the input has `aria-invalid="true"` and `aria-describedby` pointing at that message

##### Example: error type to input state

| Error type          | `aria-invalid` on input | Message referenced by `aria-describedby` |
| ------------------- | ----------------------- | ---------------------------------------- |
| `emptyUrl`          | `true`                  | yes                                      |
| `invalidUrl`        | `true`                  | yes                                      |
| `networkError`      | absent                  | yes                                      |
| no error            | absent                  | no                                       |

### Requirement: Fetch progress step semantics

FetchProgress SHALL render its three steps (submitting, processing, completed) as an ordered list with `role="list"`, one list item per step, and SHALL mark the list item of the current phase with `aria-current="step"`. Decorative connector lines between steps SHALL be hidden from assistive technologies with `aria-hidden="true"`.

#### Scenario: Current step is announced

- **WHEN** the fetch phase is `processing`
- **THEN** the second list item has `aria-current="step"` and the other two list items have no `aria-current`
