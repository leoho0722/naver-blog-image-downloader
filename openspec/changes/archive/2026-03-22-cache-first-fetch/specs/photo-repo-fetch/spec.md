## ADDED Requirements

### Requirement: Cache-first check before API call

The `fetchPhotos` method SHALL check the local cache before calling the Lambda API. The check SHALL proceed as follows:

1. Derive `blogId` from the blog URL
2. Call `CacheRepository.metadata(blogId)` to retrieve cached metadata
3. If metadata exists, call `CacheRepository.isBlogFullyCached(blogId, metadata.filenames)` to verify all files are present
4. If fully cached, construct `PhotoEntity` list from `metadata.filenames` and return `Result.ok(FetchResult(..., isFullyCached: true))` without calling the API
5. If metadata does not exist or cache is incomplete, proceed with the normal API flow

The `PhotoEntity` instances constructed from cache SHALL use `photo_$index` as `id` and the cached filename as `filename`. The `url` field SHALL be set to an empty string since no download is needed.

#### Scenario: Blog is fully cached

- **GIVEN** a blog URL whose metadata exists in the cache
- **AND** all files listed in `metadata.filenames` exist on disk
- **WHEN** `fetchPhotos` is called with that URL
- **THEN** `Result.ok(FetchResult)` SHALL be returned with `isFullyCached: true`
- **AND** `ApiService.submitJob` SHALL NOT be called

#### Scenario: Blog has metadata but incomplete cache

- **GIVEN** a blog URL whose metadata exists in the cache
- **AND** one or more files listed in `metadata.filenames` are missing from disk
- **WHEN** `fetchPhotos` is called with that URL
- **THEN** the normal API flow (submitJob + polling) SHALL proceed

#### Scenario: Blog has no cached metadata

- **GIVEN** a blog URL with no cached metadata
- **WHEN** `fetchPhotos` is called with that URL
- **THEN** the normal API flow (submitJob + polling) SHALL proceed
