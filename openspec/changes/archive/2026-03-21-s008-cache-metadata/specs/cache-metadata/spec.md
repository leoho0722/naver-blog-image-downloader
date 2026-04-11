## ADDED Requirements

### Requirement: BlogCacheMetadata class defined

The file `lib/data/models/blog_cache_metadata.dart` SHALL define a `BlogCacheMetadata` class representing cache metadata for a downloaded blog.

- All fields of `BlogCacheMetadata` SHALL be declared as `final`.
- `BlogCacheMetadata` SHALL have a required `blogId` property of type `String`.
- `BlogCacheMetadata` SHALL have a required `blogUrl` property of type `String`.
- `BlogCacheMetadata` SHALL have a required `photoCount` property of type `int`.
- `BlogCacheMetadata` SHALL have a required `downloadedAt` property of type `DateTime`.
- `BlogCacheMetadata` SHALL have a required `isSavedToGallery` property of type `bool`.
- `BlogCacheMetadata` SHALL have a required `filenames` property of type `List<String>`.

#### Scenario: BlogCacheMetadata created with all fields

- **WHEN** a `BlogCacheMetadata` is created with all required fields
- **THEN** all properties SHALL be accessible on the instance with their provided values

#### Scenario: BlogCacheMetadata fields are immutable

- **WHEN** a `BlogCacheMetadata` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

### Requirement: BlogCacheMetadata JSON serialization defined

The `BlogCacheMetadata` class SHALL support JSON serialization and deserialization.

- `BlogCacheMetadata` SHALL provide a `toJson()` method that returns a `Map<String, dynamic>`.
- `BlogCacheMetadata` SHALL provide a `factory BlogCacheMetadata.fromJson(Map<String, dynamic> json)` constructor.
- The `downloadedAt` property SHALL be serialized as an ISO 8601 string in `toJson()`.
- The `fromJson` constructor SHALL parse the ISO 8601 string back to a `DateTime` for `downloadedAt`.

#### Scenario: BlogCacheMetadata serialized to JSON

- **WHEN** `toJson()` is called on a `BlogCacheMetadata` instance
- **THEN** it SHALL return a `Map<String, dynamic>` containing all fields
- **AND** `downloadedAt` SHALL be represented as an ISO 8601 string

#### Scenario: BlogCacheMetadata deserialized from JSON

- **WHEN** `BlogCacheMetadata.fromJson(json)` is called with a valid JSON map
- **THEN** it SHALL return a `BlogCacheMetadata` instance with all properties matching the JSON data
- **AND** `downloadedAt` SHALL be parsed from the ISO 8601 string to a `DateTime`

#### Scenario: JSON round-trip consistency

- **WHEN** a `BlogCacheMetadata` is serialized with `toJson()` and then deserialized with `fromJson()`
- **THEN** the resulting instance SHALL have equivalent property values to the original

### Requirement: BlogCacheMetadata copyWith defined

The `BlogCacheMetadata` class SHALL provide a `copyWith` method for partial updates.

- `copyWith` SHALL accept an optional `bool? isSavedToGallery` parameter.
- `copyWith` SHALL return a new `BlogCacheMetadata` instance.

#### Scenario: copyWith updates isSavedToGallery

- **WHEN** `copyWith(isSavedToGallery: true)` is called on a `BlogCacheMetadata` instance where `isSavedToGallery` is `false`
- **THEN** the returned instance SHALL have `isSavedToGallery` set to `true`
- **AND** all other properties SHALL remain unchanged

#### Scenario: copyWith with no arguments

- **WHEN** `copyWith()` is called with no arguments
- **THEN** the returned instance SHALL have all properties equal to the original instance
