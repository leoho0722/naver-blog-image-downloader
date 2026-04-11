## ADDED Requirements

### Requirement: Cache eviction uses named constant for size estimation

The `CacheRepository.evictIfNeeded` method SHALL use a named constant `_estimatedPhotoSizeBytes` (value: 500000) for estimating per-photo disk usage during eviction calculations, instead of an inline magic number.

#### Scenario: Eviction size estimation uses constant

- **WHEN** `evictIfNeeded` calculates freed space for a blog
- **THEN** it SHALL multiply `meta.photoCount` by `_estimatedPhotoSizeBytes`

#### Scenario: Constant value is 500000

- **WHEN** `_estimatedPhotoSizeBytes` is inspected
- **THEN** its value SHALL be `500000`
