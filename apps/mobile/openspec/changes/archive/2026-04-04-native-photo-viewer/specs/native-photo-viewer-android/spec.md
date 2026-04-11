## ADDED Requirements

### Requirement: PhotoViewerChannel registration

`MainActivity` SHALL have a `setupPhotoViewerChannel(flutterEngine:)` extension method called in `configureFlutterEngine`. The channel handler SHALL process the `openViewer` method by starting `PhotoViewerActivity` via Intent with extras. The channel reference SHALL be stored in a file-level `private var` for Activity callback use.

#### Scenario: Channel registered on engine config

- **GIVEN** the Flutter engine is configured
- **WHEN** `configureFlutterEngine` is called
- **THEN** a MethodChannel named `com.leoho.naverBlogImageDownloader/photoViewer` SHALL be registered

#### Scenario: openViewer starts PhotoViewerActivity

- **GIVEN** Flutter invokes `openViewer` with valid parameters
- **WHEN** the channel handler processes the call
- **THEN** `PhotoViewerActivity` SHALL be started via Intent with all parameters as extras

### Requirement: PhotoViewerViewModel compose state

`PhotoViewerViewModel` SHALL be a class managing Compose state: `currentIndex` (mutableIntStateOf), `isImmersive` (mutableStateOf(false)), `viewState` (mutableStateOf(ViewState.Idle)), `filePaths` (List\<String\>), `blogId` (String), `localizedStrings` (Map\<String, String\>), and `themeColors` (ThemeColors data class).

#### Scenario: Initial state

- **GIVEN** a newly created PhotoViewerViewModel
- **WHEN** its properties are inspected
- **THEN** `isImmersive` SHALL be `false` and `viewState` SHALL be `ViewState.Idle`

### Requirement: ViewModel save method

`PhotoViewerViewModel.save()` SHALL directly call `PhotoService(context).saveToGallery(filePath)` on `Dispatchers.IO`. On success, it SHALL set `viewState` to `Saved` and invoke `onSaveCompleted` on the MethodChannel with `{"blogId": blogId}`. On failure, it SHALL revert `viewState` to `Idle`.

#### Scenario: Successful save

- **GIVEN** the current photo has a valid file path
- **WHEN** `save()` is called
- **THEN** `viewState` SHALL transition `Idle → Saving → Saved`
- **AND** `onSaveCompleted` SHALL be invoked on the MethodChannel

### Requirement: ViewModel dismiss method

`PhotoViewerViewModel.dismiss()` SHALL invoke `onDismissed` on the MethodChannel with `{"lastIndex": currentIndex}` and call `activity.finish()`.

#### Scenario: Dismiss sends event and finishes

- **GIVEN** the viewer is displayed at index 3
- **WHEN** `dismiss()` is called
- **THEN** `onDismissed` SHALL be invoked with `{"lastIndex": 3}`
- **AND** the activity SHALL finish

### Requirement: ViewModel fileInfo method

`PhotoViewerViewModel.fileInfo(index:)` SHALL return a `PhotoFileInfo` data class containing file size (bytes from `File.length()`) and image dimensions (from `BitmapFactory.Options` with `inJustDecodeBounds = true`).

#### Scenario: File info retrieved

- **GIVEN** a valid photo file path
- **WHEN** `fileInfo(index)` is called
- **THEN** it SHALL return file size in bytes and pixel dimensions

### Requirement: PhotoViewerActivity with Compose

`PhotoViewerActivity` SHALL extend `ComponentActivity`, call `enableEdgeToEdge()`, read parameters from Intent extras, create `PhotoViewerViewModel`, and call `setContent` with `MaterialTheme` using Flutter-passed ARGB theme colors.

#### Scenario: Activity created with parameters

- **GIVEN** an Intent with filePaths, blogId, initialIndex, localizedStrings, isDarkMode, themeColors
- **WHEN** `PhotoViewerActivity.onCreate` is called
- **THEN** it SHALL create a `PhotoViewerViewModel` with all parameters

### Requirement: PhotoViewerScreen with Box layout and HorizontalPager

`PhotoViewerScreen` SHALL use a pure `Box` layout (NOT `Scaffold`) with a `HorizontalPager` filling the entire screen. A custom navigation bar (gradient background, centered title, back button) SHALL be overlaid at the top. A `CapsuleBottomBar` SHALL be overlaid at the bottom. Both overlays SHALL be hidden with `AnimatedVisibility` using `fadeIn`/`fadeOut` when `viewModel.isImmersive` is true. System bars SHALL be controlled via `WindowInsetsControllerCompat`. The `PhotoViewerActivity` SHALL use `OnBackPressedCallback` to intercept the system back gesture and delegate to `viewModel.dismiss()`.

#### Scenario: Page indicator displays correct count

- **GIVEN** the viewer has 12 photos at settled page 2
- **WHEN** the navigation bar is visible
- **THEN** the centered title SHALL display "3 / 12"

#### Scenario: Immersive mode hides system bars and overlays

- **GIVEN** `viewModel.isImmersive` is true
- **WHEN** the immersive effect runs
- **THEN** `WindowInsetsControllerCompat.hide(systemBars)` SHALL be called
- **AND** the navigation bar and capsule bar SHALL fade out

### Requirement: ZoomableImage with bitmap caching

`ZoomableImage` SHALL decode images with `BitmapFactory.decodeFile` and display with `Image(bitmap.asImageBitmap())`. It SHALL support pinch-to-zoom (1x–5x) via `detectTransformGestures` and double-tap zoom toggle (1x/3x) via `detectTapGestures(onDoubleTap)`. An LRU cache of ±3 pages SHALL be maintained.

#### Scenario: Double-tap to zoom

- **GIVEN** the image is at 1x scale
- **WHEN** the user double-taps
- **THEN** the image SHALL animate to 3x scale

### Requirement: Capsule bottom bar with theme colors

The capsule bottom bar SHALL use `surfaceContainerHigh` ARGB color from `viewModel.themeColors`. It SHALL contain an info button and a save button with a divider. The save button SHALL show `CircularProgressIndicator` when saving and a checkmark icon when saved.

#### Scenario: Save button state transitions

- **GIVEN** `viewState` is `Idle`
- **WHEN** save is tapped
- **THEN** the button SHALL show a progress indicator (`Saving`)
- **AND** after success, SHALL show a checkmark (`Saved`)

### Requirement: File info bottom sheet

A `ModalBottomSheet` SHALL be presented when the info button is tapped. It SHALL display file size (KB/MB) and image dimensions (width × height) using data from `viewModel.fileInfo(index)`. Labels SHALL use the localized strings passed from Flutter.

#### Scenario: File info displayed with Flutter l10n

- **GIVEN** `localizedStrings["fileSize"]` is "檔案大小"
- **WHEN** the bottom sheet is presented
- **THEN** the file size label SHALL display "檔案大小"

### Requirement: Jetpack Compose dependencies

`build.gradle.kts` SHALL add `id("org.jetbrains.kotlin.plugin.compose")` to the plugins block, `buildFeatures { compose = true }` to the android block, and Compose BOM + material3 + foundation + activity-compose dependencies.

#### Scenario: Compose dependencies configured

- **GIVEN** the Android project `build.gradle.kts`
- **WHEN** the dependencies are resolved
- **THEN** Compose Material3 and Foundation libraries SHALL be available

### Requirement: AndroidManifest registration

`PhotoViewerActivity` SHALL be registered in `AndroidManifest.xml` with `android:exported="false"`.

#### Scenario: Activity registered

- **GIVEN** the AndroidManifest.xml
- **WHEN** the manifest is parsed
- **THEN** `PhotoViewerActivity` SHALL be declared as an activity
