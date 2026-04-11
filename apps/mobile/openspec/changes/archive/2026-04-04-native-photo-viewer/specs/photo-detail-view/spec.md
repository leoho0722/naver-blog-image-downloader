## MODIFIED Requirements

### Requirement: Full-resolution image display

The `PhotoDetailView` SHALL no longer render photos directly. It SHALL serve as a thin shell that launches the native platform photo viewer via `PhotoViewerService.openViewer()`. The `build` method SHALL return an empty `Scaffold` (the native viewer overlays on top).

#### Scenario: PhotoDetailView renders empty scaffold

- **WHEN** the PhotoDetailView is rendered
- **THEN** it SHALL display an empty `Scaffold` with no image widgets

### Requirement: View initialization without unnecessary postFrameCallback

The `PhotoDetailView` SHALL load data in `didChangeDependencies` using a `_loaded` flag. It SHALL extract the route `extra` record `({List<PhotoEntity> photos, String blogId, int initialIndex})`, call `viewModel.loadAll(photos, blogId, initialIndex, cachedFiles)`, resolve file paths from `cachedFiles`, gather localized strings and theme colors from the current `BuildContext`, and call `PhotoViewerService.openViewer()`. It SHALL also register callback handlers via `PhotoViewerService.setCallbackHandler()`.

#### Scenario: Native viewer launched on first build

- **WHEN** the PhotoDetailView is rendered for the first time
- **THEN** `viewModel.loadAll` SHALL be called
- **AND** `PhotoViewerService.openViewer` SHALL be invoked with filePaths, initialIndex, blogId, localizedStrings, isDarkMode, and themeColors

#### Scenario: Callback handler registered

- **WHEN** the PhotoDetailView initializes
- **THEN** `PhotoViewerService.setCallbackHandler` SHALL be called with `onSaveCompleted` and `onDismissed` callbacks

#### Scenario: Callback handler removed on dispose

- **WHEN** the PhotoDetailView is disposed
- **THEN** `PhotoViewerService.removeCallbackHandler` SHALL be called

### Requirement: Navigation data format

The `PhotoDetailView` SHALL receive navigation data via GoRouter `extra` as a record of type `({List<PhotoEntity> photos, String blogId, int initialIndex})`. This format is unchanged from the existing implementation.

#### Scenario: Data loaded from navigation extra

- **WHEN** the PhotoDetailView is rendered with a valid extra record
- **THEN** `viewModel.loadAll` SHALL be called with the photos list, blogId, initialIndex, and cachedFiles

## REMOVED Requirements

### Requirement: InteractiveViewer gesture zoom
**Reason**: Pinch-to-zoom is now handled by native platform viewers (iOS UIScrollView / Android detectTransformGestures).
**Migration**: Native viewers implement their own zoom handling.

#### Scenario: Flutter InteractiveViewer removed

- **WHEN** the PhotoDetailView is rendered
- **THEN** no `InteractiveViewer` widget SHALL be present

### Requirement: Stack-based layout with PageView
**Reason**: The Flutter PageView layout is replaced by native page swiping (iOS TabView / Android HorizontalPager).
**Migration**: Native viewers render full-screen layout independently.

#### Scenario: Flutter PageView removed

- **WHEN** the PhotoDetailView is rendered
- **THEN** no `PageView.builder` widget SHALL be present

### Requirement: Immersive mode toggle
**Reason**: Immersive mode is managed by native platform APIs.
**Migration**: Native viewers handle system UI visibility directly.

#### Scenario: Flutter immersive mode logic removed

- **WHEN** the PhotoDetailView is rendered
- **THEN** no `SystemChrome.setEnabledSystemUIMode` calls SHALL be present in the view

### Requirement: Horizontal swipe navigation
**Reason**: Horizontal page swiping is handled natively.
**Migration**: Native viewers implement their own page navigation.

#### Scenario: Flutter horizontal swipe removed

- **WHEN** the PhotoDetailView is rendered
- **THEN** no `PageView.builder` SHALL be present for horizontal photo navigation

### Requirement: Top overlay bar
**Reason**: The top overlay bar is now a native component.
**Migration**: Native viewers render the bar using platform-native UI.

#### Scenario: Flutter top overlay bar removed

- **WHEN** the PhotoDetailView is rendered
- **THEN** no gradient overlay bar widget SHALL be present

### Requirement: Capsule bottom bar
**Reason**: The capsule bottom bar is now a native component. `PhotoDetailCapsuleBar` widget file is deleted.
**Migration**: Native viewers render the capsule using platform-native UI.

#### Scenario: Flutter capsule bottom bar removed

- **WHEN** the PhotoDetailView is rendered
- **THEN** no `PhotoDetailCapsuleBar` widget SHALL be present

### Requirement: Localized UI text
**Reason**: Localization strings are passed from Flutter to native via MethodChannel `localizedStrings` parameter, not rendered by Flutter widgets.
**Migration**: `PhotoViewerService.openViewer()` includes localized strings in the channel invocation.

#### Scenario: Flutter l10n passed to native

- **WHEN** `PhotoViewerService.openViewer` is called
- **THEN** localized strings SHALL be included in the MethodChannel arguments
