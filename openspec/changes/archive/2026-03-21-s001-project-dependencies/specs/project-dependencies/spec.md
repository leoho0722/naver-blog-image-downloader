## ADDED Requirements

### Requirement: Runtime dependencies declared

The `pubspec.yaml` file SHALL declare the following runtime dependencies: `provider`, `go_router`, `dio`, `image_gallery_saver`, `crypto`, `path_provider`, `path`, `shared_preferences`, `amplify_flutter`, `amplify_api`.

#### Scenario: All runtime packages present

- **WHEN** the pubspec.yaml is inspected
- **THEN** all ten runtime dependencies SHALL be listed under `dependencies`

#### Scenario: Flutter pub get succeeds

- **WHEN** `flutter pub get` is executed in the project directory
- **THEN** the command SHALL complete without errors

### Requirement: Dev dependencies declared

The `pubspec.yaml` file SHALL declare `mocktail` as a dev dependency for testing.

#### Scenario: Mocktail available for tests

- **WHEN** the pubspec.yaml is inspected
- **THEN** `mocktail` SHALL be listed under `dev_dependencies`

### Requirement: MVVM directory skeleton established

The project SHALL contain a `lib/` directory skeleton that reflects the MVVM layered architecture with the following subdirectories:
- `config/`
- `data/services/`, `data/repositories/`, `data/models/`, `data/models/dtos/`
- `ui/blog_input/view_model/`, `ui/blog_input/widgets/`
- `ui/download/view_model/`, `ui/download/widgets/`
- `ui/photo_gallery/view_model/`, `ui/photo_gallery/widgets/`
- `ui/photo_detail/view_model/`, `ui/photo_detail/widgets/`
- `ui/settings/view_model/`, `ui/settings/widgets/`
- `ui/core/`
- `routing/`
- `utils/`

#### Scenario: All directories exist

- **WHEN** the lib/ directory tree is listed
- **THEN** all specified subdirectories SHALL exist

#### Scenario: Directories are version-controlled

- **WHEN** the project is committed to Git
- **THEN** all empty directories SHALL contain a `.gitkeep` file to ensure they are tracked
