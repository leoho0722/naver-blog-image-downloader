## MODIFIED Requirements

### Requirement: Full-screen image overlay

The ImageViewer SHALL render as a full-viewport overlay on top of the gallery. It SHALL display the current image using an `<img>` tag with the Naver CDN URL and `referrerPolicy="no-referrer"` to prevent Naver CDN from rejecting the request due to a non-Naver `Referer` header. A close button and photo counter (e.g., "3 / 15") SHALL be visible.

#### Scenario: Open image viewer from gallery

- **WHEN** user clicks a photo in the gallery (outside selection mode)
- **THEN** a full-viewport overlay appears showing the photo at full size with a close button and counter

#### Scenario: Close image viewer

- **WHEN** user clicks the close button
- **THEN** the overlay closes and the gallery is visible again

#### Scenario: Image loads with no referrer policy

- **WHEN** the image viewer displays a photo from Naver CDN on a non-Naver domain
- **THEN** the `<img>` tag includes `referrerPolicy="no-referrer"` and the image loads successfully
