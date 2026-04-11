## ADDED Requirements

### Requirement: PhotoViewerService singleton provider

`PhotoViewerService` SHALL be a Dart class registered as a `@Riverpod(keepAlive: true)` provider, following the same pattern as `PhotoService`. It SHALL create a `MethodChannel` named `com.leoho.naverBlogImageDownloader/photoViewer`.

#### Scenario: Service registered as singleton

- **GIVEN** the app is initialized
- **WHEN** `photoViewerServiceProvider` is first accessed
- **THEN** a single `PhotoViewerService` instance SHALL be created with the MethodChannel

### Requirement: openViewer method

`PhotoViewerService` SHALL provide an `openViewer()` method that invokes `openViewer` on the MethodChannel with a Map containing: `filePaths` (List\<String\>), `initialIndex` (int), `blogId` (String), `localizedStrings` (Map with keys `fileInfo`, `fileSize`, `dimensions`), `isDarkMode` (bool), and `themeColors` (Map with ARGB int values for `surfaceContainerHigh`, `onSurface`, `onSurfaceVariant`, `primary`, `surface`).

#### Scenario: Open viewer with all parameters

- **GIVEN** a list of file paths, initialIndex, blogId, localized strings, dark mode flag, and theme colors
- **WHEN** `openViewer` is called
- **THEN** the MethodChannel SHALL invoke `openViewer` with all parameters serialized in the Map

### Requirement: Callback handler registration

`PhotoViewerService` SHALL provide `setCallbackHandler(onSaveCompleted, onDismissed)` and `removeCallbackHandler()` methods. The `setMethodCallHandler` on the channel SHALL dispatch incoming calls to the registered callbacks. `onSaveCompleted` SHALL receive a `blogId` String. `onDismissed` SHALL receive a `lastIndex` int.

#### Scenario: onSaveCompleted callback dispatched

- **GIVEN** a callback handler is registered
- **WHEN** the native side invokes `onSaveCompleted` with `{"blogId": "abc123"}`
- **THEN** the registered `onSaveCompleted` callback SHALL be called with `"abc123"`

#### Scenario: onDismissed callback dispatched

- **GIVEN** a callback handler is registered
- **WHEN** the native side invokes `onDismissed` with `{"lastIndex": 5}`
- **THEN** the registered `onDismissed` callback SHALL be called with `5`

#### Scenario: No callback registered

- **GIVEN** no callback handler is registered (or it has been removed)
- **WHEN** the native side invokes a method
- **THEN** no exception SHALL be thrown
