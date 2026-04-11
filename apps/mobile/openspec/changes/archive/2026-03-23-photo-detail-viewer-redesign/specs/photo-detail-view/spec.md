## ADDED Requirements

### Requirement: Stack-based layout with PageView

The `PhotoDetailView` SHALL use a `Stack` as the body layout. The bottom layer SHALL be a `PageView.builder` that fills the entire screen. The PageView SHALL display photos using `InteractiveViewer` wrapping `Center(child: Image.file(fit: BoxFit.contain))`.

#### Scenario: Photo displayed in PageView

- **WHEN** the PhotoDetailView is rendered with a loaded ViewModel
- **THEN** a `PageView.builder` SHALL display the current photo centered on screen
- **AND** the photo SHALL be wrapped in an `InteractiveViewer` for pinch-to-zoom

### Requirement: Immersive mode toggle

The `PhotoDetailView` SHALL support two display modes: browse mode and immersive mode. Tapping the photo SHALL toggle between modes. In browse mode, the top overlay bar and bottom capsule bar SHALL be visible. In immersive mode, both overlays SHALL be hidden and the background SHALL be black.

#### Scenario: Toggle to immersive mode

- **WHEN** the user taps the photo in browse mode
- **THEN** the top overlay bar SHALL slide out upward via `AnimatedSlide`
- **AND** the bottom capsule bar SHALL slide out downward via `AnimatedSlide`
- **AND** the scaffold background SHALL change to black
- **AND** `SystemChrome.setEnabledSystemUIMode` SHALL be called with `SystemUiMode.immersiveSticky`

#### Scenario: Toggle back to browse mode

- **WHEN** the user taps the photo in immersive mode
- **THEN** the top overlay bar and bottom capsule bar SHALL slide back to their original positions
- **AND** the scaffold background SHALL return to the theme scaffold color
- **AND** `SystemChrome.setEnabledSystemUIMode` SHALL be called with `SystemUiMode.edgeToEdge`

#### Scenario: Restore system UI on dispose

- **WHEN** the PhotoDetailView is disposed
- **THEN** `SystemChrome.setEnabledSystemUIMode` SHALL be called with `SystemUiMode.edgeToEdge`

### Requirement: Horizontal swipe navigation

The `PhotoDetailView` SHALL support horizontal swiping to navigate between photos using `PageView.builder`. The `onPageChanged` callback SHALL call `viewModel.setCurrentIndex()` and reset the `TransformationController` to `Matrix4.identity()`.

#### Scenario: Swipe to next photo

- **WHEN** the user swipes left on the current photo
- **THEN** the PageView SHALL animate to the next photo
- **AND** `viewModel.setCurrentIndex` SHALL be called with the new index

#### Scenario: Swipe blocked when zoomed

- **WHEN** the InteractiveViewer scale is greater than 1.01
- **THEN** the PageView physics SHALL be `NeverScrollableScrollPhysics`
- **AND** drag gestures SHALL be handled by the InteractiveViewer for panning

#### Scenario: Swipe enabled when not zoomed

- **WHEN** the InteractiveViewer scale returns to approximately 1.0
- **THEN** the PageView physics SHALL revert to `PageScrollPhysics`

### Requirement: Top overlay bar

The `PhotoDetailView` SHALL display a top overlay bar with a gradient background (black to transparent), containing a back button and a page indicator showing `"currentIndex + 1 / totalCount"`. The overlay SHALL animate via `AnimatedSlide` based on the immersive mode state.

#### Scenario: Page indicator displayed

- **WHEN** the PhotoDetailView is in browse mode
- **THEN** the top overlay bar SHALL display the current page number and total count

### Requirement: Capsule bottom bar

The `PhotoDetailView` SHALL display a `PhotoDetailCapsuleBar` widget at the bottom, containing an info button and a save button within a pill-shaped container. The capsule SHALL animate via `AnimatedSlide` based on the immersive mode state. The capsule SHALL respect the safe area bottom padding.

#### Scenario: Capsule bar displayed in browse mode

- **WHEN** the PhotoDetailView is in browse mode
- **THEN** the `PhotoDetailCapsuleBar` SHALL be visible at the bottom of the screen
- **AND** it SHALL contain an info button and a save button separated by a vertical divider

#### Scenario: Capsule bar hidden in immersive mode

- **WHEN** the PhotoDetailView is in immersive mode
- **THEN** the `PhotoDetailCapsuleBar` SHALL be hidden via `AnimatedSlide` offset

### Requirement: Navigation data format

The `PhotoDetailView` SHALL receive navigation data via GoRouter `extra` as a record of type `({List<PhotoEntity> photos, String blogId, int initialIndex})`. In `didChangeDependencies`, it SHALL extract this record and call `viewModel.loadAll()` via `addPostFrameCallback`.

#### Scenario: Data loaded from navigation extra

- **WHEN** the PhotoDetailView is rendered with a valid extra record
- **THEN** `viewModel.loadAll` SHALL be called with the photos list, blogId, and initialIndex
- **AND** the `PageController` SHALL be initialized with `initialPage` set to `initialIndex`

## MODIFIED Requirements

### Requirement: Full-resolution image display

The `PhotoDetailView` SHALL render the photo using `Image.file` at its original resolution without setting `cacheWidth`. The image SHALL be loaded from the local cached file provided by the ViewModel's metadata cache for the current index. The image SHALL be centered using `Center` widget with `BoxFit.contain`.

#### Scenario: Photo rendered at full resolution

- **WHEN** the PhotoDetailView is rendered with a valid photo file
- **THEN** an `Image.file` widget SHALL display the photo at its original resolution within a `Center` widget

#### Scenario: Photo file available from ViewModel

- **WHEN** the ViewModel provides a cached photo file for the current index
- **THEN** the `Image.file` widget SHALL use that file as its source

### Requirement: InteractiveViewer gesture zoom

The `PhotoDetailView` SHALL wrap the image in an `InteractiveViewer` widget with a `TransformationController` to enable pinch-to-zoom gesture interaction. The `TransformationController` SHALL be monitored to detect zoom state (scale > 1.01) and control PageView scroll physics accordingly.

#### Scenario: Pinch-to-zoom enabled

- **WHEN** the user performs a pinch gesture on the photo
- **THEN** the InteractiveViewer SHALL zoom the image in or out accordingly

#### Scenario: Pan enabled when zoomed

- **WHEN** the user drags a zoomed-in photo (scale > 1.01)
- **THEN** the InteractiveViewer SHALL pan the image to follow the drag gesture
- **AND** the PageView SHALL NOT respond to the drag gesture

#### Scenario: Zoom reset on page change

- **WHEN** the user swipes to a different page
- **THEN** the `TransformationController` value SHALL be reset to `Matrix4.identity()`
