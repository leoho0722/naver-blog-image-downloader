## ADDED Requirements

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
