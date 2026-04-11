## ADDED Requirements

### Requirement: Parallel download concurrency control

The `PhotoRepository.downloadAllToCache` method SHALL limit concurrent downloads to a maximum of `_maxConcurrency` (4) using a counter-based semaphore pattern.

The implementation SHALL use a `running` counter and a `Completer<void>` queue. When `running >= _maxConcurrency`, new downloads SHALL wait on a `Completer` until a running download completes and signals the gate. The `_maxConcurrency` value SHALL be declared as a named constant.

#### Scenario: Concurrent downloads limited to 4

- **WHEN** `downloadAllToCache` is called with 10 photos
- **THEN** at most 4 downloads SHALL execute concurrently at any point in time

#### Scenario: All downloads complete

- **WHEN** `downloadAllToCache` finishes
- **THEN** every photo SHALL have been attempted exactly once regardless of concurrency gating

## ADDED Requirements

### Requirement: BlogCacheMetadata stores original blog URL

The `PhotoRepository.downloadAllToCache` method SHALL accept a required `blogUrl` parameter of type `String`. When creating `BlogCacheMetadata`, the `blogUrl` field SHALL be set to this parameter value, NOT to a photo image URL.

#### Scenario: Metadata records original blog URL

- **WHEN** `downloadAllToCache` completes with `blogUrl` "https://blog.naver.com/user/123"
- **THEN** the persisted `BlogCacheMetadata.blogUrl` SHALL be "https://blog.naver.com/user/123"

#### Scenario: blogUrl parameter is required

- **WHEN** `downloadAllToCache` is called
- **THEN** the `blogUrl` parameter SHALL be required at compile time
