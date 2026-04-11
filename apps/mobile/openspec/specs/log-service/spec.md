# log-service Specification

## Purpose

TBD - created by archiving change 'firebase-integration'. Update Purpose after archive.

## Requirements

### Requirement: LogService provider defined (keepAlive)

The file `lib/data/services/log_service.dart` SHALL define a `LogService` class annotated with `@Riverpod(keepAlive: true)`, producing a singleton provider that persists for the lifetime of the application.

- The `LogService` constructor SHALL accept an optional `FirebaseFirestore` parameter for testability, defaulting to `FirebaseFirestore.instance` when not provided.
- The generated provider SHALL be a keepAlive provider so that the `LogService` instance is never disposed.

#### Scenario: LogService provider is created as a singleton

- **WHEN** `logServiceProvider` is read from a `ProviderContainer`
- **THEN** it SHALL return a `LogService` instance
- **AND** subsequent reads SHALL return the same instance

#### Scenario: LogService accepts custom FirebaseFirestore for testing

- **GIVEN** a mock `FirebaseFirestore` instance
- **WHEN** a `LogService` is constructed with the mock
- **THEN** it SHALL use the provided mock instead of `FirebaseFirestore.instance`

#### Scenario: LogService defaults to FirebaseFirestore.instance

- **WHEN** a `LogService` is constructed without arguments
- **THEN** it SHALL use `FirebaseFirestore.instance` internally


<!-- @trace
source: firebase-integration
updated: 2026-03-30
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/android/app/google-services.json
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/services/auth_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/crashlytics_service.dart
  - naver_blog_image_downloader/lib/data/repositories/log_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/log_service.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: writeLog writes to Firestore

The `LogService` class SHALL provide a `writeLog` method that writes a log document to the user's log subcollection in Firestore.

- `writeLog` SHALL accept the following parameters:
  - `required String userId` -- the authenticated user's UID
  - `required String type` -- the log event type (e.g., `"fetch_photos"`, `"download"`)
  - `required Map<String, dynamic> data` -- the event-specific payload
  - `Map<String, dynamic>? deviceInfo` -- optional device information metadata
- `writeLog` SHALL return `Future<void>`.
- `writeLog` SHALL write a document to the Firestore path `users/{userId}/logs/{auto-id}` using the `add()` method on the collection reference.

#### Scenario: Log document written successfully

- **GIVEN** a valid userId, type, data, and optional deviceInfo
- **WHEN** `writeLog` is called
- **THEN** a new document SHALL be created at `users/{userId}/logs/{auto-id}`

#### Scenario: writeLog uses correct Firestore path

- **GIVEN** a userId of `"user-abc-123"`
- **WHEN** `writeLog` is called
- **THEN** the document SHALL be written to the collection `users/user-abc-123/logs`


<!-- @trace
source: firebase-integration
updated: 2026-03-30
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/android/app/google-services.json
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/services/auth_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/crashlytics_service.dart
  - naver_blog_image_downloader/lib/data/repositories/log_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/log_service.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Silent error handling

The `writeLog` method SHALL catch all exceptions silently. Logging failures MUST NOT propagate to the caller or affect application behavior.

- On any exception, `writeLog` SHALL call `debugPrint` with the error message for development diagnostics.
- `writeLog` SHALL NOT rethrow any exception.

#### Scenario: Firestore write fails

- **GIVEN** the Firestore write operation throws an exception (e.g., network error, permission denied)
- **WHEN** `writeLog` is called
- **THEN** the exception SHALL be caught silently
- **AND** `debugPrint` SHALL be called with the error information
- **AND** no exception SHALL propagate to the caller

#### Scenario: Firestore unavailable

- **GIVEN** the Firestore service is unreachable
- **WHEN** `writeLog` is called
- **THEN** the method SHALL complete without throwing
- **AND** `debugPrint` SHALL be called with the error information


<!-- @trace
source: firebase-integration
updated: 2026-03-30
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/android/app/google-services.json
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/services/auth_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/crashlytics_service.dart
  - naver_blog_image_downloader/lib/data/repositories/log_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/log_service.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Document structure

Each log document written by `writeLog` SHALL contain the following fields:

- `type` (String) -- the log event type, taken from the `type` parameter
- `timestamp` (FieldValue) -- set to `FieldValue.serverTimestamp()` for server-side timestamp
- `data` (Map) -- the event-specific payload, taken from the `data` parameter
- `deviceInfo` (Map, optional) -- included in the document only when the `deviceInfo` parameter is non-null

#### Scenario: Document with all fields

- **GIVEN** `type` is `"fetch_photos"`, `data` is `{"blogUrl": "https://..."}`, and `deviceInfo` is `{"os": "iOS", "version": "17.0"}`
- **WHEN** `writeLog` is called
- **THEN** the written document SHALL contain `type`, `timestamp` (server timestamp), `data`, and `deviceInfo` fields

#### Scenario: Document without deviceInfo

- **GIVEN** `type` is `"download"`, `data` is `{"blogId": "abc"}`, and `deviceInfo` is `null`
- **WHEN** `writeLog` is called
- **THEN** the written document SHALL contain `type`, `timestamp`, and `data` fields
- **AND** the `deviceInfo` field SHALL be omitted from the document

#### Scenario: Timestamp uses server time

- **WHEN** `writeLog` is called
- **THEN** the `timestamp` field SHALL be set to `FieldValue.serverTimestamp()`
- **AND** it SHALL NOT use a client-side `DateTime`

<!-- @trace
source: firebase-integration
updated: 2026-03-30
code:
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner/GoogleService-Info.plist
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/android/app/google-services.json
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/services/auth_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/crashlytics_service.dart
  - naver_blog_image_downloader/lib/data/repositories/log_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/log_service.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->