## ADDED Requirements

### Requirement: Saving progress popup dialog

The `PhotoGalleryView` SHALL display a non-dismissible `AlertDialog` popup when `viewModel.isSaving` transitions from `false` to `true`. The dialog SHALL contain a `CircularProgressIndicator` and a text label. The photo grid SHALL remain visible behind the dialog barrier.

The dialog SHALL be dismissed automatically when `viewModel.isSaving` transitions from `true` to `false`.

The `_PhotoGalleryViewState` SHALL use a ViewModel listener (not the `build` method) to detect `isSaving` state changes and manage the dialog lifecycle. A `_isSavingDialogOpen` flag SHALL track whether the dialog is currently displayed to prevent duplicate dialogs.

The `Scaffold.body` SHALL NOT use `isSaving` as a condition to replace the `GridView` with a loading indicator. The body SHALL always render the `GridView` (or empty state) regardless of the saving state.

#### Scenario: Saving starts and dialog appears

- **GIVEN** the user is on the PhotoGalleryView with photos displayed
- **WHEN** `viewModel.isSaving` changes to `true`
- **THEN** a non-dismissible `AlertDialog` SHALL be displayed with a `CircularProgressIndicator` and text label
- **AND** the photo grid SHALL remain visible behind the dialog barrier

#### Scenario: Saving completes and dialog dismissed

- **GIVEN** the saving progress dialog is displayed
- **WHEN** `viewModel.isSaving` changes to `false`
- **THEN** the dialog SHALL be dismissed automatically

#### Scenario: Dialog cannot be dismissed by user

- **GIVEN** the saving progress dialog is displayed
- **WHEN** the user taps outside the dialog or presses the back button
- **THEN** the dialog SHALL NOT be dismissed

#### Scenario: Grid remains visible during save

- **GIVEN** a save operation is in progress
- **WHEN** the `build` method is called
- **THEN** the `Scaffold.body` SHALL render the `GridView` (not a loading indicator)
