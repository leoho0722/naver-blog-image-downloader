## MODIFIED Requirements

### Requirement: FetchResult class defined

The file `lib/data/models/fetch_result.dart` SHALL define a `FetchResult` class representing the result of fetching photo information from a blog.

- All fields of `FetchResult` SHALL be declared as `final`.
- `FetchResult` SHALL have a required `photos` property of type `List<PhotoEntity>`.
- `FetchResult` SHALL have a required `blogId` property of type `String`.
- `FetchResult` SHALL have a required `blogUrl` property of type `String`.
- `FetchResult` SHALL have a required `isFullyCached` property of type `bool`.

#### Scenario: FetchResult created with photo list

- **WHEN** a `FetchResult` is created with a list of `PhotoEntity`, `blogId`, `blogUrl`, and `isFullyCached`
- **THEN** all properties SHALL be accessible on the instance with their provided values

#### Scenario: FetchResult with empty photo list

- **WHEN** a `FetchResult` is created with an empty `photos` list
- **THEN** the `photos` property SHALL return an empty list

#### Scenario: FetchResult fields are immutable

- **WHEN** a `FetchResult` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

#### Scenario: FetchResult blogUrl holds the original blog URL

- **WHEN** a `FetchResult` is created with `blogUrl` "https://blog.naver.com/user/123"
- **THEN** the `blogUrl` property SHALL return "https://blog.naver.com/user/123"
