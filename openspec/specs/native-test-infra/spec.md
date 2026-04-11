# native-test-infra Specification

## Purpose

TBD - created by archiving change 'native-tests-ci'. Update Purpose after archive.

## Requirements

### Requirement: iOS Swift Testing unit tests

The iOS `RunnerTests` target SHALL contain unit tests written with the Swift Testing framework (`import Testing`, `@Test`, `@Suite`, `#expect`). The tests SHALL cover `ThemeColors` ARGB-to-UIColor conversion, `PhotoFileInfo` formatting logic, and `PhotoViewerViewModel` synchronous state management. Each test struct SHALL use `@testable import Runner` to access internal types.

#### Scenario: ThemeColors ARGB conversion verified

- **GIVEN** a `ThemeColors` initialized from an ARGB integer map
- **WHEN** the resulting UIColor RGBA components are inspected
- **THEN** the red, green, blue, and alpha values SHALL match the original ARGB input within 1/255 accuracy

#### Scenario: ThemeColors nil fallback

- **GIVEN** a `ThemeColors` initialized from an empty map
- **WHEN** any color property is inspected
- **THEN** it SHALL be white (r=1, g=1, b=1, a=1)

#### Scenario: PhotoFileInfo formatted file size under 1 MB

- **GIVEN** a `PhotoFileInfo` with `fileSizeBytes` less than 1,000,000
- **WHEN** `formattedFileSize` is read
- **THEN** it SHALL return a string in KB format with one decimal place

#### Scenario: PhotoFileInfo formatted file size at or above 1 MB

- **GIVEN** a `PhotoFileInfo` with `fileSizeBytes` at or above 1,000,000
- **WHEN** `formattedFileSize` is read
- **THEN** it SHALL return a string in MB format with one decimal place

#### Scenario: PhotoViewerViewModel initial state

- **GIVEN** a `PhotoViewerViewModel` created with `FakePhotoSaveable` and a mock `FlutterMethodChannel`
- **WHEN** its properties are inspected immediately after initialization
- **THEN** `currentIndex` SHALL equal the provided `initialIndex`, `viewState` SHALL be `.idle`, `isImmersive` SHALL be `false`, and `showFileInfo` SHALL be `false`

#### Scenario: PhotoViewerViewModel onPageChanged resets state

- **GIVEN** a `PhotoViewerViewModel` in any `viewState`
- **WHEN** `onPageChanged(newIndex)` is called
- **THEN** `currentIndex` SHALL equal `newIndex` and `viewState` SHALL be `.idle`


<!-- @trace
source: native-tests-ci
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Services/PhotoSaveable.swift
  - naver_blog_image_downloader/ios/RunnerTests/ThemeColorsTests.swift
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/RunnerTests/PhotoViewerViewModelTests.swift
  - naver_blog_image_downloader/ios/RunnerTests/RunnerTests.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoSaveable.kt
  - naver_blog_image_downloader/ios/RunnerTests/PhotoFileInfoTests.swift
  - .github/workflows/ci.yml
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/android/settings.gradle.kts
tests:
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColorsTest.kt
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfoTest.kt
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModelTest.kt
-->

---
### Requirement: Android JUnit 6 unit tests

The Android `app/src/test/` directory SHALL contain JVM unit tests using JUnit Jupiter 6 (`org.junit.jupiter:junit-jupiter` via `org.junit:junit-bom:6.0.3`). The `de.mannodermaus.android-junit` Gradle plugin version 2.0.1 SHALL be applied. The tests SHALL cover `ThemeColors` ARGB-to-Color conversion, `PhotoFileInfo` formatting logic, and `PhotoViewerViewModel` synchronous state management using `FakePhotoSaveable` and `TestScope`.

#### Scenario: ThemeColors fromArgb conversion verified

- **GIVEN** a `ThemeColors` created via `fromArgb()` with known ARGB integers
- **WHEN** the Compose Color RGBA components are inspected
- **THEN** the red, green, blue, and alpha values SHALL match the original ARGB input

#### Scenario: PhotoFileInfo formatted file size under 1 MB

- **GIVEN** a `PhotoFileInfo` with `fileSizeBytes` less than 1,000,000
- **WHEN** `formattedFileSize` is read
- **THEN** it SHALL return a string in KB format with one decimal place

#### Scenario: PhotoFileInfo formatted file size at or above 1 MB

- **GIVEN** a `PhotoFileInfo` with `fileSizeBytes` at or above 1,000,000
- **WHEN** `formattedFileSize` is read
- **THEN** it SHALL return a string in MB format with one decimal place

#### Scenario: PhotoViewerViewModel initial state

- **GIVEN** a `PhotoViewerViewModel` created with `FakePhotoSaveable`, `TestScope`, and a `dismissAction` lambda
- **WHEN** its properties are inspected immediately after initialization
- **THEN** `currentIndex` SHALL equal the provided `initialIndex`, `viewState` SHALL be `ViewState.Idle`, `isImmersive` SHALL be `false`, and `showFileInfo` SHALL be `false`

#### Scenario: PhotoViewerViewModel onPageChanged resets state

- **GIVEN** a `PhotoViewerViewModel` in any `viewState`
- **WHEN** `onPageChanged(newIndex)` is called
- **THEN** `currentIndex` SHALL equal `newIndex` and `viewState` SHALL be `ViewState.Idle`


<!-- @trace
source: native-tests-ci
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Services/PhotoSaveable.swift
  - naver_blog_image_downloader/ios/RunnerTests/ThemeColorsTests.swift
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/RunnerTests/PhotoViewerViewModelTests.swift
  - naver_blog_image_downloader/ios/RunnerTests/RunnerTests.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoSaveable.kt
  - naver_blog_image_downloader/ios/RunnerTests/PhotoFileInfoTests.swift
  - .github/workflows/ci.yml
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/android/settings.gradle.kts
tests:
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColorsTest.kt
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfoTest.kt
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModelTest.kt
-->

---
### Requirement: CI native test jobs

The CI workflow (`.github/workflows/ci.yml`) SHALL contain three parallel jobs: `flutter-validate` (existing, Ubuntu), `ios-native-test` (macOS runner), and `android-native-test` (Ubuntu runner). The `ios-native-test` job SHALL execute `xcodebuild test -only-testing RunnerTests`. The `android-native-test` job SHALL execute `./gradlew :app:testDebugUnitTest` with Java 25 LTS. Path triggers SHALL include `ios/**` and `android/**` in addition to existing Flutter paths.

#### Scenario: iOS native tests run on macOS

- **GIVEN** a push or PR changes files under `naver_blog_image_downloader/ios/`
- **WHEN** the CI workflow is triggered
- **THEN** the `ios-native-test` job SHALL run on a macOS runner and execute `xcodebuild test -only-testing RunnerTests`

#### Scenario: Android native tests run on Ubuntu

- **GIVEN** a push or PR changes files under `naver_blog_image_downloader/android/`
- **WHEN** the CI workflow is triggered
- **THEN** the `android-native-test` job SHALL run on Ubuntu with Java 25 and execute `./gradlew :app:testDebugUnitTest`

#### Scenario: All three jobs run in parallel

- **GIVEN** a push or PR triggers the CI workflow
- **WHEN** the workflow starts
- **THEN** `flutter-validate`, `ios-native-test`, and `android-native-test` SHALL have no `needs` dependency and SHALL execute in parallel

<!-- @trace
source: native-tests-ci
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Services/PhotoSaveable.swift
  - naver_blog_image_downloader/ios/RunnerTests/ThemeColorsTests.swift
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/RunnerTests/PhotoViewerViewModelTests.swift
  - naver_blog_image_downloader/ios/RunnerTests/RunnerTests.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoSaveable.kt
  - naver_blog_image_downloader/ios/RunnerTests/PhotoFileInfoTests.swift
  - .github/workflows/ci.yml
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/android/settings.gradle.kts
tests:
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColorsTest.kt
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfoTest.kt
  - naver_blog_image_downloader/android/app/src/test/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModelTest.kt
-->