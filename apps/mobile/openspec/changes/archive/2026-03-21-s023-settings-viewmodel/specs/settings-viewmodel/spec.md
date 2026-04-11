## ADDED Requirements

### Requirement: Settings state properties

The `SettingsViewModel` class SHALL extend `ChangeNotifier` and provide a constructor that accepts a `CacheRepository` instance via the `required` named parameter `cacheRepository`.

The ViewModel SHALL expose the following read-only properties:
- `cacheSizeBytes` (int) — the total cache size in bytes
- `cachedBlogs` (List\<BlogCacheMetadata\>) — metadata for all cached blogs
- `isClearing` (bool) — whether a clear operation is in progress
- `formattedCacheSize` (String) — human-readable cache size string

#### Scenario: Initial state

- **WHEN** a new `SettingsViewModel` is created
- **THEN** `cacheSizeBytes` SHALL be `0`
- **AND** `cachedBlogs` SHALL be an empty list
- **AND** `isClearing` SHALL be `false`
- **AND** `formattedCacheSize` SHALL be `"0.0 MB"`

### Requirement: Load cache info

The `loadCacheInfo` method SHALL retrieve the total cache size and all blog metadata from `CacheRepository`.

#### Scenario: Load cache information

- **WHEN** `loadCacheInfo()` is called
- **THEN** `cacheSizeBytes` SHALL be updated with the value from `CacheRepository.totalCacheSize()`
- **AND** `cachedBlogs` SHALL be updated with the value from `CacheRepository.allMetadata()`
- **AND** `notifyListeners` SHALL be called

### Requirement: Formatted cache size

The `formattedCacheSize` getter SHALL convert `cacheSizeBytes` to a human-readable string with one decimal place in MB.

#### Scenario: Format cache size

- **GIVEN** `cacheSizeBytes` holds a value
- **WHEN** `formattedCacheSize` is accessed
- **THEN** the value SHALL be formatted as `"X.X MB"` where X.X is `cacheSizeBytes / 1024 / 1024` rounded to one decimal place

### Requirement: Clear all cache

The `clearAllCache` method SHALL clear all cached files and metadata via `CacheRepository.clearAll()`, then directly reset `cacheSizeBytes` to `0`, `cachedBlogs` to an empty list, and `formattedCacheSize` to its zero-state value. It SHALL NOT call `loadCacheInfo()`.

#### Scenario: Clear all cache successfully

- **WHEN** `clearAllCache()` is called
- **THEN** `isClearing` SHALL be set to `true` before the clear operation
- **AND** `CacheRepository.clearAll()` SHALL be called
- **AND** `cacheSizeBytes` SHALL be reset to `0`
- **AND** `cachedBlogs` SHALL be reset to an empty list
- **AND** `isClearing` SHALL be set to `false` after the operation completes
- **AND** `notifyListeners` SHALL be called

### Requirement: Clear blog cache

The `clearBlogCache` method SHALL clear the cached files and metadata for a specific blog via `CacheRepository.clearBlog(blogId)`, then reload cache info. It SHALL NOT set the `isClearing` flag.

#### Scenario: Clear specific blog cache

- **GIVEN** a valid `blogId`
- **WHEN** `clearBlogCache(blogId)` is called
- **THEN** `CacheRepository.clearBlog(blogId)` SHALL be called
- **AND** `loadCacheInfo()` SHALL be called after clearing
- **AND** `notifyListeners` SHALL be called
