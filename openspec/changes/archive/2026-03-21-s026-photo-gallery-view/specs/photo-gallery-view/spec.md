## ADDED Requirements

### Requirement: GridView gallery layout

The `PhotoGalleryView` SHALL render a `GridView` widget to display photo cards in a grid layout. Each cell in the grid SHALL contain a `PhotoCard` widget. The GridView SHALL use a builder pattern for efficient rendering of large photo collections.

#### Scenario: Gallery renders grid of photos

- **WHEN** the PhotoGalleryView is rendered with a list of photos
- **THEN** a GridView SHALL display PhotoCard widgets in a grid layout

#### Scenario: Empty gallery

- **WHEN** the photo list is empty
- **THEN** the GridView SHALL render with no children

### Requirement: PhotoCard thumbnail display

The `PhotoCard` SHALL display a thumbnail image using `Image.file` with the cached file. The `cacheWidth` SHALL be set to 200 to reduce memory usage. The `fit` property SHALL be set to `BoxFit.cover` to fill the card area.

#### Scenario: Cached file available

- **WHEN** `cachedFile` is not null
- **THEN** an Image.file widget SHALL be rendered with `fit: BoxFit.cover` and `cacheWidth: 200`

#### Scenario: Cached file not available

- **WHEN** `cachedFile` is null
- **THEN** no Image.file widget SHALL be rendered

### Requirement: PhotoCard select mode checkbox

The `PhotoCard` SHALL display a `Checkbox` in the top-right corner when `isSelectMode` is true. The Checkbox `value` SHALL reflect the `isSelected` property. The Checkbox SHALL be positioned using `Positioned(top: 4, right: 4)` within a `Stack` with `StackFit.expand`.

#### Scenario: Select mode enabled

- **WHEN** `isSelectMode` is true
- **THEN** a Checkbox SHALL be visible at the top-right corner with value matching `isSelected`

#### Scenario: Select mode disabled

- **WHEN** `isSelectMode` is false
- **THEN** no Checkbox SHALL be displayed

### Requirement: PhotoCard tap behavior

The `PhotoCard` SHALL use a `GestureDetector` to handle tap events. When `isSelectMode` is true, tapping SHALL invoke the `onSelect` callback. When `isSelectMode` is false, tapping SHALL invoke the `onTap` callback.

#### Scenario: Tap in select mode

- **WHEN** `isSelectMode` is true and the user taps the PhotoCard
- **THEN** the `onSelect` callback SHALL be invoked

#### Scenario: Tap in normal mode

- **WHEN** `isSelectMode` is false and the user taps the PhotoCard
- **THEN** the `onTap` callback SHALL be invoked
