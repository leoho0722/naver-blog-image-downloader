# photo-viewer-service Specification

## Purpose

TBD - created by archiving change 'native-photo-viewer'. Update Purpose after archive.

## Requirements

### Requirement: PhotoViewerService singleton provider

`PhotoViewerService` SHALL be a Dart class registered as a `@Riverpod(keepAlive: true)` provider, following the same pattern as `PhotoService`. It SHALL create a `MethodChannel` named `com.leoho.naverBlogImageDownloader/photoViewer`.

#### Scenario: Service registered as singleton

- **GIVEN** the app is initialized
- **WHEN** `photoViewerServiceProvider` is first accessed
- **THEN** a single `PhotoViewerService` instance SHALL be created with the MethodChannel


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
### Requirement: openViewer method

`PhotoViewerService` SHALL provide an `openViewer()` method that invokes `openViewer` on the MethodChannel with a Map containing: `filePaths` (List\<String\>), `initialIndex` (int), `blogId` (String), `localizedStrings` (Map with keys `fileInfo`, `fileSize`, `dimensions`), `isDarkMode` (bool), and `themeColors` (Map with ARGB int values for `surfaceContainerHigh`, `onSurface`, `onSurfaceVariant`, `primary`, `surface`).

#### Scenario: Open viewer with all parameters

- **GIVEN** a list of file paths, initialIndex, blogId, localized strings, dark mode flag, and theme colors
- **WHEN** `openViewer` is called
- **THEN** the MethodChannel SHALL invoke `openViewer` with all parameters serialized in the Map


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
### Requirement: Callback handler registration

`PhotoViewerService` SHALL provide `setCallbackHandler(onSaveCompleted, onDismissed)` and `removeCallbackHandler()` methods. The `setMethodCallHandler` on the channel SHALL dispatch incoming calls to the registered callbacks. `onSaveCompleted` SHALL receive a `blogId` String. `onDismissed` SHALL receive a `lastIndex` int.

#### Scenario: onSaveCompleted callback dispatched

- **GIVEN** a callback handler is registered
- **WHEN** the native side invokes `onSaveCompleted` with `{"blogId": "abc123"}`
- **THEN** the registered `onSaveCompleted` callback SHALL be called with `"abc123"`

#### Scenario: onDismissed callback dispatched

- **GIVEN** a callback handler is registered
- **WHEN** the native side invokes `onDismissed` with `{"lastIndex": 5}`
- **THEN** the registered `onDismissed` callback SHALL be called with `5`

#### Scenario: No callback registered

- **GIVEN** no callback handler is registered (or it has been removed)
- **WHEN** the native side invokes a method
- **THEN** no exception SHALL be thrown

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