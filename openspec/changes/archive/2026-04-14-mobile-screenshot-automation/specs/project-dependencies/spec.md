## ADDED Requirements

### Requirement: Screenshot mode runtime dependency declared

The `apps/mobile/pubspec.yaml` file SHALL declare `flutter_launch_arguments` as a runtime dependency so the app can read screenshot launch arguments at runtime.

#### Scenario: Screenshot runtime dependency present

- **WHEN** `apps/mobile/pubspec.yaml` is inspected
- **THEN** `flutter_launch_arguments` SHALL be declared under `dependencies`

#### Scenario: Screenshot dependency participates in pub resolution

- **WHEN** `flutter pub get` is executed for `apps/mobile`
- **THEN** dependency resolution SHALL succeed with `flutter_launch_arguments` included
