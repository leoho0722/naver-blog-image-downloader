## ADDED Requirements

### Requirement: PhotoEntity immutable class defined

The file `lib/data/models/photo_entity.dart` SHALL define a `PhotoEntity` class as an immutable domain model representing a single photo from a Naver Blog.

- `PhotoEntity` SHALL provide a `const` constructor.
- All fields of `PhotoEntity` SHALL be declared as `final`.
- `PhotoEntity` SHALL have a required `id` property of type `String`.
- `PhotoEntity` SHALL have a required `url` property of type `String`.
- `PhotoEntity` SHALL have a required `filename` property of type `String`.
- `PhotoEntity` SHALL have an optional `width` property of type `int?`.
- `PhotoEntity` SHALL have an optional `height` property of type `int?`.

#### Scenario: PhotoEntity created with all required fields

- **WHEN** a `PhotoEntity` is created with `id`, `url`, and `filename`
- **THEN** all three properties SHALL be accessible on the instance
- **AND** `width` and `height` SHALL be `null`

#### Scenario: PhotoEntity created with optional dimensions

- **WHEN** a `PhotoEntity` is created with `width` and `height` in addition to required fields
- **THEN** `width` and `height` SHALL return the provided integer values

#### Scenario: PhotoEntity is immutable

- **WHEN** a `PhotoEntity` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

#### Scenario: PhotoEntity supports const construction

- **WHEN** a `PhotoEntity` is created using `const PhotoEntity(...)`
- **THEN** the Dart compiler SHALL accept the expression as a compile-time constant
