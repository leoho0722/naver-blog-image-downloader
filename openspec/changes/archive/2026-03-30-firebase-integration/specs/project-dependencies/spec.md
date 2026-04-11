# project-dependencies Delta Spec (firebase-integration)

## MODIFIED Requirements

### Requirement: Runtime dependencies declared

The `pubspec.yaml` file SHALL additionally declare the following runtime dependencies:

- `firebase_core: ^3.12.1`
- `firebase_auth: ^5.5.1`
- `cloud_firestore: ^5.6.5`
- `firebase_crashlytics: ^4.3.5`
- `device_info_plus: ^11.3.3`

These packages SHALL be added alongside the existing runtime dependencies. All previously declared runtime dependencies SHALL remain unchanged.

#### Scenario: Firebase runtime packages present

- **GIVEN** the `pubspec.yaml` file is inspected
- **WHEN** checking the `dependencies` section
- **THEN** `firebase_core` SHALL be present
- **AND** `firebase_auth` SHALL be present
- **AND** `cloud_firestore` SHALL be present
- **AND** `firebase_crashlytics` SHALL be present
- **AND** `device_info_plus` SHALL be present

#### Scenario: Flutter pub get succeeds with Firebase packages

- **GIVEN** the `pubspec.yaml` includes all Firebase and existing dependencies
- **WHEN** `flutter pub get` is executed
- **THEN** it SHALL complete without errors

---

### Requirement: Dev dependencies declared

The Android build configuration SHALL additionally declare the `com.google.gms.google-services` Gradle plugin to process `google-services.json`.

#### Scenario: Google Services plugin applied to Android

- **GIVEN** the `android/app/build.gradle.kts` file is inspected
- **WHEN** checking the `plugins` block
- **THEN** `com.google.gms.google-services` SHALL be applied

#### Scenario: Google Services plugin declared in settings

- **GIVEN** the `android/settings.gradle.kts` file is inspected
- **WHEN** checking the `plugins` block
- **THEN** `com.google.gms.google-services` SHALL be declared with `apply false`
