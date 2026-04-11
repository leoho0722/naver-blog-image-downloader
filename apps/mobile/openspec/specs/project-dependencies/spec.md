# project-dependencies Specification

## Purpose

TBD - created by archiving change 's001-project-dependencies'. Update Purpose after archive.

## Requirements

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
### Requirement: Platform minimum version

The project SHALL enforce minimum platform versions to ensure access to required native APIs.

- iOS deployment target (`IPHONEOS_DEPLOYMENT_TARGET`) SHALL be set to `17.0` (iOS 17.0).
- Android minimum SDK (`minSdk`) SHALL be set to `34` (Android 14.0).

#### Scenario: iOS minimum version

- **WHEN** the Xcode project build settings are inspected
- **THEN** `IPHONEOS_DEPLOYMENT_TARGET` SHALL be `17.0`

#### Scenario: Android minimum version

- **WHEN** `android/app/build.gradle.kts` is inspected
- **THEN** `minSdk` SHALL be `34`

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

<!-- @trace
source: s001-project-dependencies
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
tests:
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
-->

---
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

<!-- @trace
source: settings-theme-locale-l10n
updated: 2026-03-25
code:
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/l10n.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: iOS dependency management via SPM

The iOS project SHALL use Swift Package Manager (SPM) as the primary dependency manager, enabled via `flutter config --enable-swift-package-manager`. Flutter CLI SHALL automatically migrate the Xcode project to include `FlutterGeneratedPluginSwiftPackage` and a Build Pre-action script. Plugins that do not support SPM SHALL automatically fall back to CocoaPods. SPM and CocoaPods SHALL coexist when fallback is needed.

#### Scenario: SPM enabled for iOS build

- **GIVEN** SPM is enabled via Flutter config
- **WHEN** `flutter build ios` is executed
- **THEN** Flutter SHALL resolve plugin dependencies via SPM where supported
- **AND** unsupported plugins (e.g., `amplify_secure_storage`) SHALL fall back to CocoaPods automatically

#### Scenario: SPM and CocoaPods coexistence

- **GIVEN** at least one plugin requires CocoaPods fallback
- **WHEN** the project is built
- **THEN** `Podfile`, `Podfile.lock`, and `Pods/` SHALL be retained
- **AND** both SPM and CocoaPods dependencies SHALL resolve without conflict


<!-- @trace
source: cocoapods-to-spm
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Podfile.lock
-->

---
### Requirement: Crashlytics dSYM upload script for SPM

The Crashlytics dSYM upload Build Phase script SHALL locate the `upload-symbols` binary using a priority-ordered search: (1) DerivedData SourcePackages via `find`, (2) Xcode SPM path via `${BUILD_DIR}`, (3) CocoaPods path via `${PODS_ROOT}`. The script SHALL only execute for non-Debug configurations. If the binary is not found, it SHALL print a warning and skip the upload.

#### Scenario: dSYM upload in Release build

- **GIVEN** the build configuration is Release
- **WHEN** the Upload dSYM Build Phase runs
- **THEN** it SHALL locate `upload-symbols` and upload dSYM files to Firebase Crashlytics

#### Scenario: dSYM upload skipped in Debug build

- **GIVEN** the build configuration is Debug
- **WHEN** the Upload dSYM Build Phase runs
- **THEN** it SHALL skip execution entirely

<!-- @trace
source: cocoapods-to-spm
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/xcshareddata/xcschemes/Runner.xcscheme
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Podfile.lock
-->