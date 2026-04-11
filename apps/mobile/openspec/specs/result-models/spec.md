# result-models Specification

## Purpose

TBD - created by archiving change 's009-result-models'. Update Purpose after archive.

## Requirements

### Requirement: FetchResult class defined

The file `lib/data/models/fetch_result.dart` SHALL define a `FetchResult` class representing the result of fetching photo information from a blog.

- All fields of `FetchResult` SHALL be declared as `final`.
- `FetchResult` SHALL have a required `photos` property of type `List<PhotoEntity>`.
- `FetchResult` SHALL have a required `blogId` property of type `String`.
- `FetchResult` SHALL have a required `blogUrl` property of type `String`.
- `FetchResult` SHALL have a required `isFullyCached` property of type `bool`.

#### Scenario: FetchResult created with photo list

- **WHEN** a `FetchResult` is created with a list of `PhotoEntity`, `blogId`, `blogUrl`, and `isFullyCached`
- **THEN** all properties SHALL be accessible on the instance with their provided values

#### Scenario: FetchResult with empty photo list

- **WHEN** a `FetchResult` is created with an empty `photos` list
- **THEN** the `photos` property SHALL return an empty list

#### Scenario: FetchResult fields are immutable

- **WHEN** a `FetchResult` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

#### Scenario: FetchResult blogUrl holds the original blog URL

- **WHEN** a `FetchResult` is created with `blogUrl` "https://blog.naver.com/user/123"
- **THEN** the `blogUrl` property SHALL return "https://blog.naver.com/user/123"


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
### Requirement: DownloadBatchResult class defined

The file `lib/data/models/download_batch_result.dart` SHALL define a `DownloadBatchResult` class representing the result of a batch photo download operation.

- All fields of `DownloadBatchResult` SHALL be declared as `final`.
- `DownloadBatchResult` SHALL have a required `successCount` property of type `int`.
- `DownloadBatchResult` SHALL have a required `failedPhotos` property of type `List<PhotoEntity>`.
- `DownloadBatchResult` SHALL have a `skippedCount` property of type `int` with a default value of `0`.
- `DownloadBatchResult` SHALL have an `errors` property of type `List<String>` with a default value of `const []`.
- `DownloadBatchResult` SHALL provide a `failureCount` getter of type `int` that returns `failedPhotos.length`.
- `DownloadBatchResult` SHALL provide an `isAllSuccessful` getter of type `bool`.

#### Scenario: DownloadBatchResult with all successful downloads

- **WHEN** a `DownloadBatchResult` is created with `successCount` greater than zero and an empty `failedPhotos` list
- **THEN** `isAllSuccessful` SHALL return `true`

#### Scenario: DownloadBatchResult with some failed downloads

- **WHEN** a `DownloadBatchResult` is created with a non-empty `failedPhotos` list
- **THEN** `isAllSuccessful` SHALL return `false`

#### Scenario: DownloadBatchResult fields are immutable

- **WHEN** a `DownloadBatchResult` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

#### Scenario: isAllSuccessful is computed from failedPhotos

- **WHEN** `isAllSuccessful` is accessed on a `DownloadBatchResult`
- **THEN** it SHALL return `true` if and only if `failedPhotos` is empty

<!-- @trace
source: s009-result-models
updated: 2026-03-21
code:
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
tests:
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
-->