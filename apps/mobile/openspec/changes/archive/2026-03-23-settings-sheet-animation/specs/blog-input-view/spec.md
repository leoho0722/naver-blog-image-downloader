## MODIFIED Requirements

### Requirement: Settings navigation button in AppBar

The AppBar SHALL display a settings icon button (`Icons.settings`) in the `actions` area.

When tapped, the button SHALL present the `SettingsView` as a modal bottom sheet with `isScrollControlled: true`, `useSafeArea: true`, top-left and top-right rounded corners (radius 16), `Clip.antiAlias`, and a custom `transitionAnimationController` created by `BottomSheetAnimation.createController` with platform-specific durations.

The `_BlogInputViewState` SHALL mix in `SingleTickerProviderStateMixin` to provide `vsync` for the `AnimationController`. The `AnimationController` SHALL be created in `initState` using `defaultTargetPlatform` for platform detection and SHALL be disposed in `dispose` before `super.dispose()`. The same `AnimationController` instance SHALL be reused across multiple sheet presentations.

#### Scenario: Settings button is visible

- **GIVEN** the user is on the BlogInputView (home page)
- **WHEN** the page renders
- **THEN** the AppBar SHALL display a settings icon button on the right side

#### Scenario: Tapping settings button presents settings sheet with custom animation

- **GIVEN** the user is on the BlogInputView
- **WHEN** the user taps the settings icon button
- **THEN** the app SHALL present SettingsView as a modal bottom sheet with rounded top corners and a platform-specific `transitionAnimationController`

#### Scenario: Animation controller uses platform-specific durations

- **GIVEN** the app is running on iOS
- **WHEN** the settings sheet is presented
- **THEN** the sheet enter animation SHALL use a 500ms duration and the exit animation SHALL use a 350ms duration

#### Scenario: Animation controller uses Android durations

- **GIVEN** the app is running on Android
- **WHEN** the settings sheet is presented
- **THEN** the sheet enter animation SHALL use a 400ms duration and the exit animation SHALL use a 250ms duration

#### Scenario: User can dismiss settings sheet

- **GIVEN** the settings sheet is presented
- **WHEN** the user swipes down or taps the close button
- **THEN** the sheet SHALL be dismissed with the reverse animation and the user SHALL return to the BlogInputView

#### Scenario: Animation controller reused across presentations

- **GIVEN** the settings sheet has been previously presented and dismissed
- **WHEN** the user taps the settings icon button again
- **THEN** the same `AnimationController` instance SHALL be reused for the new presentation
