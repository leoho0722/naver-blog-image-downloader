## ADDED Requirements

### Requirement: TextEditingController for programmatic text control

The `BlogInputView` SHALL use a `TextEditingController` to manage the TextField's text content. The controller SHALL be initialized in `initState` and disposed in `dispose`. The TextField SHALL bind to the controller via the `controller` property while retaining the `onChanged: viewModel.onUrlChanged` callback for ViewModel synchronization.

#### Scenario: Controller lifecycle

- **GIVEN** the BlogInputView is created
- **WHEN** `initState` is called
- **THEN** a `TextEditingController` SHALL be initialized

#### Scenario: Controller disposal

- **GIVEN** the BlogInputView is being destroyed
- **WHEN** `dispose` is called
- **THEN** the `TextEditingController` SHALL be disposed

### Requirement: Paste button as suffixIcon

The `BlogInputView` TextField SHALL display an `IconButton` with `Icons.content_paste` as the `suffixIcon` in its `InputDecoration`. Tapping the button SHALL read the system clipboard via `Clipboard.getData(Clipboard.kTextPlain)`.

If the clipboard is empty, a `SnackBar` SHALL inform the user that the clipboard has no content.

If the clipboard contains text, the text SHALL be validated using `NaverUrlValidator`. If valid, the text SHALL be set to the `TextEditingController` and `viewModel.onUrlChanged` SHALL be called. If invalid, an `AlertDialog` SHALL display a message informing the user that the clipboard content does not appear to be a Naver Blog URL.

#### Scenario: Paste valid URL from clipboard

- **GIVEN** the clipboard contains a valid Naver Blog URL
- **WHEN** the user taps the paste button
- **THEN** the URL SHALL be set in the TextField and `viewModel.onUrlChanged` SHALL be called with the URL

#### Scenario: Paste invalid content from clipboard

- **GIVEN** the clipboard contains text that is not a valid Naver Blog URL
- **WHEN** the user taps the paste button
- **THEN** an `AlertDialog` SHALL display a message indicating the content is not a valid Naver Blog URL

#### Scenario: Paste with empty clipboard

- **GIVEN** the clipboard is empty
- **WHEN** the user taps the paste button
- **THEN** a `SnackBar` SHALL inform the user that the clipboard has no content

### Requirement: Clipboard URL detection on app resume

The `BlogInputView` SHALL implement `WidgetsBindingObserver` to detect when the app returns to the foreground. On `AppLifecycleState.resumed`, the view SHALL read the clipboard and validate the content using `NaverUrlValidator`.

If the clipboard contains a valid Naver Blog URL that differs from the current TextField content, a `SnackBar` with a "Paste" action button SHALL be displayed. Tapping the action SHALL set the URL in the TextField and call `viewModel.onUrlChanged`.

If the clipboard content is not a valid URL or matches the current TextField content, no action SHALL be taken.

#### Scenario: Valid URL detected on resume

- **GIVEN** the clipboard contains a valid Naver Blog URL different from the current input
- **WHEN** the app returns to the foreground
- **THEN** a `SnackBar` with a "Paste" action SHALL be displayed

#### Scenario: User confirms paste from SnackBar

- **GIVEN** a clipboard detection SnackBar is displayed
- **WHEN** the user taps the "Paste" action
- **THEN** the URL SHALL be set in the TextField and `viewModel.onUrlChanged` SHALL be called

#### Scenario: Same URL already in input

- **GIVEN** the clipboard contains a valid Naver Blog URL identical to the current input
- **WHEN** the app returns to the foreground
- **THEN** no SnackBar SHALL be displayed

#### Scenario: Invalid content on resume

- **GIVEN** the clipboard contains text that is not a valid Naver Blog URL
- **WHEN** the app returns to the foreground
- **THEN** no action SHALL be taken and no UI feedback SHALL be shown
