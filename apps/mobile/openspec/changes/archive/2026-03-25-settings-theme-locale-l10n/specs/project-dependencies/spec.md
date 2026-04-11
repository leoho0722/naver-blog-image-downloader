## ADDED Requirements

### Requirement: Localization dependencies

The `pubspec.yaml` SHALL declare the following additional dependencies:

- `flutter_localizations` from the Flutter SDK
- `intl` (version managed by `flutter_localizations`)

The `flutter` section SHALL include `generate: true` to enable code generation for localization.

#### Scenario: flutter_localizations declared

- **WHEN** `pubspec.yaml` is inspected
- **THEN** `flutter_localizations` SHALL be declared under `dependencies` with `sdk: flutter`

#### Scenario: generate flag enabled

- **WHEN** the `flutter` section of `pubspec.yaml` is inspected
- **THEN** `generate` SHALL be set to `true`
