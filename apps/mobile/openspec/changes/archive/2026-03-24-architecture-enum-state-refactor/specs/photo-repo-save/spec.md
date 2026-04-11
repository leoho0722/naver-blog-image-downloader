## ADDED Requirements

### Requirement: Save single photo to gallery

The `PhotoRepository` SHALL provide a `saveOneToGallery(String filePath)` method that returns `Future<Result<void>>`.

The method SHALL:
1. Call `GalleryService.requestPermission()` to verify gallery access
2. If permission is denied, return `Result.error` with `AppError(type: AppErrorType.gallery)`
3. Call `GalleryService.saveToGallery(filePath)` to save the photo
4. On success, return `Result.ok(null)`
5. On exception, return `Result.error` wrapping the exception

#### Scenario: Save single photo with permission granted

- **GIVEN** `GalleryService.requestPermission()` returns `true`
- **WHEN** `saveOneToGallery` is called with a valid file path
- **THEN** `GalleryService.saveToGallery` SHALL be called with the file path
- **AND** the method SHALL return `Result.ok`

#### Scenario: Save single photo with permission denied

- **GIVEN** `GalleryService.requestPermission()` returns `false`
- **WHEN** `saveOneToGallery` is called
- **THEN** `GalleryService.saveToGallery` SHALL NOT be called
- **AND** the method SHALL return `Result.error` with `AppErrorType.gallery`

#### Scenario: Save single photo with gallery error

- **GIVEN** `GalleryService.requestPermission()` returns `true`
- **AND** `GalleryService.saveToGallery` throws an exception
- **WHEN** `saveOneToGallery` is called
- **THEN** the method SHALL return `Result.error` wrapping the exception
