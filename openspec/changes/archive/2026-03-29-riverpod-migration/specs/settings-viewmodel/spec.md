## REMOVED Requirements

### Requirement: Settings page watches AppSettingsViewModel

**Reason**: This requirement described implementation details (`context.watch`) that are replaced by `ref.watch` in the Riverpod architecture. The behavior (settings page accessing AppSettingsViewModel state) is unchanged and covered by the view spec.

**Migration**: Replace `context.watch<AppSettingsViewModel>()` with `ref.watch(appSettingsViewModelProvider)` in the settings view.

## MODIFIED Requirements

### Requirement: Settings state properties

`SettingsViewModel` SHALL extend the generated `_$SettingsViewModel` base class (Riverpod `AsyncNotifier`). It SHALL NOT extend `ChangeNotifier`. The `SettingsState` enum SHALL be removed. The state type SHALL be `AsyncValue<SettingsData>` where `SettingsData` is an immutable class with `cacheSizeBytes` (default `0`) and `cachedBlogs` (default empty list).

#### Scenario: Initial state

- **GIVEN** `SettingsViewModel` has not yet completed initialization
- **WHEN** `settingsViewModelProvider` is watched
- **THEN** it SHALL return `AsyncLoading`

### Requirement: Load cache info

`SettingsViewModel.build()` SHALL asynchronously load cache size and blog metadata from `CacheRepository` and return a `SettingsData`. There SHALL be no separate `loadCacheInfo()` method.

#### Scenario: Load cache information

- **GIVEN** `CacheRepository` reports 5242880 bytes and 2 cached blogs
- **WHEN** `build()` completes
- **THEN** the state SHALL be `AsyncData(SettingsData(cacheSizeBytes: 5242880, cachedBlogs: [2 items]))`

### Requirement: Formatted cache size

`SettingsData.formattedCacheSize` SHALL return a human-readable string in MB format.

#### Scenario: Format cache size

- **GIVEN** `SettingsData` has `cacheSizeBytes: 5242880`
- **WHEN** `formattedCacheSize` is accessed
- **THEN** it SHALL return `"5.0 MB"`

### Requirement: Clear all cache

`clearAllCache()` SHALL set the state to `AsyncLoading`, call `CacheRepository.clearAll()`, then set the state to `AsyncData(SettingsData())` with zeroed values.

#### Scenario: Clear all cache successfully

- **GIVEN** the current state is `AsyncData` with cached data
- **WHEN** `clearAllCache()` is called
- **THEN** the state SHALL transition to `AsyncLoading`
- **AND** `CacheRepository.clearAll()` SHALL be called
- **AND** the state SHALL transition to `AsyncData(SettingsData(cacheSizeBytes: 0, cachedBlogs: []))`
