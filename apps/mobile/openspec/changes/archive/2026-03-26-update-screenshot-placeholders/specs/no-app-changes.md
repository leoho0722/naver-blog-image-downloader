## ADDED Requirements

### Requirement: Landing page screenshot display

The GitHub Pages landing page SHALL display actual app screenshots in both the Hero section and the Screenshots section, replacing all placeholder icons.

The Hero section SHALL display an actual app screenshot inside the phone mockup frame.

The Screenshots section SHALL provide platform tabs (iOS / Android) allowing users to switch between platforms. Each screenshot card SHALL display one full-width image for the currently selected platform.

#### Scenario: Hero section displays actual screenshot

- **WHEN** a user visits the GitHub Pages landing page
- **THEN** the Hero section phone mockup displays an actual app screenshot instead of a placeholder icon

#### Scenario: Screenshot cards with platform tabs

- **WHEN** a user visits the Screenshots section
- **THEN** the section displays platform tabs (iOS and Android) with iOS selected by default
- **AND** each of the four screenshot cards displays the iOS version at full width

#### Scenario: Switching platform tab

- **WHEN** a user clicks the Android tab
- **THEN** all four screenshot cards switch to display the Android version
- **AND** the Android tab becomes the active tab
