# settings-viewmodel Delta Spec (firebase-integration)

## ADDED Requirements

### Requirement: Operation logging in clearAllCache

`SettingsViewModel.clearAllCache()` SHALL log the cache clearing operation via `ref.read(logRepositoryProvider)` after `CacheRepository.clearAll()` completes.

`clearAllCache()` SHALL call `logClearCache` with the following parameter:

- `previousSizeBytes` -- the cache size in bytes before clearing, captured from `state.value?.cacheSizeBytes` prior to calling `CacheRepository.clearAll()`

The log call SHALL be fire-and-forget and SHALL NOT affect the cache clearing behavior or state transitions.

#### Scenario: Cache clear logged with previous size

- **GIVEN** the current cache size is 5242880 bytes (5 MB)
- **WHEN** `clearAllCache()` is called
- **THEN** `logClearCache` SHALL be called with `previousSizeBytes: 5242880`
- **AND** the cache SHALL still be cleared via `CacheRepository.clearAll()`
- **AND** the state SHALL transition to `AsyncData(SettingsData(cacheSizeBytes: 0, cachedBlogs: []))`

#### Scenario: Cache clear logged with zero size

- **GIVEN** the current cache size is 0 bytes
- **WHEN** `clearAllCache()` is called
- **THEN** `logClearCache` SHALL be called with `previousSizeBytes: 0`

#### Scenario: Log failure does not affect cache clearing

- **GIVEN** `logClearCache` throws an exception internally
- **WHEN** `clearAllCache()` is called
- **THEN** the cache SHALL still be cleared via `CacheRepository.clearAll()`
- **AND** the state SHALL still be updated to reflect the cleared cache
