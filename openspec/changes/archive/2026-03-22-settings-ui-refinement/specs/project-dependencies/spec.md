## MODIFIED Requirements

### Requirement: Runtime dependencies declared

The `pubspec.yaml` file SHALL declare the following runtime dependencies: `provider`, `go_router`, `dio`, `image_gallery_saver`, `crypto`, `path_provider`, `path`, `shared_preferences`, `amplify_flutter`, `amplify_api`, `package_info_plus`.

#### Scenario: All runtime packages present

- **WHEN** the pubspec.yaml is inspected
- **THEN** all eleven runtime dependencies SHALL be listed under `dependencies`

#### Scenario: Flutter pub get succeeds

- **WHEN** `flutter pub get` is executed in the project directory
- **THEN** the command SHALL complete without errors
