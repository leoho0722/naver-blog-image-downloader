## ADDED Requirements

### Requirement: Settings navigation button in AppBar

The AppBar SHALL display a settings icon button (`Icons.settings`) in the `actions` area.

When tapped, the button SHALL present the `SettingsView` as a modal bottom sheet with `isScrollControlled: true`, `useSafeArea: true`, top-left and top-right rounded corners (radius 16), and `Clip.antiAlias`.

#### Scenario: Settings button is visible

- **GIVEN** the user is on the BlogInputView (home page)
- **WHEN** the page renders
- **THEN** the AppBar SHALL display a settings icon button on the right side

#### Scenario: Tapping settings button presents settings sheet

- **GIVEN** the user is on the BlogInputView
- **WHEN** the user taps the settings icon button
- **THEN** the app SHALL present SettingsView as a modal bottom sheet with rounded top corners

#### Scenario: User can dismiss settings sheet

- **GIVEN** the settings sheet is presented
- **WHEN** the user swipes down or taps the close button
- **THEN** the sheet SHALL be dismissed and the user SHALL return to the BlogInputView
