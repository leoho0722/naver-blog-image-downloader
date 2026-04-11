## ADDED Requirements

### Requirement: SHA-256 blogId generation

The `CacheRepository.blogId(String blogUrl)` method SHALL compute a SHA-256 hash of the given blog URL and return the first 16 hexadecimal characters as the blog identifier.

#### Scenario: Consistent blogId for same URL

- **WHEN** `blogId` is called with the same URL multiple times
- **THEN** it SHALL return the same 16-character hexadecimal string each time

#### Scenario: Different blogId for different URLs

- **WHEN** `blogId` is called with two distinct URLs
- **THEN** it SHALL return different identifiers

### Requirement: Lazy initialization

The `CacheRepository` SHALL use lazy initialization. The `_ensureInitialized()` method SHALL be called before any public method that requires filesystem or metadata access. Initialization SHALL obtain the application cache directory via `path_provider` and load persisted metadata from `shared_preferences`.

#### Scenario: First public method call triggers initialization

- **WHEN** any public method is called on a freshly constructed `CacheRepository`
- **THEN** `_ensureInitialized()` SHALL execute exactly once, setting `_initialized` to `true`

#### Scenario: Subsequent calls skip initialization

- **WHEN** a public method is called after initialization has completed
- **THEN** `_ensureInitialized()` SHALL return immediately without re-initializing

### Requirement: Cache directory management

The `CacheRepository.cacheDirectory(String blogId)` method SHALL return a `Directory` at the path `<appCacheDir>/blogs/<blogId>`. If the directory does not exist, it SHALL be created recursively.

#### Scenario: Directory created on first access

- **WHEN** `cacheDirectory` is called with a blogId that has no existing directory
- **THEN** the directory SHALL be created and its `Directory` reference returned

#### Scenario: Existing directory returned

- **WHEN** `cacheDirectory` is called with a blogId whose directory already exists
- **THEN** the existing `Directory` reference SHALL be returned without error

### Requirement: File storage

The `CacheRepository.storeFile(File tempFile, String filename, String blogId)` method SHALL copy the given temporary file into the cache directory for the specified blogId with the given filename.

#### Scenario: File copied to cache

- **WHEN** `storeFile` is called with a valid temporary file
- **THEN** the file SHALL be copied to `<cacheDir>/<blogId>/<filename>`
- **AND** a `File` reference to the cached copy SHALL be returned

#### Scenario: Overwrite existing cached file

- **WHEN** `storeFile` is called with a filename that already exists in the cache
- **THEN** the existing file SHALL be overwritten with the new content

### Requirement: Cached file retrieval

The `CacheRepository.cachedFile(String filename, String blogId)` method SHALL check whether a file with the given name exists in the cache directory for the specified blogId.

#### Scenario: File exists in cache

- **WHEN** `cachedFile` is called for a filename that exists in the blog's cache directory
- **THEN** it SHALL return the corresponding `File` reference

#### Scenario: File not in cache

- **WHEN** `cachedFile` is called for a filename that does not exist in the blog's cache directory
- **THEN** it SHALL return `null`

### Requirement: Blog fully cached check

The `CacheRepository.isBlogFullyCached(String blogId, List<String> expectedFilenames)` method SHALL verify that every filename in the expected list exists in the blog's cache directory.

#### Scenario: All files cached

- **WHEN** all expected filenames exist in the blog's cache directory
- **THEN** `isBlogFullyCached` SHALL return `true`

#### Scenario: Some files missing

- **WHEN** one or more expected filenames do not exist in the blog's cache directory
- **THEN** `isBlogFullyCached` SHALL return `false`

#### Scenario: Empty expected list

- **WHEN** the expected filenames list is empty
- **THEN** `isBlogFullyCached` SHALL return `true`

### Requirement: Metadata persistence

The `CacheRepository.updateMetadata(BlogCacheMetadata metadata)` method SHALL store the given metadata in the in-memory `_metadataStore` map (keyed by blogId) and persist the entire metadata map as a JSON string to `shared_preferences` under the key `cache_metadata`.

#### Scenario: Metadata stored and persisted

- **WHEN** `updateMetadata` is called with a `BlogCacheMetadata` instance
- **THEN** the metadata SHALL be accessible via `metadata(blogId)`
- **AND** the metadata SHALL be persisted to `shared_preferences`

#### Scenario: Metadata survives restart

- **GIVEN** metadata has been persisted via `updateMetadata`
- **WHEN** a new `CacheRepository` instance initializes
- **THEN** all previously persisted metadata SHALL be loaded into `_metadataStore`

### Requirement: Metadata query

The `CacheRepository` SHALL provide `metadata(String blogId)` returning `BlogCacheMetadata?` and `allMetadata()` returning `List<BlogCacheMetadata>` for querying the in-memory metadata store.

#### Scenario: Query existing metadata

- **WHEN** `metadata(blogId)` is called for a blogId with stored metadata
- **THEN** it SHALL return the corresponding `BlogCacheMetadata`

#### Scenario: Query non-existent metadata

- **WHEN** `metadata(blogId)` is called for a blogId without stored metadata
- **THEN** it SHALL return `null`

#### Scenario: List all metadata

- **WHEN** `allMetadata()` is called
- **THEN** it SHALL return a list of all stored `BlogCacheMetadata` entries
