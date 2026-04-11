## MODIFIED Requirements

### Requirement: Error message displayed

The `BlogInputView` SHALL display an `AlertDialog` when `viewModel.errorMessage` becomes non-null. The dialog title SHALL be "發生錯誤" and the content SHALL display the error message text. The dialog SHALL have a single "好的" `TextButton` to dismiss it. After the dialog is shown, the view SHALL clear the error state to prevent duplicate dialogs. The error detection SHALL occur in the ViewModel listener callback, not in the `build` method. The view SHALL NOT display error messages as inline red `Text` widgets.

#### Scenario: No error present

- **GIVEN** `viewModel.errorMessage` is null
- **WHEN** the BlogInputView is rendered
- **THEN** no error dialog SHALL be displayed

#### Scenario: Error message triggers dialog

- **GIVEN** the BlogInputView is active
- **WHEN** `viewModel.errorMessage` changes to a non-null value
- **THEN** an `AlertDialog` SHALL be displayed with title "發生錯誤" and the error message as content

#### Scenario: Error dialog dismissed

- **GIVEN** an error `AlertDialog` is displayed
- **WHEN** the user taps the "好的" button
- **THEN** the dialog SHALL be dismissed
