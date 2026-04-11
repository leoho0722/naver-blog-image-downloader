## MODIFIED Requirements

### Requirement: FetchResult class defined

The file `lib/data/models/fetch_result.dart` SHALL define a `FetchResult` class representing the result of fetching photo information from a blog.

- All fields of `FetchResult` SHALL be declared as `final`.
- `FetchResult` SHALL have a required `photos` property of type `List<PhotoEntity>`.
- `FetchResult` SHALL have a required `blogId` property of type `String`.
- `FetchResult` SHALL have a required `blogUrl` property of type `String`.
- `FetchResult` SHALL have a required `isFullyCached` property of type `bool`.
- `FetchResult` SHALL have a `totalImages` property of type `int` with a default value of `0`.
- `FetchResult` SHALL have a `failureDownloads` property of type `int` with a default value of `0`.
- `FetchResult` SHALL have a `fetchErrors` property of type `List<String>` with a default value of `const []`.

#### Scenario: FetchResult created with photo list

- **WHEN** a `FetchResult` is created with a list of `PhotoEntity`, `blogId`, `blogUrl`, and `isFullyCached`
- **THEN** all properties SHALL be accessible on the instance with their provided values
- **AND** `totalImages` SHALL default to `0`
- **AND** `failureDownloads` SHALL default to `0`
- **AND** `fetchErrors` SHALL default to an empty list

#### Scenario: FetchResult with fetch failure info

- **WHEN** a `FetchResult` is created with `totalImages: 31`, `failureDownloads: 1`, and a non-empty `fetchErrors` list
- **THEN** the `totalImages` property SHALL return `31`
- **AND** the `failureDownloads` property SHALL return `1`
- **AND** the `fetchErrors` property SHALL return the provided error messages

#### Scenario: FetchResult fields are immutable

- **WHEN** a `FetchResult` instance is created
- **THEN** none of its properties SHALL be reassignable after construction
