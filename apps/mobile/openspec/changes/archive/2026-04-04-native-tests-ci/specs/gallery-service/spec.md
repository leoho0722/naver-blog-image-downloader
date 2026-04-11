## ADDED Requirements

### Requirement: PhotoSaveable protocol and interface

The iOS codebase SHALL define a `PhotoSaveable` protocol in `ios/Runner/Services/PhotoSaveable.swift` with the method `func saveToGallery(filePath: String) async throws -> Bool`. The Android codebase SHALL define a `PhotoSaveable` interface in `android/app/src/main/kotlin/.../services/PhotoSaveable.kt` with the method `suspend fun saveToGallery(filePath: String, totalCount: Int = 1): Boolean`. Both `PhotoService` implementations SHALL conform to / implement `PhotoSaveable`.

#### Scenario: iOS PhotoService conforms to PhotoSaveable

- **GIVEN** the iOS `PhotoService` class
- **WHEN** it is inspected
- **THEN** it SHALL conform to the `PhotoSaveable` protocol

#### Scenario: Android PhotoService implements PhotoSaveable

- **GIVEN** the Android `PhotoService` class
- **WHEN** it is inspected
- **THEN** it SHALL implement the `PhotoSaveable` interface

#### Scenario: PhotoSaveable used for dependency injection in ViewModels

- **GIVEN** a `PhotoViewerViewModel` on either platform
- **WHEN** it is constructed
- **THEN** it SHALL accept a `PhotoSaveable` parameter instead of creating `PhotoService` directly
