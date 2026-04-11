# download-viewmodel

## Overview

DownloadViewModel manages batch photo downloading, progress tracking, and result state for the download screen. It extends ChangeNotifier and delegates downloading to PhotoRepository.

## File

`lib/ui/download/view_model/download_view_model.dart`

### Requirement: download state properties

DownloadViewModel SHALL extend `ChangeNotifier`.

DownloadViewModel SHALL call `notifyListeners()` after every state change.

DownloadViewModel SHALL expose the following read-only properties:
- `completed` (int) — the number of photos that have been downloaded
- `total` (int) — the total number of photos to download
- `progress` (double) — the download progress as a value between 0.0 and 1.0
- `isDownloading` (bool) — whether a download operation is in progress
- `result` (DownloadBatchResult?) — the result of the last download operation

#### Scenario: initial state

Given a newly created DownloadViewModel,
then `completed` SHALL be `0`,
and `total` SHALL be `0`,
and `progress` SHALL be `0.0`,
and `isDownloading` SHALL be `false`,
and `result` SHALL be `null`.

### Requirement: progress calculation

The `progress` getter SHALL return `_completed / _total` as a double.

When `_total` is `0`, `progress` SHALL return `0.0` to avoid division by zero.

#### Scenario: progress with zero total

Given a DownloadViewModel where `total` is `0`,
then `progress` SHALL be `0.0`.

#### Scenario: progress mid-download

Given a DownloadViewModel where `completed` is `3` and `total` is `10`,
then `progress` SHALL be `0.3`.

### Requirement: start download with progress tracking

DownloadViewModel SHALL provide a `startDownload({required List<PhotoEntity> photos, required String blogId})` method.

When `startDownload` is called, DownloadViewModel SHALL:
1. Set `_total` to `photos.length` and `_completed` to `0`
2. Set `isDownloading` to `true`
3. Call `PhotoRepository.downloadAllToCache` with the provided photos, blogId, and an `onProgress` callback
4. Update `_completed` via the `onProgress` callback and call `notifyListeners()` on each update
5. Store the returned `DownloadBatchResult` in `result`
6. Set `isDownloading` to `false`

DownloadViewModel SHALL prevent concurrent download requests by checking `isDownloading` before initiating a new request.

DownloadViewModel SHALL set a disposed flag in its `dispose()` method. After disposal, progress callbacks SHALL NOT call `notifyListeners()`.

#### Scenario: successful batch download

Given a DownloadViewModel,
when `startDownload` is called with 5 photos,
then `total` SHALL be `5`,
and as each photo completes, `completed` SHALL increment,
and after all photos complete, `isDownloading` SHALL be `false`,
and `result` SHALL contain the DownloadBatchResult.

#### Scenario: duplicate download prevention

Given a DownloadViewModel where `isDownloading` is `true`,
when `startDownload` is called again,
then a second `PhotoRepository.downloadAllToCache` call SHALL NOT be initiated.

#### Scenario: callback after dispose

Given a DownloadViewModel that has been disposed,
when a progress callback fires,
then `notifyListeners()` SHALL NOT be called.

## Requirements

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

### Requirement: Progress calculation

`DownloadViewModelState.progress` SHALL return `completed / total` as a `double` (0.0 to 1.0). If `total` is 0, it SHALL return 0.0.

#### Scenario: Progress with valid total

- **GIVEN** `DownloadViewModelState` has `completed: 3` and `total: 10`
- **WHEN** `progress` is accessed
- **THEN** it SHALL return `0.3`

#### Scenario: Progress with zero total

- **GIVEN** `DownloadViewModelState` has `total: 0`
- **WHEN** `progress` is accessed
- **THEN** it SHALL return `0.0`


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
### Requirement: Start download with progress tracking

`DownloadViewModel.startDownload()` SHALL set `downloadResult` to `AsyncLoading` at start, update `completed`/`total` during download via `onProgress` callback, and set `downloadResult` to `AsyncData(result)` on completion or `AsyncError` on failure.

#### Scenario: Successful batch download

- **GIVEN** a list of photos to download
- **WHEN** `startDownload(photos, blogId, blogUrl)` is called
- **THEN** `state.downloadResult` SHALL transition to `AsyncLoading`
- **AND** `state.completed` and `state.total` SHALL update with each progress callback
- **AND** on completion, `state.downloadResult` SHALL be `AsyncData(DownloadBatchResult(...))`

#### Scenario: Duplicate download prevention

- **GIVEN** `state.downloadResult` is `AsyncLoading` (download in progress)
- **WHEN** `startDownload()` is called again
- **THEN** the call SHALL return immediately without starting a new download


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
### Requirement: DownloadViewModelState immutable class

`DownloadViewModelState` SHALL be an immutable class with fields: `completed` (default `0`), `total` (default `0`), `downloadResult` (default `AsyncData(null)`). It SHALL provide `copyWith`, `progress`, `isDownloading`, and `result` computed getters.

#### Scenario: Default DownloadViewModelState

- **GIVEN** a new `DownloadViewModelState` is created with defaults
- **WHEN** inspecting its fields
- **THEN** `completed` SHALL be `0`
- **AND** `total` SHALL be `0`
- **AND** `downloadResult` SHALL be `AsyncData(null)`
- **AND** `isDownloading` SHALL be `false`


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
### Requirement: DownloadViewModel as Notifier

`DownloadViewModel` SHALL extend the generated `_$DownloadViewModel` (Riverpod `Notifier<DownloadViewModelState>`). `build()` SHALL return `const DownloadViewModelState()`.

#### Scenario: DownloadViewModel initial state

- **GIVEN** `downloadViewModelProvider` is first accessed
- **WHEN** `build()` is called
- **THEN** it SHALL return a `DownloadViewModelState` with all default values

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
### Requirement: Operation logging in startDownload

`DownloadViewModel.startDownload()` SHALL log operation results via `ref.read(logRepositoryProvider)` after the download batch completes or fails.

On success (when `DownloadBatchResult` is obtained), `startDownload()` SHALL call `logDownload` with the following parameters:

- `blogId` -- the blog identifier for the downloaded batch
- `successCount` -- the number of photos successfully downloaded
- `failedCount` -- the number of photos that failed to download
- `skippedCount` -- the number of photos skipped (already cached)
- `totalCount` -- the total number of photos in the batch
- `durationMs` -- the elapsed time of the download operation in milliseconds

On failure (when an exception is caught), `startDownload()` SHALL call `logError` with the caught exception, stack trace, and context string `'startDownload'`.

All log calls SHALL be fire-and-forget and SHALL NOT affect the ViewModel state transitions or error handling behavior.

#### Scenario: Successful download logs batch result

- **GIVEN** a list of 10 photos is provided for download
- **WHEN** `startDownload()` completes with 8 successes, 1 failure, and 1 skipped
- **THEN** `logDownload` SHALL be called with `successCount: 8`, `failedCount: 1`, `skippedCount: 1`, `totalCount: 10`
- **AND** `durationMs` SHALL reflect the actual elapsed time

#### Scenario: Failed download logs error

- **GIVEN** `PhotoRepository.downloadAllToCache()` throws an exception
- **WHEN** the exception is caught in `startDownload()`
- **THEN** `logError` SHALL be called with the exception and stack trace
- **AND** the existing error handling behavior SHALL remain unchanged

#### Scenario: Log failure does not affect download result

- **GIVEN** `logDownload` throws an exception internally
- **WHEN** `startDownload()` completes successfully
- **THEN** the `DownloadBatchResult` SHALL still be stored in state
- **AND** no error SHALL be surfaced to the user

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