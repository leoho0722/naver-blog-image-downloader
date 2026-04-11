## ADDED Requirements

### Requirement: Cache eviction before download

The `PhotoRepository.downloadAllToCache` method SHALL call `CacheRepository.evictIfNeeded()` before starting any downloads, ensuring sufficient disk space is available.

#### Scenario: Eviction triggered before downloads

- **WHEN** `downloadAllToCache` is called
- **THEN** `CacheRepository.evictIfNeeded()` SHALL be called before any `FileDownloadService.downloadFile` calls

### Requirement: Parallel download with concurrency limit

The `PhotoRepository.downloadAllToCache(List<PhotoEntity> photos, String blogId, {void Function(int completed, int total)? onProgress})` method SHALL download photos in parallel with a maximum concurrency of 4 simultaneous downloads.

#### Scenario: Downloads limited to 4 concurrent

- **GIVEN** a list of 10 photos to download
- **WHEN** `downloadAllToCache` is called
- **THEN** at most 4 downloads SHALL be in progress at any given time

#### Scenario: Fewer than 4 photos

- **GIVEN** a list of 2 photos to download
- **WHEN** `downloadAllToCache` is called
- **THEN** both downloads SHALL proceed in parallel without waiting

### Requirement: Cache skip logic

Before downloading each photo, `downloadAllToCache` SHALL check whether the file already exists in the cache by calling `CacheRepository.cachedFile(filename, blogId)`. If the file exists, the download SHALL be skipped and counted as a skipped item.

#### Scenario: File already cached

- **GIVEN** a photo's file already exists in the cache
- **WHEN** `downloadAllToCache` processes that photo
- **THEN** it SHALL skip the download
- **AND** increment the skipped count

#### Scenario: File not cached

- **GIVEN** a photo's file does not exist in the cache
- **WHEN** `downloadAllToCache` processes that photo
- **THEN** it SHALL proceed with the download

### Requirement: Download and store flow

For each photo that is not cached, `downloadAllToCache` SHALL call `FileDownloadService.downloadFileFile(url, savePath)` to download the file to the target path, then call `CacheRepository.storeFile(tempFile, filename, blogId)` to move it into the cache.

#### Scenario: Successful download and store

- **WHEN** `FileDownloadService.downloadFileFile` returns a downloaded file
- **THEN** `CacheRepository.storeFile` SHALL be called with that file
- **AND** the success count SHALL be incremented

### Requirement: Progress callback

The `downloadAllToCache` method SHALL invoke the optional `onProgress` callback after each photo is processed (whether successful, failed, or skipped). The callback SHALL receive `(completed, total)` where `completed` is the number of photos processed so far and `total` is the total number of photos.

#### Scenario: Progress reported for each photo

- **GIVEN** a list of 5 photos
- **WHEN** `downloadAllToCache` is called with an `onProgress` callback
- **THEN** the callback SHALL be invoked 5 times with `completed` values 1 through 5

#### Scenario: No callback provided

- **WHEN** `downloadAllToCache` is called without an `onProgress` callback
- **THEN** processing SHALL proceed normally without error

### Requirement: Single failure does not abort batch

When a single photo download fails (either `FileDownloadService.downloadFile` or `CacheRepository.storeFile` throws), the error SHALL be caught and recorded. The remaining photos SHALL continue to be processed.

#### Scenario: One download fails among many

- **GIVEN** a list of 5 photos where the 3rd photo's download throws an exception
- **WHEN** `downloadAllToCache` is called
- **THEN** the 1st, 2nd, 4th, and 5th photos SHALL still be processed
- **AND** the failure count SHALL be 1
- **AND** the error message SHALL be recorded in the errors list

### Requirement: Metadata update after completion

After all photos have been processed, `downloadAllToCache` SHALL call `CacheRepository.updateMetadata` to update the `BlogCacheMetadata` with the download timestamp and the list of successfully cached filenames.

#### Scenario: Metadata updated after batch

- **WHEN** all photo downloads have been processed
- **THEN** `CacheRepository.updateMetadata` SHALL be called with an updated `BlogCacheMetadata`

#### Scenario: Metadata updated even with partial failures

- **GIVEN** some downloads failed
- **WHEN** all photo processing completes
- **THEN** `CacheRepository.updateMetadata` SHALL still be called with the successfully cached filenames

### Requirement: DownloadBatchResult return value

The `downloadAllToCache` method SHALL return a `DownloadBatchResult` containing `successCount`, `skippedCount`, and `errors` (a `List<String>` of error messages from failed downloads). The `failureCount` SHALL be a computed getter (derived from `failedPhotos.length`), not a stored field.

#### Scenario: All downloads succeed

- **GIVEN** all photos download successfully
- **WHEN** `downloadAllToCache` completes
- **THEN** `successCount` SHALL equal the total photo count
- **AND** `failureCount` SHALL be 0
- **AND** `skippedCount` SHALL be 0
- **AND** `errors` SHALL be empty

#### Scenario: Mixed results

- **GIVEN** some photos succeed, some fail, and some are skipped
- **WHEN** `downloadAllToCache` completes
- **THEN** `successCount + failureCount + skippedCount` SHALL equal the total photo count
- **AND** `errors` SHALL contain one entry per failed download
