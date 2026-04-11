## MODIFIED Requirements

### Requirement: load photos

PhotoGalleryViewModel SHALL provide a `load(List<PhotoEntity> photos, String blogId)` method.

When `load` is called, it SHALL store the photos list and blogId, call `notifyListeners()`, then asynchronously resolve all cached files via `CacheRepository.cachedFile` and store them in the `cachedFiles` map. After resolving all files, it SHALL call `notifyListeners()` again.

#### Scenario: load photo list

- **WHEN** `load` is called with a list of 10 photos and a blogId
- **THEN** `photos` SHALL contain 10 items
- **AND** `blogId` SHALL equal the provided value

#### Scenario: cached files resolved after load

- **WHEN** `load` completes asynchronously
- **THEN** `cachedFiles` SHALL contain an entry for each photo ID with the resolved `File?` value

## ADDED Requirements

### Requirement: cachedFiles property

PhotoGalleryViewModel SHALL expose a read-only `cachedFiles` property of type `Map<String, File?>`.

The map key SHALL be the photo ID, and the value SHALL be the cached `File` or `null` if not cached.

#### Scenario: initial cachedFiles state

- **WHEN** a PhotoGalleryViewModel is newly created
- **THEN** `cachedFiles` SHALL be an empty map

#### Scenario: cachedFiles populated after load

- **WHEN** `load` has completed for 5 photos where 3 are cached
- **THEN** `cachedFiles` SHALL contain 5 entries, with 3 having non-null `File` values and 2 having `null` values
