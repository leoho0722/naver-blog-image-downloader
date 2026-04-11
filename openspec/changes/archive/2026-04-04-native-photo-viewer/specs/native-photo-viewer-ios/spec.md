## ADDED Requirements

### Requirement: PhotoViewerChannel registration

`AppDelegate` SHALL have a `photoViewerChannel` property and a `setupPhotoViewerChannel(messenger:)` method registered in `didInitializeImplicitFlutterEngine`. The channel handler SHALL process the `openViewer` method, create a `PhotoViewerViewModel` and `PhotoViewerController`, and present the controller modally with `.fullScreen` style.

#### Scenario: Channel registered on engine init

- **GIVEN** the Flutter engine initializes
- **WHEN** `didInitializeImplicitFlutterEngine` is called
- **THEN** a MethodChannel named `com.leoho.naverBlogImageDownloader/photoViewer` SHALL be registered

#### Scenario: openViewer launches native viewer

- **GIVEN** Flutter invokes `openViewer` with valid parameters
- **WHEN** the channel handler processes the call
- **THEN** a `PhotoViewerController` SHALL be presented modally with `.fullScreen` style

### Requirement: PhotoViewerViewModel observable state

`PhotoViewerViewModel` SHALL be an `@Observable` class managing: `currentIndex` (Int), `isImmersive` (Bool, default false), `viewState` (ViewState enum: `.idle` / `.saving` / `.saved`), `filePaths` ([String]), `blogId` (String), `localizedStrings` ([String: String]), and `themeColors` (ThemeColors struct). It SHALL hold a reference to the `FlutterMethodChannel`.

#### Scenario: Initial state

- **GIVEN** a newly created PhotoViewerViewModel
- **WHEN** its properties are inspected
- **THEN** `isImmersive` SHALL be `false` and `viewState` SHALL be `.idle`

### Requirement: ViewModel save method

`PhotoViewerViewModel.save()` SHALL directly call `PhotoService().saveToGallery(filePath:)` with the current photo's file path. On success, it SHALL set `viewState` to `.saved` and invoke `onSaveCompleted` on the MethodChannel with `{"blogId": blogId}`. On failure, it SHALL revert `viewState` to `.idle`.

#### Scenario: Successful save

- **GIVEN** the current photo has a valid file path
- **WHEN** `save()` is called
- **THEN** `viewState` SHALL transition `.idle → .saving → .saved`
- **AND** `onSaveCompleted` SHALL be invoked on the MethodChannel

### Requirement: ViewModel dismiss method

`PhotoViewerViewModel.dismiss()` SHALL invoke `onDismissed` on the MethodChannel with `{"lastIndex": currentIndex}` and trigger the controller's dismiss action.

#### Scenario: Dismiss sends event and closes

- **GIVEN** the viewer is displayed at index 3
- **WHEN** `dismiss()` is called
- **THEN** `onDismissed` SHALL be invoked with `{"lastIndex": 3}`
- **AND** the controller SHALL be dismissed

### Requirement: ViewModel fileInfo method

`PhotoViewerViewModel.fileInfo(at:)` SHALL return a `PhotoFileInfo` struct containing file size (bytes) and image dimensions (width, height). File size SHALL be read from `FileManager`. Dimensions SHALL be read from `CGImageSource`.

#### Scenario: File info retrieved

- **GIVEN** a valid photo file path
- **WHEN** `fileInfo(at: index)` is called
- **THEN** it SHALL return file size in bytes and pixel dimensions

### Requirement: PhotoViewerController hosting

`PhotoViewerController` SHALL be a `UIHostingController<PhotoViewerView>` that accepts a `PhotoViewerViewModel`. It SHALL override `prefersStatusBarHidden` to return the value bound to `viewModel.isImmersive`.

#### Scenario: Status bar hidden in immersive mode

- **GIVEN** `viewModel.isImmersive` is true
- **WHEN** `prefersStatusBarHidden` is queried
- **THEN** it SHALL return `true`

### Requirement: PhotoViewerView with ZStack layout

`PhotoViewerView` SHALL use a pure `ZStack` layout (NOT `NavigationStack`) with a `TabView` using `.tabViewStyle(.page(indexDisplayMode: .never))` and `.ignoresSafeArea()`. A `PhotoViewerNavigationBar` (custom navigation bar with gradient background and centered title) SHALL be overlaid at the top. A `CapsuleBottomBar` SHALL be overlaid at the bottom. Both overlays SHALL be hidden with `.transition(.opacity)` animation when `viewModel.isImmersive` is true. The `PhotoViewerChannel` SHALL present the controller using `CATransition` with push/pop style animation (0.35s duration).

#### Scenario: Page indicator displays correct count

- **GIVEN** the viewer has 12 photos at index 2
- **WHEN** the navigation bar is visible
- **THEN** the centered title SHALL display "3 / 12"

#### Scenario: Overlays hidden in immersive mode

- **GIVEN** `viewModel.isImmersive` is true
- **WHEN** the view renders
- **THEN** the navigation bar and bottom capsule bar SHALL be hidden with opacity transition

### Requirement: ZoomableImageView with UIScrollView

`ZoomableImageView` SHALL be a `UIViewRepresentable` wrapping a `UIScrollView` with a `UIImageView` child. The scroll view SHALL have `minimumZoomScale: 1.0` and `maximumZoomScale: 5.0`. Double-tap SHALL toggle between 1x and 2x zoom. The zoom SHALL reset on page change (`onDisappear`).

#### Scenario: Double-tap to zoom

- **GIVEN** the image is at 1x zoom
- **WHEN** the user double-taps
- **THEN** the scroll view SHALL animate to 2x zoom

#### Scenario: Double-tap to reset

- **GIVEN** the image is zoomed in (> 1x)
- **WHEN** the user double-taps
- **THEN** the scroll view SHALL animate back to 1x zoom

### Requirement: Capsule bottom bar with theme colors

The capsule bottom bar SHALL use `surfaceContainerHigh` ARGB color with 0.85 opacity from `viewModel.themeColors`. It SHALL contain an info button and a save button separated by a divider. The save button SHALL show a progress indicator when `viewState == .saving` and a checkmark when `viewState == .saved`.

#### Scenario: Save button state transitions

- **GIVEN** `viewState` is `.idle`
- **WHEN** save is tapped
- **THEN** the button SHALL show a progress indicator (`.saving`)
- **AND** after success, SHALL show a checkmark (`.saved`)

### Requirement: File info sheet

A SwiftUI `.sheet` SHALL be presented when the info button is tapped. It SHALL display file size (KB/MB) and image dimensions (width × height) using data from `viewModel.fileInfo(at:)`. Labels SHALL use the localized strings passed from Flutter.

#### Scenario: File info displayed with Flutter l10n

- **GIVEN** `localizedStrings["fileSize"]` is "檔案大小"
- **WHEN** the file info sheet is presented
- **THEN** the file size label SHALL display "檔案大小"
