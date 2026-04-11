# auth-service Specification

## Purpose

TBD - created by archiving change 'firebase-integration'. Update Purpose after archive.

## Requirements

### Requirement: AuthService provider defined (keepAlive)

The file `lib/data/services/auth_service.dart` SHALL define an `AuthService` class annotated with `@Riverpod(keepAlive: true)`, producing a singleton provider that persists for the lifetime of the application.

- The `AuthService` constructor SHALL accept an optional `FirebaseAuth` parameter for testability, defaulting to `FirebaseAuth.instance` when not provided.
- The generated provider SHALL be a keepAlive provider so that the `AuthService` instance is never disposed.

#### Scenario: AuthService provider is created as a singleton

- **WHEN** `authServiceProvider` is read from a `ProviderContainer`
- **THEN** it SHALL return an `AuthService` instance
- **AND** subsequent reads SHALL return the same instance

#### Scenario: AuthService accepts custom FirebaseAuth for testing

- **GIVEN** a mock `FirebaseAuth` instance
- **WHEN** an `AuthService` is constructed with the mock
- **THEN** it SHALL use the provided mock instead of `FirebaseAuth.instance`

#### Scenario: AuthService defaults to FirebaseAuth.instance

- **WHEN** an `AuthService` is constructed without arguments
- **THEN** it SHALL use `FirebaseAuth.instance` internally


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
### Requirement: currentUserId getter

The `AuthService` class SHALL provide a `currentUserId` getter that returns the UID of the currently signed-in user, or `null` if no user is signed in.

- `currentUserId` SHALL return `String?`.
- `currentUserId` SHALL be computed as `_auth.currentUser?.uid`.

#### Scenario: User is signed in

- **GIVEN** a user is currently signed in with Firebase Auth
- **WHEN** `currentUserId` is accessed
- **THEN** it SHALL return the signed-in user's UID as a non-null `String`

#### Scenario: No user is signed in

- **GIVEN** no user is currently signed in with Firebase Auth
- **WHEN** `currentUserId` is accessed
- **THEN** it SHALL return `null`


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
### Requirement: ensureSignedIn anonymous auth

The `AuthService` class SHALL provide an `ensureSignedIn()` method that ensures the user is signed in anonymously, returning the user's UID on success or `null` on failure.

- `ensureSignedIn` SHALL return `Future<String?>`.
- `ensureSignedIn` SHALL first check `_auth.currentUser`; if a user is already signed in, it SHALL return `currentUser.uid` immediately without calling `signInAnonymously()`.
- If no user is signed in, `ensureSignedIn` SHALL call `_auth.signInAnonymously()`.
- On successful anonymous sign-in, `ensureSignedIn` SHALL set the Crashlytics user identifier by calling `FirebaseCrashlytics.instance.setUserIdentifier(uid)` and then return the UID.
- On any exception during sign-in, `ensureSignedIn` SHALL catch the exception silently (no rethrow) and return `null`.

#### Scenario: User already signed in

- **GIVEN** a user is already signed in with Firebase Auth
- **WHEN** `ensureSignedIn()` is called
- **THEN** it SHALL return the existing user's UID
- **AND** it SHALL NOT call `signInAnonymously()`

#### Scenario: No user signed in, anonymous sign-in succeeds

- **GIVEN** no user is currently signed in
- **WHEN** `ensureSignedIn()` is called
- **THEN** it SHALL call `signInAnonymously()`
- **AND** it SHALL set the Crashlytics user identifier to the new UID
- **AND** it SHALL return the new user's UID

#### Scenario: No user signed in, anonymous sign-in fails

- **GIVEN** no user is currently signed in
- **AND** `signInAnonymously()` throws an exception
- **WHEN** `ensureSignedIn()` is called
- **THEN** it SHALL catch the exception silently
- **AND** it SHALL return `null`


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
### Requirement: Auth state persistence

Firebase Auth SHALL automatically persist the anonymous user's authentication state across app restarts. The `AuthService` SHALL NOT implement any custom persistence logic.

- On subsequent app launches, `_auth.currentUser` SHALL already be populated with the previously signed-in anonymous user if Firebase Auth has persisted the session.

#### Scenario: Auth state persists across app restart

- **GIVEN** a user was previously signed in anonymously
- **WHEN** the app restarts and `AuthService` is initialized
- **THEN** `currentUserId` SHALL return the same UID as the previous session
- **AND** `ensureSignedIn()` SHALL return the UID without calling `signInAnonymously()`

#### Scenario: Auth state cleared externally

- **GIVEN** the Firebase Auth session has been cleared (e.g., app data wiped)
- **WHEN** the app starts and `ensureSignedIn()` is called
- **THEN** it SHALL call `signInAnonymously()` to create a new anonymous session

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