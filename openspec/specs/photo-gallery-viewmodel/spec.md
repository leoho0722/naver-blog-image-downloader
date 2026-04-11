# photo-gallery-viewmodel

## Overview

PhotoGalleryViewModel manages the photo list display, selection mode, and gallery saving operations for the photo gallery screen. It extends ChangeNotifier and delegates gallery saving to PhotoRepository and cache access to CacheRepository.

## File

`lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`

### Requirement: gallery state properties

PhotoGalleryViewModel SHALL extend `ChangeNotifier`.

PhotoGalleryViewModel SHALL call `notifyListeners()` after every state change.

PhotoGalleryViewModel SHALL expose the following read-only properties:
- `photos` (List&lt;PhotoEntity&gt;) — the loaded photo list
- `blogId` (String) — the Blog identifier
- `isSelectMode` (bool) — whether selection mode is active
- `selectedIds` (Set&lt;String&gt;) — the set of selected photo identifiers
- `isSaving` (bool) — whether a save-to-gallery operation is in progress

#### Scenario: initial state

Given a newly created PhotoGalleryViewModel,
then `photos` SHALL be an empty list,
and `isSelectMode` SHALL be `false`,
and `selectedIds` SHALL be an empty set,
and `isSaving` SHALL be `false`.

### Requirement: load photos

PhotoGalleryViewModel SHALL provide a `load(List<PhotoEntity> photos, String blogId)` method.

When `load` is called, it SHALL store the photos list and blogId, and call `notifyListeners()`.

#### Scenario: load photo list

Given a PhotoGalleryViewModel,
when `load` is called with a list of 10 photos and a blogId,
then `photos` SHALL contain 10 items,
and `blogId` SHALL equal the provided value.


<!-- @trace
source: flutter-best-practices-compliance
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/analysis_options.yaml
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

### Requirement: toggle select mode

PhotoGalleryViewModel SHALL provide a `toggleSelectMode()` method.

When `toggleSelectMode` is called, it SHALL toggle `isSelectMode` between `true` and `false`. When exiting selection mode (setting to `false`), it SHALL clear `selectedIds`.

#### Scenario: enter selection mode

Given a PhotoGalleryViewModel with `isSelectMode` as `false`,
when `toggleSelectMode()` is called,
then `isSelectMode` SHALL be `true`.

#### Scenario: exit selection mode clears selection

Given a PhotoGalleryViewModel with `isSelectMode` as `true` and 3 selected photos,
when `toggleSelectMode()` is called,
then `isSelectMode` SHALL be `false`,
and `selectedIds` SHALL be empty.

### Requirement: toggle selection

PhotoGalleryViewModel SHALL provide a `toggleSelection(String photoId)` method.

When `toggleSelection` is called with a photoId that is not in `selectedIds`, it SHALL add the photoId. When called with a photoId already in `selectedIds`, it SHALL remove it.

#### Scenario: select a photo

Given a PhotoGalleryViewModel in selection mode,
when `toggleSelection("photo1")` is called and "photo1" is not selected,
then `selectedIds` SHALL contain "photo1".

#### Scenario: deselect a photo

Given a PhotoGalleryViewModel with "photo1" in `selectedIds`,
when `toggleSelection("photo1")` is called,
then `selectedIds` SHALL NOT contain "photo1".

### Requirement: select all

PhotoGalleryViewModel SHALL provide a `selectAll()` method.

When all photos are currently selected, `selectAll` SHALL clear `selectedIds` (deselect all). Otherwise, `selectAll` SHALL add all photo identifiers to `selectedIds`.

#### Scenario: select all when none selected

Given a PhotoGalleryViewModel with 5 photos and no selections,
when `selectAll()` is called,
then `selectedIds` SHALL contain all 5 photo identifiers.

#### Scenario: deselect all when all selected

Given a PhotoGalleryViewModel with 5 photos all selected,
when `selectAll()` is called,
then `selectedIds` SHALL be empty.

### Requirement: save selected to gallery

PhotoGalleryViewModel SHALL provide a `saveSelectedToGallery()` method.

When called, it SHALL:
1. Set `isSaving` to `true`
2. Filter photos by `selectedIds`
3. Call `PhotoRepository.saveToGalleryFromCache` for the selected photos
4. Set `isSaving` to `false`

#### Scenario: save selected photos

Given a PhotoGalleryViewModel with 2 photos selected out of 5,
when `saveSelectedToGallery()` is called,
then `PhotoRepository.saveToGalleryFromCache` SHALL be called with the 2 selected photos,
and `isSaving` SHALL be `false` after completion.

### Requirement: save all to gallery

PhotoGalleryViewModel SHALL provide a `saveAllToGallery()` method.

When called, it SHALL:
1. Set `isSaving` to `true`
2. Call `PhotoRepository.saveToGalleryFromCache` for all photos
3. Set `isSaving` to `false`

#### Scenario: save all photos

Given a PhotoGalleryViewModel with 5 photos loaded,
when `saveAllToGallery()` is called,
then `PhotoRepository.saveToGalleryFromCache` SHALL be called with all 5 photos,
and `isSaving` SHALL be `false` after completion.

### Requirement: cached file access

PhotoGalleryViewModel SHALL provide a `cachedFile(PhotoEntity photo)` method that delegates to `CacheRepository.cachedFile(photo.filename, blogId)` and returns `Future<File?>`.

#### Scenario: get cached file for photo

Given a PhotoGalleryViewModel with a loaded blogId,
when `cachedFile(photo)` is called,
then it SHALL delegate to `CacheRepository.cachedFile(photo.filename, blogId)`.

## Requirements

### Requirement: Load photos

The `load` method SHALL accept a `List<PhotoEntity>` and a `String blogId`, storing them for display and subsequent operations.

#### Scenario: Load photo list

- **WHEN** `load` is called with a list of photos and a blogId
- **THEN** `photos` SHALL contain all provided `PhotoEntity` objects
- **AND** `blogId` SHALL equal the provided blogId
- **AND** `notifyListeners` SHALL be called


<!-- @trace
source: s021-photo-gallery-viewmodel
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/main.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: Toggle select mode

The `toggleSelectMode` method SHALL toggle the `isSelectMode` flag and clear selections when exiting select mode.

#### Scenario: Enter select mode

- **GIVEN** `isSelectMode` is `false`
- **WHEN** `toggleSelectMode()` is called
- **THEN** `isSelectMode` SHALL be `true`
- **AND** `notifyListeners` SHALL be called

#### Scenario: Exit select mode

- **GIVEN** `isSelectMode` is `true`
- **WHEN** `toggleSelectMode()` is called
- **THEN** `isSelectMode` SHALL be `false`
- **AND** `selectedIds` SHALL be empty
- **AND** `notifyListeners` SHALL be called


<!-- @trace
source: s021-photo-gallery-viewmodel
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/main.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: Toggle selection

The `toggleSelection` method SHALL add or remove a photoId from the selected set.

#### Scenario: Select a photo

- **GIVEN** a photoId is NOT in `selectedIds`
- **WHEN** `toggleSelection(photoId)` is called
- **THEN** `selectedIds` SHALL contain the photoId
- **AND** `notifyListeners` SHALL be called

#### Scenario: Deselect a photo

- **GIVEN** a photoId IS in `selectedIds`
- **WHEN** `toggleSelection(photoId)` is called
- **THEN** `selectedIds` SHALL NOT contain the photoId
- **AND** `notifyListeners` SHALL be called


<!-- @trace
source: s021-photo-gallery-viewmodel
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/main.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: Select all

The `selectAll` method SHALL select all photos if not all are selected, or deselect all if all are already selected.

#### Scenario: Select all when not all selected

- **GIVEN** `selectedIds` does not contain all photo IDs
- **WHEN** `selectAll()` is called
- **THEN** `selectedIds` SHALL contain every photo's ID from the `photos` list
- **AND** `notifyListeners` SHALL be called

#### Scenario: Deselect all when all selected

- **GIVEN** `selectedIds` contains all photo IDs
- **WHEN** `selectAll()` is called
- **THEN** `selectedIds` SHALL be empty
- **AND** `notifyListeners` SHALL be called


<!-- @trace
source: s021-photo-gallery-viewmodel
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/main.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: Save selected to gallery

The `saveSelectedToGallery()` method SHALL save selected photos to the gallery and handle the `Result<void>` return value from `PhotoRepository.saveToGalleryFromCache` using a switch statement.

#### Scenario: Save selected photos succeeds

- **GIVEN** mode is `selecting` with photos selected
- **WHEN** `saveSelectedToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.ok`
- **THEN** mode SHALL transition: `selecting` → `saving` → `browsing`
- **AND** `selectedIds` SHALL be cleared

#### Scenario: Save selected photos fails

- **GIVEN** mode is `selecting` with photos selected
- **WHEN** `saveSelectedToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.error`
- **THEN** mode SHALL transition: `selecting` → `saving` → `browsing`
- **AND** `errorMessage` SHALL contain the error description


<!-- @trace
source: architecture-enum-state-refactor
updated: 2026-03-24
code:
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
tests:
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: Save all to gallery

The `saveAllToGallery()` method SHALL save all photos to the gallery and handle the `Result<void>` return value from `PhotoRepository.saveToGalleryFromCache` using a switch statement.

#### Scenario: Save all photos succeeds

- **GIVEN** photos are loaded
- **WHEN** `saveAllToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.ok`
- **THEN** mode SHALL transition: `browsing` → `saving` → `browsing`

#### Scenario: Save all photos fails

- **GIVEN** photos are loaded
- **WHEN** `saveAllToGallery()` is called
- **AND** `PhotoRepository.saveToGalleryFromCache` returns `Result.error`
- **THEN** mode SHALL transition: `browsing` → `saving` → `browsing`
- **AND** `errorMessage` SHALL contain the error description


<!-- @trace
source: architecture-enum-state-refactor
updated: 2026-03-24
code:
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
tests:
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/ui/photo_detail/photo_detail_view_model_test.dart
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: Cached file access

The `cachedFile` method SHALL delegate to `CacheRepository.cachedFile` to retrieve the local cached file for a given photo.

#### Scenario: Retrieve cached file

- **GIVEN** a `PhotoEntity` and the current `blogId`
- **WHEN** `cachedFile(photo)` is called
- **THEN** the method SHALL return the `Future<File?>` from `CacheRepository.cachedFile`

<!-- @trace
source: s021-photo-gallery-viewmodel
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/main.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: cachedFiles property

PhotoGalleryViewModel SHALL expose a read-only `cachedFiles` property of type `Map<String, File?>`.

The map key SHALL be the photo ID, and the value SHALL be the cached `File` or `null` if not cached.

#### Scenario: initial cachedFiles state

- **WHEN** a PhotoGalleryViewModel is newly created
- **THEN** `cachedFiles` SHALL be an empty map

#### Scenario: cachedFiles populated after load

- **WHEN** `load` has completed for 5 photos where 3 are cached
- **THEN** `cachedFiles` SHALL contain 5 entries, with 3 having non-null `File` values and 2 having `null` values

<!-- @trace
source: flutter-best-practices-compliance
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/analysis_options.yaml
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
tests:
  - naver_blog_image_downloader/test/ui/photo_gallery/photo_gallery_view_model_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: Error type enum for gallery operations

The `PhotoGalleryViewModel` SHALL use an enum-based error type instead of hardcoded error message strings. The view SHALL be responsible for mapping error types to localized messages.

#### Scenario: Save failure returns error type

- **WHEN** a save-to-gallery operation fails
- **THEN** the ViewModel SHALL expose an error type value instead of a hardcoded Chinese string
- **AND** the view SHALL map the error type to a localized message via `AppLocalizations`

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
### Requirement: PhotoGalleryState immutable class

`PhotoGalleryState` SHALL be an immutable class with fields: `photos` (default `[]`), `blogId` (default `""`), `cachedFiles` (default `{}`), `selectedIds` (default `{}`), `isSelectMode` (default `false`), `saveOperation` (default `null`). It SHALL provide `copyWith` and `isSaving` computed getter.

#### Scenario: Default PhotoGalleryState

- **GIVEN** a new `PhotoGalleryState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `isSelectMode` SHALL be `false`
- **AND** `saveOperation` SHALL be `null`
- **AND** `isSaving` SHALL be `false`


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
### Requirement: PhotoGalleryViewModel as Notifier

`PhotoGalleryViewModel` SHALL extend the generated `_$PhotoGalleryViewModel` (Riverpod `Notifier<PhotoGalleryState>`). `build()` SHALL return `const PhotoGalleryState()`.

#### Scenario: Toggle select mode

- **GIVEN** `state.isSelectMode` is `false`
- **WHEN** `toggleSelectMode()` is called
- **THEN** `state.isSelectMode` SHALL be `true`

#### Scenario: Exit select mode clears selections

- **GIVEN** `state.isSelectMode` is `true` with selected photos
- **WHEN** `toggleSelectMode()` is called
- **THEN** `state.isSelectMode` SHALL be `false`
- **AND** `state.selectedIds` SHALL be empty

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
### Requirement: Operation logging in saveSelectedToGallery

`PhotoGalleryViewModel.saveSelectedToGallery()` SHALL log operation results via `ref.read(logRepositoryProvider)` after the save operation completes or fails.

On success, `saveSelectedToGallery()` SHALL call `logSaveToGallery` with the following parameters:

- `mode` -- the string `'selected'`
- `blogId` -- the blog identifier
- `photoCount` -- the number of selected photos saved

On failure (when an exception is caught), `saveSelectedToGallery()` SHALL call `logError` with the caught exception, stack trace, and context string `'saveSelectedToGallery'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful selected save logs operation

- **GIVEN** 5 photos are selected for saving
- **WHEN** `saveSelectedToGallery()` completes successfully
- **THEN** `logSaveToGallery` SHALL be called with `mode: 'selected'` and `photoCount: 5`

#### Scenario: Failed selected save logs error

- **GIVEN** the gallery save operation throws an exception
- **WHEN** the exception is caught in `saveSelectedToGallery()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior SHALL remain unchanged


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
### Requirement: Operation logging in saveAllToGallery

`PhotoGalleryViewModel.saveAllToGallery()` SHALL log operation results via `ref.read(logRepositoryProvider)` after the save operation completes or fails.

On success, `saveAllToGallery()` SHALL call `logSaveToGallery` with the following parameters:

- `mode` -- the string `'all'`
- `blogId` -- the blog identifier
- `photoCount` -- the total number of photos saved

On failure (when an exception is caught), `saveAllToGallery()` SHALL call `logError` with the caught exception, stack trace, and context string `'saveAllToGallery'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful save-all logs operation

- **GIVEN** a gallery has 20 photos
- **WHEN** `saveAllToGallery()` completes successfully
- **THEN** `logSaveToGallery` SHALL be called with `mode: 'all'` and `photoCount: 20`

#### Scenario: Failed save-all logs error

- **GIVEN** the gallery save operation throws an exception
- **WHEN** the exception is caught in `saveAllToGallery()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior SHALL remain unchanged

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