## MODIFIED Requirements

### Requirement: GalleryService saveToGallery method

The file `lib/data/services/gallery_service.dart` SHALL define a `GalleryService` class that provides a `saveToGallery` method for saving images to the device gallery.

- `saveToGallery` SHALL accept a `String filePath` parameter specifying the path of the image file to save.
- `saveToGallery` SHALL use a `MethodChannel` named `com.example.naver_blog_image_downloader/gallery` to invoke the native platform method `saveToGallery` with the file path.
- On iOS, the native implementation SHALL use `PHAssetCreationRequest.addResource(with: .photo, fileURL:)` to write the file directly without re-encoding.
- On Android, the native implementation SHALL use `MediaStore` API with `FileInputStream.copyTo` to copy the file directly without re-encoding.
- `saveToGallery` SHALL return a `Future<void>`.
- The system SHALL auto-generate filenames (e.g., IMG_xxxx) instead of preserving the source filename.
- When the native platform returns an error, `saveToGallery` SHALL catch the `PlatformException` and throw an `AppError` with type `AppErrorType.gallery`.

#### Scenario: Image saved successfully

- **GIVEN** a valid file path pointing to an image file
- **WHEN** `saveToGallery` is called with the file path
- **THEN** the native platform method SHALL be invoked via MethodChannel and the file SHALL be saved to the device gallery without re-encoding

#### Scenario: Save fails on native platform

- **GIVEN** the native platform encounters an error during save
- **WHEN** `saveToGallery` is called
- **THEN** an `AppError` with type `AppErrorType.gallery` SHALL be thrown

#### Scenario: File size preserved after save

- **GIVEN** a cached image file with a specific file size
- **WHEN** `saveToGallery` saves the file to the gallery
- **THEN** the saved file in the gallery SHALL have the same size as the original cached file

### Requirement: GalleryService requestPermission method

The `GalleryService` class SHALL provide a `requestPermission` method that requests photo library access permission from the native platform via the same `MethodChannel`.

- On iOS, the native implementation SHALL use `PHPhotoLibrary.requestAuthorization(for: .addOnly)`.
- On Android, the native implementation SHALL request `READ_MEDIA_IMAGES` (Android 13+) or `WRITE_EXTERNAL_STORAGE` (older versions).
- `requestPermission` SHALL return `true` if permission is granted, `false` otherwise.
- `requestPermission` SHALL return a `Future<bool>`.

#### Scenario: Permission granted

- **GIVEN** the user has not yet granted photo library permission
- **WHEN** `requestPermission` is called and the user grants permission
- **THEN** it SHALL return `true`

#### Scenario: Permission denied

- **GIVEN** the user denies photo library permission
- **WHEN** `requestPermission` is called
- **THEN** it SHALL return `false`
