## MODIFIED Requirements

### Requirement: saveOneToGallery return type

`PhotoRepository.saveOneToGallery(String filePath)` SHALL return `Future<void>` instead of `Future<Result<void>>`. On failure (permission denied or save error), it SHALL throw an exception.

#### Scenario: Successful save returns void

- **GIVEN** gallery permission is granted and the file exists
- **WHEN** `saveOneToGallery(filePath)` is called
- **THEN** it SHALL complete without error (return void)

#### Scenario: Permission denied throws AppError

- **GIVEN** gallery permission is denied
- **WHEN** `saveOneToGallery(filePath)` is called
- **THEN** it SHALL throw `AppError` with `type: AppErrorType.gallery`

### Requirement: saveToGalleryFromCache return type

`PhotoRepository.saveToGalleryFromCache()` SHALL return `Future<void>` instead of `Future<Result<void>>`. On failure, it SHALL throw the exception directly.

#### Scenario: Successful batch save returns void

- **GIVEN** all cached files exist and gallery permission is granted
- **WHEN** `saveToGalleryFromCache(photos: photos, blogId: blogId)` is called
- **THEN** it SHALL complete without error
- **AND** SHALL call `markAsSavedToGallery(blogId)` on `CacheRepository`

#### Scenario: Save failure throws exception

- **GIVEN** `GalleryService.saveToGallery` throws an exception
- **WHEN** `saveToGalleryFromCache()` is called
- **THEN** it SHALL propagate the exception to the caller
