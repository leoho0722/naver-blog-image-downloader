## ADDED Requirements

### Requirement: LocalStorageService registered in DI

The `LocalStorageService` SHALL be registered as a `Provider` in the `MultiProvider` service layer of `lib/main.dart`. The `SharedPreferences` instance SHALL be obtained via `await SharedPreferences.getInstance()` before `runApp` and passed to the `LocalStorageService` constructor.

#### Scenario: LocalStorageService available in widget tree

- **WHEN** a descendant widget calls `context.read<LocalStorageService>()`
- **THEN** it SHALL receive a valid `LocalStorageService` instance backed by `SharedPreferences`
