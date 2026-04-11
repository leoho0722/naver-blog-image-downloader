# photo-entity Specification

## Purpose

TBD - created by archiving change 's006-photo-entity'. Update Purpose after archive.

## Requirements

### Requirement: PhotoEntity immutable class defined

The file `lib/data/models/photo_entity.dart` SHALL define a `PhotoEntity` class as an immutable domain model representing a single photo from a Naver Blog.

- `PhotoEntity` SHALL provide a `const` constructor.
- All fields of `PhotoEntity` SHALL be declared as `final`.
- `PhotoEntity` SHALL have a required `id` property of type `String`.
- `PhotoEntity` SHALL have a required `url` property of type `String`.
- `PhotoEntity` SHALL have a required `filename` property of type `String`.
- `PhotoEntity` SHALL have an optional `width` property of type `int?`.
- `PhotoEntity` SHALL have an optional `height` property of type `int?`.

#### Scenario: PhotoEntity created with all required fields

- **WHEN** a `PhotoEntity` is created with `id`, `url`, and `filename`
- **THEN** all three properties SHALL be accessible on the instance
- **AND** `width` and `height` SHALL be `null`

#### Scenario: PhotoEntity created with optional dimensions

- **WHEN** a `PhotoEntity` is created with `width` and `height` in addition to required fields
- **THEN** `width` and `height` SHALL return the provided integer values

#### Scenario: PhotoEntity is immutable

- **WHEN** a `PhotoEntity` instance is created
- **THEN** none of its properties SHALL be reassignable after construction

#### Scenario: PhotoEntity supports const construction

- **WHEN** a `PhotoEntity` is created using `const PhotoEntity(...)`
- **THEN** the Dart compiler SHALL accept the expression as a compile-time constant

<!-- @trace
source: s006-photo-entity
updated: 2026-03-21
code:
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/main.dart
tests:
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
-->