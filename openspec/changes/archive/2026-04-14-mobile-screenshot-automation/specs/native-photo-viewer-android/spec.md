## ADDED Requirements

### Requirement: PhotoViewer automation test tags

The Android native photo viewer SHALL expose stable Compose test tags for screenshot automation.

`PhotoViewerScreen` SHALL assign the tag `photo_viewer_pager` to the full-screen `HorizontalPager`.
`CapsuleBottomBar` SHALL assign the tags `photo_viewer_info_button` and `photo_viewer_save_button` to the info and save buttons.

#### Scenario: Pager tag is discoverable

- **WHEN** the Android native photo viewer is presented
- **THEN** UI automation SHALL be able to discover a Compose node tagged `photo_viewer_pager`

#### Scenario: Bottom bar button tags are discoverable

- **WHEN** the Android native photo viewer bottom bar is rendered
- **THEN** UI automation SHALL be able to discover Compose nodes tagged `photo_viewer_info_button` and `photo_viewer_save_button`
