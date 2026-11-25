## ADDED Requirements

### Requirement: Accessible image viewer controls

The ImageViewer thumbnail strip SHALL render each thumbnail as a `<button type="button">` whose accessible name comes from the localized key `viewerThumbnail` with the 1-based photo number, and the thumbnail of the photo currently shown SHALL carry `aria-current="true"`. Activating a thumbnail button with a pointer, Enter, or Space SHALL show that photo and reset zoom to 1x. Thumbnail images SHALL use `loading="lazy"` and `fetchpriority="low"` so that opening the viewer does not download every photo at once, and the main image SHALL use `fetchpriority="high"`. The dialog's accessible name and the zoom buttons' accessible names SHALL use the localized keys `viewerLabel`, `viewerZoomIn`, and `viewerZoomOut`. While the image is at 1x zoom, the image area SHALL use `touch-action: pan-y` so that horizontal swipes reach the swipe handler; while zoomed beyond 1x it SHALL use `touch-action: none` for drag panning. Arrow keys and the plus and minus keys SHALL keep working while focus is on any control inside the viewer.

#### Scenario: Jump to a photo with the keyboard

- **WHEN** the viewer shows photo 1 of 5, the user moves focus to the third thumbnail with Tab, and presses Enter
- **THEN** the viewer shows photo 3 of 5 at 1x zoom and the third thumbnail has `aria-current="true"`

#### Scenario: Thumbnails do not compete with the main image

- **WHEN** the viewer opens on a gallery with 120 photos
- **THEN** every thumbnail `<img>` has `loading="lazy"` and `fetchpriority="low"`, and the main `<img>` has `fetchpriority="high"`

#### Scenario: Localized accessible names

- **WHEN** the locale is `en` and the viewer is open
- **THEN** the dialog is named by the English `viewerLabel` text and the zoom buttons by the English `viewerZoomIn` and `viewerZoomOut` texts

#### Scenario: Arrow keys work from a focused control

- **WHEN** focus is on the viewer's close button and the user presses the right arrow key
- **THEN** the viewer shows the next photo
