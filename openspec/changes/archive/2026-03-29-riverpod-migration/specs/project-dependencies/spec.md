## MODIFIED Requirements

### Requirement: Runtime dependencies declared

The `pubspec.yaml` file SHALL declare the following runtime dependencies:

- `flutter` SDK
- `flutter_localizations` SDK
- `intl: any`
- `cupertino_icons: ^1.0.8`
- `flutter_riverpod: ^3.3.1`
- `riverpod_annotation: ^4.0.2`
- `go_router: ^17.1.0`
- `dio: ^5.7.0`
- `crypto: ^3.0.6`
- `path_provider: ^2.1.5`
- `path: ^1.9.1`
- `shared_preferences: ^2.3.4`
- `amplify_flutter: ^2.0.0`
- `amplify_api: ^2.0.0`
- `package_info_plus: ^9.0.0`

The `provider` package SHALL NOT be present.

#### Scenario: All runtime packages present

- **GIVEN** the `pubspec.yaml` file is inspected
- **WHEN** checking the `dependencies` section
- **THEN** `flutter_riverpod: ^3.3.1` SHALL be present
- **AND** `riverpod_annotation: ^4.0.2` SHALL be present
- **AND** `provider` SHALL NOT be present

#### Scenario: Flutter pub get succeeds

- **GIVEN** the `pubspec.yaml` is valid
- **WHEN** `flutter pub get` is executed
- **THEN** it SHALL complete without errors

### Requirement: Dev dependencies declared

The `pubspec.yaml` file SHALL declare the following dev dependencies:

- `flutter_test` SDK
- `flutter_lints: ^6.0.0`
- `mocktail: ^1.0.4`
- `build_runner: ^2.13.1`
- `riverpod_generator: ^4.0.3`
- `riverpod_lint: ^3.1.3`
- `custom_lint: ^0.8.1`

#### Scenario: Code generation dependencies available

- **GIVEN** the `pubspec.yaml` file is inspected
- **WHEN** checking the `dev_dependencies` section
- **THEN** `build_runner: ^2.13.1` SHALL be present
- **AND** `riverpod_generator: ^4.0.3` SHALL be present
- **AND** `riverpod_lint: ^3.1.3` SHALL be present
- **AND** `custom_lint: ^0.8.1` SHALL be present

#### Scenario: Mocktail available for tests

- **GIVEN** the `pubspec.yaml` file is inspected
- **WHEN** checking the `dev_dependencies` section
- **THEN** `mocktail: ^1.0.4` SHALL be present
