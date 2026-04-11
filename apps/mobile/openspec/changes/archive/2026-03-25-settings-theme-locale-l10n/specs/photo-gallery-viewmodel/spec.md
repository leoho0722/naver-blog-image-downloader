## ADDED Requirements

### Requirement: Error type enum for gallery operations

The `PhotoGalleryViewModel` SHALL use an enum-based error type instead of hardcoded error message strings. The view SHALL be responsible for mapping error types to localized messages.

#### Scenario: Save failure returns error type

- **WHEN** a save-to-gallery operation fails
- **THEN** the ViewModel SHALL expose an error type value instead of a hardcoded Chinese string
- **AND** the view SHALL map the error type to a localized message via `AppLocalizations`
