## ADDED Requirements

### Requirement: PhotoViewer accessibility identifiers

The iOS native photo viewer SHALL expose stable accessibility identifiers for screenshot automation.

`PhotoViewerView` SHALL assign the identifier `photo_viewer_pager` to the full-screen pager.
`CapsuleBottomBar` SHALL assign the identifiers `photo_viewer_info_button` and `photo_viewer_save_button` to the info and save buttons.

#### Scenario: Pager identifier is discoverable

- **WHEN** the iOS native photo viewer is presented
- **THEN** UI automation SHALL be able to discover an element with the accessibility identifier `photo_viewer_pager`

#### Scenario: Bottom bar button identifiers are discoverable

- **WHEN** the iOS native photo viewer bottom bar is rendered
- **THEN** UI automation SHALL be able to discover elements with the accessibility identifiers `photo_viewer_info_button` and `photo_viewer_save_button`
