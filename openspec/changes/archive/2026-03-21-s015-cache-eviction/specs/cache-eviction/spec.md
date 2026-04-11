## ADDED Requirements

### Requirement: Gallery save marking

The `CacheRepository.markAsSavedToGallery(String blogId)` method SHALL update the `BlogCacheMetadata` for the specified blogId, setting its `isSavedToGallery` flag to `true`, and persist the updated metadata.

#### Scenario: Mark blog as saved

- **WHEN** `markAsSavedToGallery` is called with a valid blogId
- **THEN** the corresponding `BlogCacheMetadata.isSavedToGallery` SHALL be `true`
- **AND** the updated metadata SHALL be persisted to `shared_preferences`

#### Scenario: Mark non-existent blog

- **WHEN** `markAsSavedToGallery` is called with a blogId that has no metadata
- **THEN** the method SHALL complete without error (no-op)

### Requirement: Total cache size calculation

The `CacheRepository.totalCacheSize()` method SHALL return the total size in bytes of all files stored in the cache directory by recursively traversing all blog subdirectories.

#### Scenario: Calculate size with cached files

- **WHEN** `totalCacheSize` is called and the cache contains files
- **THEN** it SHALL return the sum of all file sizes in bytes

#### Scenario: Calculate size with empty cache

- **WHEN** `totalCacheSize` is called and the cache is empty
- **THEN** it SHALL return `0`

### Requirement: Automatic eviction

The `CacheRepository.evictIfNeeded()` method SHALL check whether the total cache size exceeds the soft limit of 300MB (`300 * 1024 * 1024` bytes). If exceeded, it SHALL evict cached blogs in the following priority order:

1. Blogs marked with `isSavedToGallery == true`, ordered by `downloadedAt` ascending (oldest first)
2. Eviction SHALL stop once the total cache size falls below the soft limit or all eligible blogs have been evicted

#### Scenario: Cache below soft limit

- **WHEN** `evictIfNeeded` is called and total cache size is below 300MB
- **THEN** no blogs SHALL be evicted

#### Scenario: Evict saved blogs oldest first

- **GIVEN** total cache size exceeds 300MB
- **AND** multiple blogs are marked as saved to gallery
- **WHEN** `evictIfNeeded` is called
- **THEN** blogs marked `isSavedToGallery == true` SHALL be evicted in ascending `downloadedAt` order
- **AND** eviction SHALL stop once total size falls below 300MB

#### Scenario: Unsaved blogs preserved

- **GIVEN** total cache size exceeds 300MB
- **AND** no blogs are marked as saved to gallery
- **WHEN** `evictIfNeeded` is called
- **THEN** no blogs SHALL be evicted (unsaved blogs are protected)

### Requirement: Clear all cache

The `CacheRepository.clearAll()` method SHALL delete the entire `blogs/` directory, clear the in-memory `_metadataStore`, and remove the persisted metadata from `shared_preferences`.

#### Scenario: Clear all with existing cache

- **WHEN** `clearAll` is called
- **THEN** the `blogs/` directory SHALL be deleted
- **AND** `_metadataStore` SHALL be empty
- **AND** the `cache_metadata` key SHALL be removed from `shared_preferences`

#### Scenario: Clear all with empty cache

- **WHEN** `clearAll` is called and no cache exists
- **THEN** the method SHALL complete without error

### Requirement: Clear single blog cache

The `CacheRepository.clearBlog(String blogId)` method SHALL delete the cache directory for the specified blogId and remove its metadata from both the in-memory store and persisted storage.

#### Scenario: Clear existing blog

- **WHEN** `clearBlog` is called with a blogId that has cached data
- **THEN** the blog's cache directory SHALL be deleted
- **AND** its metadata SHALL be removed from `_metadataStore`
- **AND** the updated metadata map SHALL be persisted

#### Scenario: Clear non-existent blog

- **WHEN** `clearBlog` is called with a blogId that has no cached data
- **THEN** the method SHALL complete without error
