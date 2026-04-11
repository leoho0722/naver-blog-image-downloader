# extensions Specification

## Purpose

TBD - created by archiving change 's005-extensions'. Update Purpose after archive.

## Requirements

### Requirement: String file name sanitization extension

The `StringExtension` extension SHALL provide a `sanitizeFileName` method that produces a file-system-safe string.

- `sanitizeFileName` SHALL remove or replace characters that are not allowed in file names (such as `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`).
- `sanitizeFileName` SHALL return a non-empty string.

#### Scenario: Special characters removed

- **WHEN** `sanitizeFileName` is called on a string containing special characters
- **THEN** the returned string SHALL NOT contain any file-system-illegal characters

#### Scenario: Safe string unchanged

- **WHEN** `sanitizeFileName` is called on a string that is already file-system-safe
- **THEN** the returned string SHALL be equal to the original string


<!-- @trace
source: s005-extensions
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
tests:
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->

---
### Requirement: Integer file size formatting extension

The file `lib/utils/extensions.dart` SHALL define an `IntExtension` extension on `int` that provides a `toFileSizeString` method.

- `toFileSizeString` SHALL convert byte counts to human-readable file size strings with two decimal places (e.g., "1.50 MB", "500.00 KB").
- `toFileSizeString` SHALL use appropriate units: B, KB, MB, GB.

#### Scenario: Bytes displayed correctly

- **WHEN** `toFileSizeString` is called on an integer less than 1024
- **THEN** it SHALL return a string with the "B" unit

#### Scenario: Megabytes displayed correctly

- **WHEN** `toFileSizeString` is called on an integer representing megabytes (e.g., 1572864)
- **THEN** it SHALL return a string with the "MB" unit (e.g., "1.50 MB")

<!-- @trace
source: s005-extensions
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
tests:
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
-->
