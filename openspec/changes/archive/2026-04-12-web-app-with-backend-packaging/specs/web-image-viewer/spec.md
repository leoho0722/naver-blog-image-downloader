## ADDED Requirements

### Requirement: Full-screen image overlay

The ImageViewer SHALL render as a full-viewport overlay on top of the gallery. It SHALL display the current image using an `<img>` tag with the Naver CDN URL. A close button and photo counter (e.g., "3 / 15") SHALL be visible.

#### Scenario: Open image viewer from gallery

- **WHEN** user clicks a photo in the gallery (outside selection mode)
- **THEN** a full-viewport overlay appears showing the photo at full size with a close button and counter

#### Scenario: Close image viewer

- **WHEN** user clicks the close button
- **THEN** the overlay closes and the gallery is visible again

### Requirement: Zoom via CSS transforms

The ImageViewer SHALL support zoom using CSS `transform: scale()` and `translate()`. Mouse scroll wheel SHALL zoom in/out. Plus (+) and minus (-) keys SHALL zoom in/out. Double-click SHALL toggle between 1x and 2x zoom. Pinch-to-zoom SHALL be supported on touch devices.

#### Scenario: Zoom in with mouse wheel

- **WHEN** user scrolls the mouse wheel up on the image
- **THEN** the image scale increases (zoom in)

#### Scenario: Zoom with keyboard shortcuts

- **WHEN** user presses the `+` key
- **THEN** the image scale increases by one step

#### Scenario: Double-click toggle zoom

- **WHEN** user double-clicks the image at 1x zoom
- **THEN** the image zooms to 2x centered on the click point

#### Scenario: Pinch-to-zoom on touch device

- **WHEN** user performs a pinch-out gesture on the image
- **THEN** the image scale increases proportionally to the gesture

### Requirement: Pan zoomed images

The ImageViewer SHALL allow panning (dragging) when the image is zoomed beyond 1x. Panning SHALL use CSS `transform: translate()` and respond to mouse drag and touch drag events.

#### Scenario: Pan zoomed image with mouse

- **WHEN** user clicks and drags on a zoomed image
- **THEN** the visible portion of the image moves with the drag direction

### Requirement: Navigate between photos

The ImageViewer SHALL support navigating to the previous/next photo. Left arrow key and left swipe gesture SHALL go to the previous photo. Right arrow key and right swipe gesture SHALL go to the next photo. Navigation SHALL reset zoom to 1x.

#### Scenario: Navigate with arrow keys

- **WHEN** user presses the right arrow key while viewing photo 3 of 15
- **THEN** the viewer displays photo 4 of 15 and the counter updates

#### Scenario: Navigate with swipe gesture

- **WHEN** user swipes left on a touch device
- **THEN** the viewer displays the next photo

#### Scenario: Navigate resets zoom

- **WHEN** user is zoomed to 3x and presses the right arrow key
- **THEN** the next photo is displayed at 1x zoom

#### Scenario: Close with Escape key

- **WHEN** user presses the Escape key
- **THEN** the image viewer closes
