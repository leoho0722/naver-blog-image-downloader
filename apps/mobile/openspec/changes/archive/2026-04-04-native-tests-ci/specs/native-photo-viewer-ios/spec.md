## MODIFIED Requirements

### Requirement: PhotoViewerViewModel observable state

`PhotoViewerViewModel` SHALL be an `@Observable` class managing: `currentIndex` (Int), `isImmersive` (Bool, default false), `viewState` (ViewState enum: `.idle` / `.saving` / `.saved`), `filePaths` ([String]), `blogId` (String), `localizedStrings` ([String: String]), and `themeColors` (ThemeColors struct). It SHALL hold a reference to the `FlutterMethodChannel`. It SHALL accept a `photoSaveable: PhotoSaveable` parameter in its initializer instead of creating `PhotoService()` internally.

#### Scenario: Initial state

- **GIVEN** a newly created PhotoViewerViewModel with an injected `PhotoSaveable`
- **WHEN** its properties are inspected
- **THEN** `isImmersive` SHALL be `false` and `viewState` SHALL be `.idle`

### Requirement: ViewModel save method

`PhotoViewerViewModel.save()` SHALL call the injected `PhotoSaveable.saveToGallery(filePath:)` with the current photo's file path. On success, it SHALL set `viewState` to `.saved` and invoke `onSaveCompleted` on the MethodChannel with `{"blogId": blogId}`. On failure, it SHALL revert `viewState` to `.idle`.

#### Scenario: Successful save

- **GIVEN** the current photo has a valid file path
- **WHEN** `save()` is called
- **THEN** `viewState` SHALL transition `.idle → .saving → .saved`
- **AND** `onSaveCompleted` SHALL be invoked on the MethodChannel
