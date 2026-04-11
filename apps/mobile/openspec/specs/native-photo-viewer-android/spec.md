# native-photo-viewer-android Specification

## Purpose

TBD - created by archiving change 'native-photo-viewer'. Update Purpose after archive.

## Requirements

### Requirement: PhotoViewerChannel registration

`MainActivity` SHALL have a `setupPhotoViewerChannel(flutterEngine:)` extension method called in `configureFlutterEngine`. The channel handler SHALL process the `openViewer` method by starting `PhotoViewerActivity` via Intent with extras. The channel reference SHALL be stored in a file-level `private var` for Activity callback use.

#### Scenario: Channel registered on engine config

- **GIVEN** the Flutter engine is configured
- **WHEN** `configureFlutterEngine` is called
- **THEN** a MethodChannel named `com.leoho.naverBlogImageDownloader/photoViewer` SHALL be registered

#### Scenario: openViewer starts PhotoViewerActivity

- **GIVEN** Flutter invokes `openViewer` with valid parameters
- **WHEN** the channel handler processes the call
- **THEN** `PhotoViewerActivity` SHALL be started via Intent with all parameters as extras


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: PhotoViewerViewModel compose state

`PhotoViewerViewModel` SHALL be a class managing Compose state: `currentIndex` (mutableIntStateOf), `isImmersive` (mutableStateOf(false)), `viewState` (mutableStateOf(ViewState.Idle)), `filePaths` (List\<String\>), `blogId` (String), `localizedStrings` (Map\<String, String\>), and `themeColors` (ThemeColors data class). It SHALL NOT accept an `Activity` parameter. It SHALL accept `photoSaveable: PhotoSaveable` and `dismissAction: (() -> Unit)?` as constructor parameters.

#### Scenario: Initial state

- **GIVEN** a newly created PhotoViewerViewModel with injected `PhotoSaveable` and `dismissAction`
- **WHEN** its properties are inspected
- **THEN** `isImmersive` SHALL be `false` and `viewState` SHALL be `ViewState.Idle`


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
### Requirement: ViewModel save method

`PhotoViewerViewModel.save()` SHALL call the injected `PhotoSaveable.saveToGallery(filePath)` on `Dispatchers.IO`. On success, it SHALL set `viewState` to `Saved` and invoke `onSaveCompleted` on the MethodChannel with `{"blogId": blogId}`. On failure, it SHALL revert `viewState` to `Idle`.

#### Scenario: Successful save

- **GIVEN** the current photo has a valid file path
- **WHEN** `save()` is called
- **THEN** `viewState` SHALL transition `Idle → Saving → Saved`
- **AND** `onSaveCompleted` SHALL be invoked on the MethodChannel


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
### Requirement: ViewModel dismiss method

`PhotoViewerViewModel.dismiss()` SHALL invoke `onDismissed` on the MethodChannel with `{"lastIndex": currentIndex}` and call the injected `dismissAction` callback. It SHALL NOT directly reference `Activity.finish()`.

#### Scenario: Dismiss sends event and finishes

- **GIVEN** the viewer is displayed at index 3
- **WHEN** `dismiss()` is called
- **THEN** `onDismissed` SHALL be invoked with `{"lastIndex": 3}`
- **AND** `dismissAction` SHALL be invoked


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
### Requirement: ViewModel fileInfo method

`PhotoViewerViewModel.fileInfo(index:)` SHALL return a `PhotoFileInfo` data class containing file size (bytes from `File.length()`) and image dimensions (from `BitmapFactory.Options` with `inJustDecodeBounds = true`).

#### Scenario: File info retrieved

- **GIVEN** a valid photo file path
- **WHEN** `fileInfo(index)` is called
- **THEN** it SHALL return file size in bytes and pixel dimensions


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: PhotoViewerActivity with Compose

`PhotoViewerActivity` SHALL extend `ComponentActivity`, call `enableEdgeToEdge()`, read parameters from Intent extras, create `PhotoService(this)` as `PhotoSaveable`, create `PhotoViewerViewModel` with injected `photoSaveable` and `dismissAction = { finish() }`, and call `setContent` with `MaterialTheme` using Flutter-passed ARGB theme colors.

#### Scenario: Activity created with parameters

- **GIVEN** an Intent with filePaths, blogId, initialIndex, localizedStrings, isDarkMode, themeColors
- **WHEN** `PhotoViewerActivity.onCreate` is called
- **THEN** it SHALL create a `PhotoViewerViewModel` with `PhotoService(this)` as `photoSaveable` and `{ finish() }` as `dismissAction`


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
### Requirement: PhotoViewerScreen with Box layout and HorizontalPager

`PhotoViewerScreen` SHALL use a pure `Box` layout (NOT `Scaffold`) with a `HorizontalPager` filling the entire screen. A custom navigation bar (gradient background, centered title, back button) SHALL be overlaid at the top. A `CapsuleBottomBar` SHALL be overlaid at the bottom. Both overlays SHALL be hidden with `AnimatedVisibility` using `fadeIn`/`fadeOut` when `viewModel.isImmersive` is true. System bars SHALL be controlled via `WindowInsetsControllerCompat`. The `PhotoViewerActivity` SHALL use `OnBackPressedCallback` to intercept the system back gesture and delegate to `viewModel.dismiss()`.

#### Scenario: Page indicator displays correct count

- **GIVEN** the viewer has 12 photos at settled page 2
- **WHEN** the navigation bar is visible
- **THEN** the centered title SHALL display "3 / 12"

#### Scenario: Immersive mode hides system bars and overlays

- **GIVEN** `viewModel.isImmersive` is true
- **WHEN** the immersive effect runs
- **THEN** `WindowInsetsControllerCompat.hide(systemBars)` SHALL be called
- **AND** the navigation bar and capsule bar SHALL fade out


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: ZoomableImage with bitmap caching

`ZoomableImage` SHALL decode images with `BitmapFactory.decodeFile` and display with `Image(bitmap.asImageBitmap())`. It SHALL support pinch-to-zoom (1x–5x) via `detectTransformGestures` and double-tap zoom toggle (1x/3x) via `detectTapGestures(onDoubleTap)`. An LRU cache of ±3 pages SHALL be maintained.

#### Scenario: Double-tap to zoom

- **GIVEN** the image is at 1x scale
- **WHEN** the user double-taps
- **THEN** the image SHALL animate to 3x scale


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: Capsule bottom bar with theme colors

The capsule bottom bar SHALL use `surfaceContainerHigh` ARGB color from `viewModel.themeColors`. It SHALL contain an info button and a save button with a divider. The save button SHALL show `CircularProgressIndicator` when saving and a checkmark icon when saved.

#### Scenario: Save button state transitions

- **GIVEN** `viewState` is `Idle`
- **WHEN** save is tapped
- **THEN** the button SHALL show a progress indicator (`Saving`)
- **AND** after success, SHALL show a checkmark (`Saved`)


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: File info bottom sheet

A `ModalBottomSheet` SHALL be presented when the info button is tapped. It SHALL display file size (KB/MB) and image dimensions (width × height) using data from `viewModel.fileInfo(index)`. Labels SHALL use the localized strings passed from Flutter.

#### Scenario: File info displayed with Flutter l10n

- **GIVEN** `localizedStrings["fileSize"]` is "檔案大小"
- **WHEN** the bottom sheet is presented
- **THEN** the file size label SHALL display "檔案大小"


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: Jetpack Compose dependencies

`build.gradle.kts` SHALL add `id("org.jetbrains.kotlin.plugin.compose")` to the plugins block, `buildFeatures { compose = true }` to the android block, and Compose BOM + material3 + foundation + activity-compose dependencies.

#### Scenario: Compose dependencies configured

- **GIVEN** the Android project `build.gradle.kts`
- **WHEN** the dependencies are resolved
- **THEN** Compose Material3 and Foundation libraries SHALL be available


<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->

---
### Requirement: AndroidManifest registration

`PhotoViewerActivity` SHALL be registered in `AndroidManifest.xml` with `android:exported="false"`.

#### Scenario: Activity registered

- **GIVEN** the AndroidManifest.xml
- **WHEN** the manifest is parsed
- **THEN** `PhotoViewerActivity` SHALL be declared as an activity

<!-- @trace
source: native-photo-viewer
updated: 2026-04-04
code:
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerNavigationBar.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/FileInfoSheet.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/PhotoViewerChannel.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/viewmodel/PhotoViewerViewModel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerView.swift
  - naver_blog_image_downloader/ios/Runner/Applications/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableScrollView.swift
  - naver_blog_image_downloader/ios/Runner/Headers/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/FileInfoContent.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/services/PhotoService.kt
  - naver_blog_image_downloader/lib/data/services/photo_service.dart
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Base.lproj/Main.storyboard
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/AsyncButton.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/CapsuleBottomBar.kt
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/GalleryChannel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner/AppDelegate.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/PhotoFileInfo.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/model/ThemeColors.kt
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerActivity.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-76x76@1x.png
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/MainActivity.kt
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/ZoomableImageView.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/PhotoViewerScreen.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-60x60@3x.png
  - naver_blog_image_downloader/ios/Runner/Features/Base.lproj/Main.storyboard
  - CLAUDE.md
  - naver_blog_image_downloader/ios/Runner/Base.lproj/LaunchScreen.storyboard
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@2x.png
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Contents.json
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
  - naver_blog_image_downloader/ios/Runner/Runner-Bridging-Header.h
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/features/photoviewer/view/ZoomableImage.kt
  - naver_blog_image_downloader/android/settings.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Configurations/Info.plist
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/ThemeColors.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/README.md
  - naver_blog_image_downloader/lib/data/services/photo_viewer_service.dart
  - naver_blog_image_downloader/ios/Runner/Applications/AppDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift
  - naver_blog_image_downloader/ios/Runner/GallerySaver.swift
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@2x.png
  - naver_blog_image_downloader/ios/Runner/SceneDelegate.swift
  - naver_blog_image_downloader/ios/Runner/Services/PhotoService.swift
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/GallerySaver.kt
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/android/app/build.gradle.kts
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/LaunchImage.imageset/Contents.json
  - naver_blog_image_downloader/android/app/src/main/AndroidManifest.xml
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/Model/PhotoFileInfo.swift
  - naver_blog_image_downloader/android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/applications/channels/features/GalleryChannel.kt
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/CapsuleBottomBar.swift
  - naver_blog_image_downloader/ios/Runner/Features/PhotoViewer/View/PhotoViewerController.swift
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-29x29@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage@3x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-83.5x83.5@2x.png
  - naver_blog_image_downloader/ios/Runner/Resources/Assets.xcassets/AppIcon.appiconset/Icon-App-40x40@3x.png
  - naver_blog_image_downloader/ios/Runner/Assets.xcassets/LaunchImage.imageset/Contents.json
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
-->