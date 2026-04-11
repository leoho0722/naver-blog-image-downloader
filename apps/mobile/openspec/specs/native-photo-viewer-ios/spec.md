# native-photo-viewer-ios Specification

## Purpose

TBD - created by archiving change 'native-photo-viewer'. Update Purpose after archive.

## Requirements

### Requirement: PhotoViewerChannel registration

`AppDelegate` SHALL have a `photoViewerChannel` property and a `setupPhotoViewerChannel(messenger:)` method registered in `didInitializeImplicitFlutterEngine`. The channel handler SHALL process the `openViewer` method, create a `PhotoViewerViewModel` and `PhotoViewerController`, and present the controller modally with `.fullScreen` style.

#### Scenario: Channel registered on engine init

- **GIVEN** the Flutter engine initializes
- **WHEN** `didInitializeImplicitFlutterEngine` is called
- **THEN** a MethodChannel named `com.leoho.naverBlogImageDownloader/photoViewer` SHALL be registered

#### Scenario: openViewer launches native viewer

- **GIVEN** Flutter invokes `openViewer` with valid parameters
- **WHEN** the channel handler processes the call
- **THEN** a `PhotoViewerController` SHALL be presented modally with `.fullScreen` style


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
### Requirement: PhotoViewerViewModel observable state

`PhotoViewerViewModel` SHALL be an `@Observable` class managing: `currentIndex` (Int), `isImmersive` (Bool, default false), `viewState` (ViewState enum: `.idle` / `.saving` / `.saved`), `filePaths` ([String]), `blogId` (String), `localizedStrings` ([String: String]), and `themeColors` (ThemeColors struct). It SHALL hold a reference to the `FlutterMethodChannel`. It SHALL accept a `photoSaveable: PhotoSaveable` parameter in its initializer instead of creating `PhotoService()` internally.

#### Scenario: Initial state

- **GIVEN** a newly created PhotoViewerViewModel with an injected `PhotoSaveable`
- **WHEN** its properties are inspected
- **THEN** `isImmersive` SHALL be `false` and `viewState` SHALL be `.idle`


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

`PhotoViewerViewModel.save()` SHALL call the injected `PhotoSaveable.saveToGallery(filePath:)` with the current photo's file path. On success, it SHALL set `viewState` to `.saved` and invoke `onSaveCompleted` on the MethodChannel with `{"blogId": blogId}`. On failure, it SHALL revert `viewState` to `.idle`.

#### Scenario: Successful save

- **GIVEN** the current photo has a valid file path
- **WHEN** `save()` is called
- **THEN** `viewState` SHALL transition `.idle → .saving → .saved`
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

`PhotoViewerViewModel.dismiss()` SHALL invoke `onDismissed` on the MethodChannel with `{"lastIndex": currentIndex}` and trigger the controller's dismiss action.

#### Scenario: Dismiss sends event and closes

- **GIVEN** the viewer is displayed at index 3
- **WHEN** `dismiss()` is called
- **THEN** `onDismissed` SHALL be invoked with `{"lastIndex": 3}`
- **AND** the controller SHALL be dismissed


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
### Requirement: ViewModel fileInfo method

`PhotoViewerViewModel.fileInfo(at:)` SHALL return a `PhotoFileInfo` struct containing file size (bytes) and image dimensions (width, height). File size SHALL be read from `FileManager`. Dimensions SHALL be read from `CGImageSource`.

#### Scenario: File info retrieved

- **GIVEN** a valid photo file path
- **WHEN** `fileInfo(at: index)` is called
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
### Requirement: PhotoViewerController hosting

`PhotoViewerController` SHALL be a `UIHostingController<PhotoViewerView>` that accepts a `PhotoViewerViewModel`. It SHALL override `prefersStatusBarHidden` to return the value bound to `viewModel.isImmersive`.

#### Scenario: Status bar hidden in immersive mode

- **GIVEN** `viewModel.isImmersive` is true
- **WHEN** `prefersStatusBarHidden` is queried
- **THEN** it SHALL return `true`


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
### Requirement: PhotoViewerView with ZStack layout

`PhotoViewerView` SHALL use a pure `ZStack` layout (NOT `NavigationStack`) with a `TabView` using `.tabViewStyle(.page(indexDisplayMode: .never))` and `.ignoresSafeArea()`. A `PhotoViewerNavigationBar` (custom navigation bar with gradient background and centered title) SHALL be overlaid at the top. A `CapsuleBottomBar` SHALL be overlaid at the bottom. Both overlays SHALL be hidden with `.transition(.opacity)` animation when `viewModel.isImmersive` is true. The `PhotoViewerChannel` SHALL present the controller using `CATransition` with push/pop style animation (0.35s duration).

#### Scenario: Page indicator displays correct count

- **GIVEN** the viewer has 12 photos at index 2
- **WHEN** the navigation bar is visible
- **THEN** the centered title SHALL display "3 / 12"

#### Scenario: Overlays hidden in immersive mode

- **GIVEN** `viewModel.isImmersive` is true
- **WHEN** the view renders
- **THEN** the navigation bar and bottom capsule bar SHALL be hidden with opacity transition


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
### Requirement: ZoomableImageView with UIScrollView

`ZoomableImageView` SHALL be a `UIViewRepresentable` wrapping a `UIScrollView` with a `UIImageView` child. The scroll view SHALL have `minimumZoomScale: 1.0` and `maximumZoomScale: 5.0`. Double-tap SHALL toggle between 1x and 2x zoom. The zoom SHALL reset on page change (`onDisappear`).

#### Scenario: Double-tap to zoom

- **GIVEN** the image is at 1x zoom
- **WHEN** the user double-taps
- **THEN** the scroll view SHALL animate to 2x zoom

#### Scenario: Double-tap to reset

- **GIVEN** the image is zoomed in (> 1x)
- **WHEN** the user double-taps
- **THEN** the scroll view SHALL animate back to 1x zoom


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

The capsule bottom bar SHALL use `surfaceContainerHigh` ARGB color with 0.85 opacity from `viewModel.themeColors`. It SHALL contain an info button and a save button separated by a divider. The save button SHALL show a progress indicator when `viewState == .saving` and a checkmark when `viewState == .saved`.

#### Scenario: Save button state transitions

- **GIVEN** `viewState` is `.idle`
- **WHEN** save is tapped
- **THEN** the button SHALL show a progress indicator (`.saving`)
- **AND** after success, SHALL show a checkmark (`.saved`)


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
### Requirement: File info sheet

A SwiftUI `.sheet` SHALL be presented when the info button is tapped. It SHALL display file size (KB/MB) and image dimensions (width × height) using data from `viewModel.fileInfo(at:)`. Labels SHALL use the localized strings passed from Flutter.

#### Scenario: File info displayed with Flutter l10n

- **GIVEN** `localizedStrings["fileSize"]` is "檔案大小"
- **WHEN** the file info sheet is presented
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