## ADDED Requirements

### Requirement: Responsive photo grid layout

The PhotoGrid SHALL display photos in a responsive CSS grid: 3 columns on mobile (<640px), 4 columns on tablet (640–1024px), and 5–6 columns on desktop (>1024px). Images SHALL use `<img>` tags with Naver CDN URLs directly and `loading="lazy"` for performance.

#### Scenario: Mobile viewport displays 3 columns

- **WHEN** the viewport width is 375px and 10 photos are loaded
- **THEN** the grid renders with 3 columns

#### Scenario: Desktop viewport displays 5+ columns

- **WHEN** the viewport width is 1440px and 10 photos are loaded
- **THEN** the grid renders with 5 or 6 columns

#### Scenario: Lazy loading of images

- **WHEN** the gallery page loads with 50 photos
- **THEN** only visible images are loaded initially; off-screen images load as the user scrolls

### Requirement: Selection mode with individual and batch selection

The gallery SHALL support a selection mode toggled by a button. In selection mode, each photo card SHALL display a checkbox overlay. Users SHALL be able to select individual photos or select all photos at once.

#### Scenario: Toggle selection mode

- **WHEN** user clicks the selection mode button
- **THEN** checkboxes appear on all photo cards

#### Scenario: Select individual photo

- **WHEN** user clicks a photo card in selection mode
- **THEN** that photo is marked as selected with a visual indicator

#### Scenario: Select all photos

- **WHEN** user clicks "Select All" in selection mode
- **THEN** all photos are marked as selected

#### Scenario: Deselect all and exit selection mode

- **WHEN** user clicks the selection mode button again while in selection mode
- **THEN** all selections are cleared and checkboxes disappear

### Requirement: Selection toolbar with download actions

The SelectionToolbar SHALL appear when selection mode is active. It SHALL show the count of selected photos and provide two actions: "Download All as ZIP" and "Download Selected as ZIP" (enabled only when at least one photo is selected).

#### Scenario: Download all as ZIP

- **WHEN** user clicks "Download All as ZIP"
- **THEN** the download flow is triggered for all photos

#### Scenario: Download selected as ZIP

- **WHEN** user has 3 photos selected and clicks "Download Selected as ZIP"
- **THEN** the download flow is triggered for only the 3 selected photos

#### Scenario: Download selected disabled when none selected

- **WHEN** selection mode is active but no photos are selected
- **THEN** the "Download Selected as ZIP" button is disabled

### Requirement: Empty gallery state

The gallery SHALL display a centered message when no photos are available.

#### Scenario: No photos returned from fetch

- **WHEN** the gallery page loads with an empty photos array
- **THEN** a centered "No photos" message is displayed
