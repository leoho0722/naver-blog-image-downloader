## ADDED Requirements

### Requirement: FetchResult class defined

The file `lib/data/models/fetch_result.dart` SHALL define a `FetchResult` class representing the result of fetching photo information from a blog.

- All fields of `FetchResult` SHALL be declared as `final`.
- `FetchResult` SHALL have a required `photos` property of type `List<PhotoEntity>`.
- `FetchResult` SHALL have a required `blogId` property of type `String`.
- `FetchResult` SHALL have a required `isFullyCached` property of type `bool`.

#### Scenario: FetchResult created with photo list

- **WHEN** a `FetchResult` is created with a list of `PhotoEntity`, `blogId`, and `isFullyCached`
- **THEN** all properties SHALL be accessible on the instance with their provided values

#### Scenario: FetchResult with empty photo list

- **WHEN** a `FetchResult` is created with an empty `photos` list
- **THEN** the `photos` property SHALL return an empty list

#### Scenario: FetchResult fields are immutable

- **WHEN** a `FetchResult` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

### Requirement: DownloadBatchResult class defined

The file `lib/data/models/download_batch_result.dart` SHALL define a `DownloadBatchResult` class representing the result of a batch photo download operation.

- All fields of `DownloadBatchResult` SHALL be declared as `final`.
- `DownloadBatchResult` SHALL have a required `successCount` property of type `int`.
- `DownloadBatchResult` SHALL have a required `failedPhotos` property of type `List<PhotoEntity>`.
- `DownloadBatchResult` SHALL have a `skippedCount` property of type `int` with a default value of `0`.
- `DownloadBatchResult` SHALL have an `errors` property of type `List<String>` with a default value of `const []`.
- `DownloadBatchResult` SHALL provide a `failureCount` getter of type `int` that returns `failedPhotos.length`.
- `DownloadBatchResult` SHALL provide an `isAllSuccessful` getter of type `bool`.

#### Scenario: DownloadBatchResult with all successful downloads

- **WHEN** a `DownloadBatchResult` is created with `successCount` greater than zero and an empty `failedPhotos` list
- **THEN** `isAllSuccessful` SHALL return `true`

#### Scenario: DownloadBatchResult with some failed downloads

- **WHEN** a `DownloadBatchResult` is created with a non-empty `failedPhotos` list
- **THEN** `isAllSuccessful` SHALL return `false`

#### Scenario: DownloadBatchResult fields are immutable

- **WHEN** a `DownloadBatchResult` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

#### Scenario: isAllSuccessful is computed from failedPhotos

- **WHEN** `isAllSuccessful` is accessed on a `DownloadBatchResult`
- **THEN** it SHALL return `true` if and only if `failedPhotos` is empty
