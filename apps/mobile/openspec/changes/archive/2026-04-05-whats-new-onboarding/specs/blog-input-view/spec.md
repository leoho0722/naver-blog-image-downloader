## ADDED Requirements

### Requirement: What's New check on first frame

`BlogInputView` SHALL add a `WidgetsBinding.instance.addPostFrameCallback` in `initState()` that reads the `WhatsNewViewModel` state. If the resolved state is `WhatsNewOnboarding` or `WhatsNewUpdate`, the view SHALL call `showWhatsNewDialog()` to display the fullscreen dialog, then call `WhatsNewViewModel.dismiss()` after the dialog closes. If the state is `WhatsNewHidden`, no dialog SHALL be shown.

#### Scenario: Onboarding shown on first install

- **GIVEN** a fresh install with no stored `lastSeenVersion`
- **WHEN** `BlogInputView` mounts and the first frame completes
- **THEN** the onboarding fullscreen dialog SHALL be displayed

#### Scenario: What's New shown after update

- **GIVEN** the stored `lastSeenVersion` differs from the current version
- **AND** the current version has a registry entry
- **WHEN** `BlogInputView` mounts and the first frame completes
- **THEN** the What's New fullscreen dialog SHALL be displayed

#### Scenario: No dialog on repeat launch

- **GIVEN** the stored `lastSeenVersion` equals the current version
- **WHEN** `BlogInputView` mounts and the first frame completes
- **THEN** no dialog SHALL be shown
