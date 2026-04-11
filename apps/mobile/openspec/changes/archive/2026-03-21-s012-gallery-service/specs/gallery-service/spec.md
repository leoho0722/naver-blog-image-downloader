## ADDED Requirements

### Requirement: GalleryService saveToGallery method

The file `lib/data/services/gallery_service.dart` SHALL define a `GalleryService` class that provides a `saveToGallery` method for saving images to the device gallery.

- `saveToGallery` SHALL accept a `String filePath` parameter specifying the path of the image file to save.
- `saveToGallery` SHALL read the file as bytes, then call `ImageGallerySaver.saveImage(bytes, quality: 100)` to save the image to the system gallery.
- `saveToGallery` SHALL return a `Future<void>`.
- The system SHALL auto-generate filenames (e.g., IMG_xxxx) instead of preserving the source filename.

#### Scenario: Image saved successfully

- **GIVEN** a valid file path pointing to an image file
- **WHEN** `saveToGallery` is called with the file path
- **THEN** the file SHALL be read as bytes and `ImageGallerySaver.saveImage` SHALL be invoked with the bytes and `quality: 100`

#### Scenario: Save fails due to invalid file

- **GIVEN** an invalid file path
- **WHEN** `saveToGallery` is called
- **THEN** the exception from reading the file or `ImageGallerySaver.saveImage` SHALL propagate to the caller

### Requirement: GalleryService requestPermission method

The `GalleryService` class SHALL provide a `requestPermission` method for backward compatibility.

- `requestPermission` SHALL always return `true` because `image_gallery_saver` auto-requests permissions on save.
- `requestPermission` SHALL return a `Future<bool>`.

#### Scenario: Permission always granted

- **WHEN** `requestPermission` is called
- **THEN** it SHALL return `true`
