# photo-detail-viewmodel

## Overview

PhotoDetailViewModel manages the display of a single photo at full resolution. It extends ChangeNotifier and delegates cache file retrieval to CacheRepository.

## File

`lib/ui/photo_detail/view_model/photo_detail_view_model.dart`

### Requirement: detail state properties

PhotoDetailViewModel SHALL extend `ChangeNotifier`.

PhotoDetailViewModel SHALL call `notifyListeners()` after every state change.

PhotoDetailViewModel SHALL expose the following read-only properties:
- `photo` (PhotoEntity?) — the loaded photo entity
- `blogId` (String?) — the Blog identifier
- `cachedFilePath` (String?) — the local file path to the full-resolution cached image

#### Scenario: initial state

Given a newly created PhotoDetailViewModel,
then `photo` SHALL be `null`,
and `blogId` SHALL be `null`,
and `cachedFilePath` SHALL be `null`.

### Requirement: load photo detail

PhotoDetailViewModel SHALL provide a `load(PhotoEntity photo, String blogId)` method.

When `load` is called, PhotoDetailViewModel SHALL:
1. Store the `photo` and `blogId`
2. Query `CacheRepository.cachedFile(photo.filename, blogId)` to retrieve the cached file
3. If the file exists, store its path in `cachedFilePath`
4. If the file does not exist, set `cachedFilePath` to `null`
5. Call `notifyListeners()`

#### Scenario: load with existing cached file

Given a PhotoDetailViewModel,
when `load` is called with a photo whose cache file exists,
then `photo` SHALL equal the provided PhotoEntity,
and `blogId` SHALL equal the provided value,
and `cachedFilePath` SHALL be a non-null file path string.

#### Scenario: load with missing cached file

Given a PhotoDetailViewModel,
when `load` is called with a photo whose cache file does not exist,
then `photo` SHALL equal the provided PhotoEntity,
and `cachedFilePath` SHALL be `null`.

### Requirement: cached file retrieval

The `cachedFilePath` getter SHALL return the absolute path of the cached file when it exists, or `null` when the file is not cached.

PhotoDetailViewModel SHALL provide a `cachedFile()` method that delegates to `CacheRepository.cachedFile(photo.filename, blogId)` and returns `Future<File?>`.

#### Scenario: cachedFilePath after successful load

Given a PhotoDetailViewModel that has been loaded with a cached photo,
then `cachedFilePath` SHALL be a non-empty string ending with the photo filename.

#### Scenario: cached file retrieval delegates to CacheRepository

Given a PhotoDetailViewModel with a loaded photo and blogId,
when `cachedFile()` is called,
then it SHALL delegate to `CacheRepository.cachedFile(photo.filename, blogId)`.

## Requirements

### Requirement: Load photo detail

`PhotoDetailViewModel.loadAll()` SHALL accept `photos`, `blogId`, `initialIndex`, and `cachedFiles` parameters. It SHALL synchronously update the state with all values via `state = state.copyWith(...)`. It SHALL NOT load metadata (no `_loadMetadataForIndex`).

#### Scenario: Load photo list with cachedFiles

- **GIVEN** a list of photos, blogId, initialIndex, and cachedFiles map
- **WHEN** `loadAll(photos, blogId, initialIndex, cachedFiles)` is called
- **THEN** `state.photos` SHALL contain the provided photos
- **AND** `state.blogId` SHALL be the provided blogId
- **AND** `state.currentIndex` SHALL be the provided initialIndex
- **AND** `state.cachedFiles` SHALL be the provided cachedFiles map


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
### Requirement: Photo list management

The `PhotoDetailViewModel` SHALL manage a list of `PhotoEntity` objects and a current index. It SHALL expose `photos` (List<PhotoEntity>), `currentIndex` (int), and `totalCount` (int) as read-only properties.

#### Scenario: Initial list state

- **GIVEN** a newly created `PhotoDetailViewModel`
- **WHEN** its list properties are inspected
- **THEN** `photos` SHALL be an empty list
- **AND** `currentIndex` SHALL be `0`
- **AND** `totalCount` SHALL be `0`


<!-- @trace
source: photo-detail-viewer-redesign
updated: 2026-03-23
code:
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Set current index

`setCurrentIndex(int index)` SHALL update `state.currentIndex` and reset `state.saveOperation` to `null`. It SHALL NOT lazy-load metadata.

#### Scenario: Switch to a different photo

- **GIVEN** the current index is 0
- **WHEN** `setCurrentIndex(2)` is called
- **THEN** `state.currentIndex` SHALL be `2`
- **AND** `state.saveOperation` SHALL be `null`


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
### Requirement: PhotoDetailState immutable class

`PhotoDetailState` SHALL retain fields: `photos` (default `[]`), `blogId` (default `""`), `currentIndex` (default `0`), `saveOperation` (default `null`). It SHALL add a new field `cachedFiles` (Map\<String, File?\>, default `{}`). It SHALL remove fields: `cachedFile`, `fileSizeBytes`, `imageWidth`, `imageHeight` (metadata is now read by native viewers). It SHALL retain `copyWith`, `isSaving`, `isSaved`, `photo`, `totalCount` getters. It SHALL remove `formattedFileSize` and `formattedDimensions` getters.

#### Scenario: Simplified PhotoDetailState

- **GIVEN** a new `PhotoDetailState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `cachedFiles` SHALL be an empty map
- **AND** `saveOperation` SHALL be `null`
- **AND** no `cachedFile`, `fileSizeBytes`, `imageWidth`, `imageHeight` fields SHALL exist


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
### Requirement: PhotoDetailViewModel as Notifier

`PhotoDetailViewModel` SHALL extend the generated `_$PhotoDetailViewModel` (Riverpod `Notifier<PhotoDetailState>`). `build()` SHALL return `const PhotoDetailState()`.

#### Scenario: PhotoDetailViewModel initial state

- **GIVEN** `photoDetailViewModelProvider` is first accessed
- **WHEN** `build()` is called
- **THEN** it SHALL return a `PhotoDetailState` with all default values

<!-- @trace
source: riverpod-migration
updated: 2026-03-29
code:
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/config/supported_locale.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/view_model/app_settings_view_model.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - CLAUDE.md
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
-->

---
### Requirement: Log save to gallery

`PhotoDetailViewModel` SHALL provide a `logSaveToGallery(String blogId)` method. It SHALL call `ref.read(logRepositoryProvider).logSaveToGallery(blogId: blogId, photoCount: 1, mode: 'single')` in a fire-and-forget manner.

#### Scenario: Log save operation

- **GIVEN** a successful native save operation
- **WHEN** `logSaveToGallery("abc123")` is called
- **THEN** `LogRepository.logSaveToGallery` SHALL be called with `blogId: "abc123"`, `photoCount: 1`, `mode: "single"`

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