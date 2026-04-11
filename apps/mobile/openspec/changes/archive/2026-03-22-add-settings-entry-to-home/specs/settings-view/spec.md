## ADDED Requirements

### Requirement: AppBar close button without back navigation

The `SettingsView` AppBar SHALL set `automaticallyImplyLeading` to `false` to hide the default back button on the left side.

The AppBar SHALL display a close icon button (`Icons.close`) in the `actions` area on the right side. When tapped, the close button SHALL call `Navigator.of(context).pop()` to dismiss the sheet.

#### Scenario: No back button on the left

- **GIVEN** the SettingsView is presented as a modal bottom sheet
- **WHEN** the page renders
- **THEN** the AppBar SHALL NOT display a back button on the left side

#### Scenario: Close button is visible on the right

- **GIVEN** the SettingsView is presented as a modal bottom sheet
- **WHEN** the page renders
- **THEN** the AppBar SHALL display a close icon button on the right side

#### Scenario: Tapping close button dismisses the sheet

- **GIVEN** the SettingsView is presented as a modal bottom sheet
- **WHEN** the user taps the close button
- **THEN** the sheet SHALL be dismissed via `Navigator.of(context).pop()`
