## MODIFIED Requirements

### Requirement: GalleryService saveToGallery method

The file `lib/data/services/gallery_service.dart` SHALL define a `GalleryService` class that provides a `saveToGallery` method for saving images to the device gallery.

- `saveToGallery` SHALL accept a `String filePath` parameter specifying the path of the image file to save.
- `saveToGallery` SHALL use a `MethodChannel` named `com.leoho.naverBlogImageDownloader/gallery` to invoke the native platform method `saveToGallery` with the file path.
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
- **THEN** a `PlatformException` SHALL be caught and an `AppError` with type `AppErrorType.gallery` SHALL be thrown

#### Scenario: MethodChannel name matches across platforms

- **GIVEN** the GalleryService is initialized
- **WHEN** the MethodChannel is created
- **THEN** the channel name SHALL be `com.leoho.naverBlogImageDownloader/gallery` in Dart, Swift, and Kotlin
