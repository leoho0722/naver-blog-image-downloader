## MODIFIED Requirements

### Requirement: PhotoViewerViewModel compose state

`PhotoViewerViewModel` SHALL be a class managing Compose state: `currentIndex` (mutableIntStateOf), `isImmersive` (mutableStateOf(false)), `viewState` (mutableStateOf(ViewState.Idle)), `filePaths` (List\<String\>), `blogId` (String), `localizedStrings` (Map\<String, String\>), and `themeColors` (ThemeColors data class). It SHALL NOT accept an `Activity` parameter. It SHALL accept `photoSaveable: PhotoSaveable` and `dismissAction: (() -> Unit)?` as constructor parameters.

#### Scenario: Initial state

- **GIVEN** a newly created PhotoViewerViewModel with injected `PhotoSaveable` and `dismissAction`
- **WHEN** its properties are inspected
- **THEN** `isImmersive` SHALL be `false` and `viewState` SHALL be `ViewState.Idle`

### Requirement: ViewModel save method

`PhotoViewerViewModel.save()` SHALL call the injected `PhotoSaveable.saveToGallery(filePath)` on `Dispatchers.IO`. On success, it SHALL set `viewState` to `Saved` and invoke `onSaveCompleted` on the MethodChannel with `{"blogId": blogId}`. On failure, it SHALL revert `viewState` to `Idle`.

#### Scenario: Successful save

- **GIVEN** the current photo has a valid file path
- **WHEN** `save()` is called
- **THEN** `viewState` SHALL transition `Idle → Saving → Saved`
- **AND** `onSaveCompleted` SHALL be invoked on the MethodChannel

### Requirement: ViewModel dismiss method

`PhotoViewerViewModel.dismiss()` SHALL invoke `onDismissed` on the MethodChannel with `{"lastIndex": currentIndex}` and call the injected `dismissAction` callback. It SHALL NOT directly reference `Activity.finish()`.

#### Scenario: Dismiss sends event and finishes

- **GIVEN** the viewer is displayed at index 3
- **WHEN** `dismiss()` is called
- **THEN** `onDismissed` SHALL be invoked with `{"lastIndex": 3}`
- **AND** `dismissAction` SHALL be invoked

### Requirement: PhotoViewerActivity with Compose

`PhotoViewerActivity` SHALL extend `ComponentActivity`, call `enableEdgeToEdge()`, read parameters from Intent extras, create `PhotoService(this)` as `PhotoSaveable`, create `PhotoViewerViewModel` with injected `photoSaveable` and `dismissAction = { finish() }`, and call `setContent` with `MaterialTheme` using Flutter-passed ARGB theme colors.

#### Scenario: Activity created with parameters

- **GIVEN** an Intent with filePaths, blogId, initialIndex, localizedStrings, isDarkMode, themeColors
- **WHEN** `PhotoViewerActivity.onCreate` is called
- **THEN** it SHALL create a `PhotoViewerViewModel` with `PhotoService(this)` as `photoSaveable` and `{ finish() }` as `dismissAction`
