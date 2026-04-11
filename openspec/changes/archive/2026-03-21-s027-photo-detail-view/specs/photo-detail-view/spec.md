## ADDED Requirements

### Requirement: Full-resolution image display

The `PhotoDetailView` SHALL render the photo using `Image.file` at its original resolution without setting `cacheWidth`. The image SHALL be loaded from the local cached file provided by the ViewModel.

#### Scenario: Photo rendered at full resolution

- **WHEN** the PhotoDetailView is rendered with a valid photo file
- **THEN** an Image.file widget SHALL display the photo at its original resolution

#### Scenario: Photo file available from ViewModel

- **WHEN** the ViewModel provides a cached photo file
- **THEN** the Image.file widget SHALL use that file as its source

### Requirement: InteractiveViewer gesture zoom

The `PhotoDetailView` SHALL wrap the image in an `InteractiveViewer` widget to enable pinch-to-zoom gesture interaction. The InteractiveViewer SHALL allow the user to zoom in, zoom out, and pan the image.

#### Scenario: Pinch-to-zoom enabled

- **WHEN** the user performs a pinch gesture on the photo
- **THEN** the InteractiveViewer SHALL zoom the image in or out accordingly

#### Scenario: Pan enabled

- **WHEN** the user drags the zoomed-in photo
- **THEN** the InteractiveViewer SHALL pan the image to follow the drag gesture
