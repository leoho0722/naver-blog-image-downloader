# gallery-service Specification

## Purpose

TBD - created by archiving change 's012-gallery-service'. Update Purpose after archive.

## Requirements

### Requirement: GalleryService saveToGallery method

The file `lib/data/services/gallery_service.dart` SHALL define a `GalleryService` class that provides a `saveToGallery` method for saving images to the device gallery.

- `saveToGallery` SHALL accept a `String filePath` parameter specifying the path of the image file to save.
- `saveToGallery` SHALL use a `MethodChannel` named `com.leoho.naverBlogImageDownloader/gallery` to invoke the native platform method `saveToGallery` with the file path.
- On iOS, the native implementation SHALL use `PHAssetCreationRequest.addResource(with: .photo, fileURL:)` to write the file directly without re-encoding.
- On Android, the native implementation SHALL use `MediaStore` API with `FileInputStream.copyTo` to copy the file directly without re-encoding.
- `saveToGallery` SHALL return a `Future<void>`.
- The system SHALL auto-generate filenames (e.g., IMG_xxxx) instead of preserving the source filename.
- When the native platform returns an error, `saveToGallery` SHALL catch the `PlatformException` and throw an `AppError` with type `AppErrorType.gallery`.

#### Scenario: Image saved successfully

- **GIVEN** a valid file path pointing to an image file
- **WHEN** `saveToGallery` is called with the file path
- **THEN** the native platform method SHALL be invoked via MethodChannel and the file SHALL be saved to the device gallery without re-encoding

#### Scenario: Save fails on native platform

- **GIVEN** the native platform encounters an error during save
- **WHEN** `saveToGallery` is called
- **THEN** a `PlatformException` SHALL be caught and an `AppError` with type `AppErrorType.gallery` SHALL be thrown

#### Scenario: MethodChannel name matches across platforms

- **GIVEN** the GalleryService is initialized
- **WHEN** the MethodChannel is created
- **THEN** the channel name SHALL be `com.leoho.naverBlogImageDownloader/gallery` in Dart, Swift, and Kotlin


<!-- @trace
source: unify-bundle-id
updated: 2026-03-29
code:
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/GallerySaver.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
-->

---
### Requirement: GalleryService requestPermission method

The `GalleryService` class SHALL provide a `requestPermission` method that requests photo library access permission from the native platform via the same `MethodChannel`.

- On iOS, the native implementation SHALL use `PHPhotoLibrary.requestAuthorization(for: .addOnly)`.
- On Android, the native implementation SHALL request `READ_MEDIA_IMAGES` (Android 13+) or `WRITE_EXTERNAL_STORAGE` (older versions).
- `requestPermission` SHALL return `true` if permission is granted, `false` otherwise.
- `requestPermission` SHALL return a `Future<bool>`.

#### Scenario: Permission granted

- **GIVEN** the user has not yet granted photo library permission
- **WHEN** `requestPermission` is called and the user grants permission
- **THEN** it SHALL return `true`

#### Scenario: Permission denied

- **GIVEN** the user denies photo library permission
- **WHEN** `requestPermission` is called
- **THEN** it SHALL return `false`

<!-- @trace
source: gallery-native-impl
updated: 2026-03-23
code:
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/MainActivity.kt
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/pubspec.yaml
-->

---
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