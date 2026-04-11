# photo-gallery-view Specification

## Purpose

TBD - created by archiving change 's026-photo-gallery-view'. Update Purpose after archive.

## Requirements

### Requirement: GridView gallery layout

The `PhotoGalleryView` SHALL render a `GridView` widget to display photo cards in a grid layout. Each cell in the grid SHALL contain a `PhotoCard` widget. The GridView SHALL use a builder pattern for efficient rendering of large photo collections.

The `PhotoCard.cachedFile` SHALL be obtained synchronously from `viewModel.cachedFiles[photo.id]` instead of using a `FutureBuilder`. The view SHALL NOT create new `Future` instances inside the `build` method.

#### Scenario: Gallery renders grid of photos

- **WHEN** the PhotoGalleryView is rendered with a list of photos
- **THEN** a GridView SHALL display PhotoCard widgets in a grid layout

#### Scenario: Empty gallery

- **WHEN** the photo list is empty
- **THEN** the GridView SHALL render with no children

#### Scenario: Cached files accessed synchronously

- **WHEN** a PhotoCard is built in the GridView
- **THEN** the `cachedFile` SHALL be read from `viewModel.cachedFiles` without creating a new Future


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
### Requirement: PhotoCard thumbnail display

The `PhotoCard` SHALL display a thumbnail image using `Image.file` with the cached file. The `cacheWidth` SHALL be set to 200 to reduce memory usage. The `fit` property SHALL be set to `BoxFit.cover` to fill the card area.

#### Scenario: Cached file available

- **WHEN** `cachedFile` is not null
- **THEN** an Image.file widget SHALL be rendered with `fit: BoxFit.cover` and `cacheWidth: 200`

#### Scenario: Cached file not available

- **WHEN** `cachedFile` is null
- **THEN** no Image.file widget SHALL be rendered


<!-- @trace
source: s026-photo-gallery-view
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
tests:
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: PhotoCard select mode checkbox

The `PhotoCard` SHALL display a `Checkbox` in the top-right corner when `isSelectMode` is true. The Checkbox `value` SHALL reflect the `isSelected` property. The Checkbox SHALL be positioned using `Positioned(top: 4, right: 4)` within a `Stack` with `StackFit.expand`.

#### Scenario: Select mode enabled

- **WHEN** `isSelectMode` is true
- **THEN** a Checkbox SHALL be visible at the top-right corner with value matching `isSelected`

#### Scenario: Select mode disabled

- **WHEN** `isSelectMode` is false
- **THEN** no Checkbox SHALL be displayed


<!-- @trace
source: s026-photo-gallery-view
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/utils/extensions.dart
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/utils/constants.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
tests:
  - naver_blog_image_downloader/test/widget_test.dart
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: PhotoCard tap behavior

The `PhotoCard` widget SHALL use a `GestureDetector` to handle tap events. In select mode, tapping SHALL call the `onSelect` callback. In normal mode, tapping SHALL call the `onTap` callback. The `onTap` callback in `PhotoGalleryView` SHALL navigate to `PhotoDetailView` by calling `context.push('/detail/${photo.id}', extra: (photos: viewModel.photos, blogId: viewModel.blogId, initialIndex: index))`, passing the full photo list, blog ID, and the tapped photo's index.

#### Scenario: Tap in normal mode navigates with full photo list

- **GIVEN** the gallery is in normal mode (not select mode)
- **WHEN** the user taps a `PhotoCard` at index N
- **THEN** the app SHALL navigate to `/detail/${photo.id}` with `extra` containing the full photos list, blogId, and `initialIndex: N`

#### Scenario: Tap in select mode toggles selection

- **GIVEN** the gallery is in select mode
- **WHEN** the user taps a `PhotoCard`
- **THEN** the `onSelect` callback SHALL be invoked


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
### Requirement: View initialization without unnecessary postFrameCallback

The `PhotoGalleryView` SHALL load data in `didChangeDependencies` using a `_loaded` flag to ensure single execution. The ViewModel `load()` call SHALL be invoked directly without wrapping in `WidgetsBinding.instance.addPostFrameCallback`.

#### Scenario: Data loaded on first build

- **WHEN** the PhotoGalleryView is rendered for the first time
- **THEN** `viewModel.load()` SHALL be called directly in `didChangeDependencies`

#### Scenario: Data not reloaded on subsequent builds

- **WHEN** `didChangeDependencies` is called after the first time
- **THEN** `viewModel.load()` SHALL NOT be called again

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
### Requirement: Saving progress popup dialog

The `PhotoGalleryView` SHALL display a non-dismissible `AlertDialog` popup when `viewModel.isSaving` transitions from `false` to `true`. The dialog SHALL contain a `CircularProgressIndicator` and a text label. The photo grid SHALL remain visible behind the dialog barrier.

The dialog SHALL be dismissed automatically when `viewModel.isSaving` transitions from `true` to `false`.

The `_PhotoGalleryViewState` SHALL use a ViewModel listener (not the `build` method) to detect `isSaving` state changes and manage the dialog lifecycle. A `_isSavingDialogOpen` flag SHALL track whether the dialog is currently displayed to prevent duplicate dialogs.

The `Scaffold.body` SHALL NOT use `isSaving` as a condition to replace the `GridView` with a loading indicator. The body SHALL always render the `GridView` (or empty state) regardless of the saving state.

#### Scenario: Saving starts and dialog appears

- **GIVEN** the user is on the PhotoGalleryView with photos displayed
- **WHEN** `viewModel.isSaving` changes to `true`
- **THEN** a non-dismissible `AlertDialog` SHALL be displayed with a `CircularProgressIndicator` and text label
- **AND** the photo grid SHALL remain visible behind the dialog barrier

#### Scenario: Saving completes and dialog dismissed

- **GIVEN** the saving progress dialog is displayed
- **WHEN** `viewModel.isSaving` changes to `false`
- **THEN** the dialog SHALL be dismissed automatically

#### Scenario: Dialog cannot be dismissed by user

- **GIVEN** the saving progress dialog is displayed
- **WHEN** the user taps outside the dialog or presses the back button
- **THEN** the dialog SHALL NOT be dismissed

#### Scenario: Grid remains visible during save

- **GIVEN** a save operation is in progress
- **WHEN** the `build` method is called
- **THEN** the `Scaffold.body` SHALL render the `GridView` (not a loading indicator)

<!-- @trace
source: gallery-saving-popup
updated: 2026-03-23
code:
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
-->

---
### Requirement: Localized UI text

All user-facing text in `PhotoGalleryView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals. This includes:

- AppBar title (parameterized with photo count)
- Tooltip text (cancel selection, select mode, select all, save selected, save all)
- Empty state message
- Saving progress text

#### Scenario: Gallery text in English

- **WHEN** the app locale is set to English
- **THEN** all user-facing text in `PhotoGalleryView` SHALL display English translations from `AppLocalizations`

#### Scenario: Gallery title shows photo count

- **WHEN** the gallery contains 10 photos and the locale is English
- **THEN** the AppBar title SHALL display the English parameterized title with count 10

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