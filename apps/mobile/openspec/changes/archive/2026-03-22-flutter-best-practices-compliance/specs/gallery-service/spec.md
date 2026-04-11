## MODIFIED Requirements

### Requirement: GalleryService saveToGallery method

The file `lib/data/services/gallery_service.dart` SHALL define a `GalleryService` class that provides a `saveToGallery` method for saving images to the device gallery.

- `saveToGallery` SHALL accept a `String filePath` parameter specifying the path of the image file to save.
- `saveToGallery` SHALL read the file as bytes, then call `ImageGallerySaver.saveImage(bytes, quality: 100)` to save the image to the system gallery.
- `saveToGallery` SHALL return a `Future<void>`.
- The system SHALL auto-generate filenames (e.g., IMG_xxxx) instead of preserving the source filename.
- When `ImageGallerySaver.saveImage` returns a null result or `isSuccess` is not true, `saveToGallery` SHALL throw an `AppError` with type `AppErrorType.gallery` instead of a generic `Exception`.

#### Scenario: Image saved successfully

- **GIVEN** a valid file path pointing to an image file
- **WHEN** `saveToGallery` is called with the file path
- **THEN** the file SHALL be read as bytes and `ImageGallerySaver.saveImage` SHALL be invoked with the bytes and `quality: 100`

#### Scenario: Save fails due to invalid file

- **GIVEN** an invalid file path
- **WHEN** `saveToGallery` is called
- **THEN** the exception from reading the file or `ImageGallerySaver.saveImage` SHALL propagate to the caller

#### Scenario: Save result indicates failure

- **WHEN** `ImageGallerySaver.saveImage` returns null or `isSuccess` is not true
- **THEN** an `AppError` with type `AppErrorType.gallery` SHALL be thrown
