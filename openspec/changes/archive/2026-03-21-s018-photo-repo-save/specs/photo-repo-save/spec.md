## ADDED Requirements

### Requirement: Read cached files for gallery save

The `PhotoRepository.saveToGalleryFromCache({required List<PhotoEntity> photos, required String blogId})` method SHALL iterate over the provided photo entities and retrieve each cached file via `CacheRepository.cachedFile(photo.filename, blogId)`. If a cached file is `null`, it SHALL be skipped (not treated as an error).

#### Scenario: All cached files exist

- **WHEN** `saveToGalleryFromCache` is called and all photo files exist in the cache
- **THEN** each file SHALL be retrieved and passed to the gallery service

#### Scenario: Some cached files missing

- **WHEN** `saveToGalleryFromCache` is called and some photo files are not in the cache
- **THEN** missing files SHALL be skipped via `continue`
- **AND** present files SHALL still be saved to the gallery

### Requirement: Sequential gallery save

The method SHALL save each cached file to the device gallery by calling `GalleryService.saveToGallery(file.path)` sequentially (one at a time, not in parallel).

#### Scenario: Files saved in sequence

- **GIVEN** a list of 3 photos with all files cached
- **WHEN** `saveToGalleryFromCache` is called
- **THEN** `GalleryService.saveToGallery` SHALL be called 3 times in sequence

### Requirement: Mark as saved to gallery after success

After all files have been processed, the method SHALL call `CacheRepository.markAsSavedToGallery(blogId)` to update the metadata flag, indicating that this blog's photos have been saved to the device gallery.

#### Scenario: Mark called after successful save

- **WHEN** all gallery saves complete without exception
- **THEN** `CacheRepository.markAsSavedToGallery(blogId)` SHALL be called

### Requirement: Error handling with Result wrapping

The entire `saveToGalleryFromCache` method SHALL be wrapped in a try-catch block. On success, it SHALL return `Result.ok(null)`. If any exception is thrown during the process (e.g., `GalleryService.saveToGallery` fails), the method SHALL catch the exception and return `Result.error(e)`.

#### Scenario: Successful save returns Result.ok

- **WHEN** all photos are processed and metadata is marked
- **THEN** the method SHALL return `Result.ok(null)`

#### Scenario: Gallery save exception returns Result.error

- **WHEN** `GalleryService.saveToGallery` throws an exception
- **THEN** the method SHALL return `Result.error(e)` wrapping the caught exception

#### Scenario: markAsSavedToGallery exception returns Result.error

- **WHEN** `CacheRepository.markAsSavedToGallery` throws an exception
- **THEN** the method SHALL return `Result.error(e)` wrapping the caught exception
