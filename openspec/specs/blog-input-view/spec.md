# blog-input-view Specification

## Purpose

TBD - created by archiving change 's024-blog-input-view'. Update Purpose after archive.

## Requirements

### Requirement: URL text field rendered

The `BlogInputView` SHALL render a `TextField` widget with `labelText` set to "Naver Blog 網址" and `hintText` set to "https://blog.naver.com/...". The `onChanged` callback SHALL invoke `viewModel.onUrlChanged` to pass the input value to the ViewModel.

#### Scenario: Text field displays label and hint

- **WHEN** the BlogInputView is rendered
- **THEN** a TextField SHALL be visible with the label "Naver Blog 網址" and hint "https://blog.naver.com/..."

#### Scenario: User types a URL

- **WHEN** the user enters text into the TextField
- **THEN** `viewModel.onUrlChanged` SHALL be called with the entered text


<!-- @trace
source: s024-blog-input-view
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/utils/constants.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
-->

---
### Requirement: Fetch button with loading indicator

The `BlogInputView` SHALL render a `FilledButton` that triggers `viewModel.fetchPhotos` when pressed. When `viewModel.isLoading` is true, the button SHALL be disabled (`onPressed: null`) and SHALL display a `CircularProgressIndicator` with `strokeWidth: 2` instead of the text label. When not loading, the button SHALL display the text "取得照片列表".

#### Scenario: Button in idle state

- **WHEN** `viewModel.isLoading` is false
- **THEN** the FilledButton SHALL display "取得照片列表" and `onPressed` SHALL invoke `viewModel.fetchPhotos`

#### Scenario: Button in loading state

- **WHEN** `viewModel.isLoading` is true
- **THEN** the FilledButton SHALL be disabled and SHALL display a CircularProgressIndicator with strokeWidth 2


<!-- @trace
source: s024-blog-input-view
updated: 2026-03-21
code:
  - naver_blog_image_downloader/lib/data/services/file_download_service.dart
  - naver_blog_image_downloader/ios/Podfile.lock
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/ios/Runner/Info.plist
  - naver_blog_image_downloader/lib/data/models/dtos/job_status_response.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_card.dart
  - naver_blog_image_downloader/lib/data/models/photo_entity.dart
  - naver_blog_image_downloader/lib/data/models/blog_cache_metadata.dart
  - naver_blog_image_downloader/lib/data/repositories/cache_repository.dart
  - naver_blog_image_downloader/lib/data/models/download_batch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
  - naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/view_model/photo_detail_view_model.dart
  - naver_blog_image_downloader/lib/data/services/api_service.dart
  - naver_blog_image_downloader/devtools_options.yaml
  - naver_blog_image_downloader/lib/ui/core/app_error.dart
  - naver_blog_image_downloader/lib/app.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/download/view_model/download_view_model.dart
  - naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj
  - naver_blog_image_downloader/lib/main.dart
  - naver_blog_image_downloader/lib/ui/photo_detail/widgets/photo_detail_view.dart
  - naver_blog_image_downloader/ios/Flutter/Release.xcconfig
  - naver_blog_image_downloader/lib/config/app_config.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
  - naver_blog_image_downloader/pubspec.lock
  - naver_blog_image_downloader/lib/utils/constants.dart
  - Naver Blog 照片下載器-Flutter-系統架構設計書-完整版.md
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart
  - naver_blog_image_downloader/ios/Podfile
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/config/theme.dart
  - naver_blog_image_downloader/lib/data/services/gallery_service.dart
  - naver_blog_image_downloader/ios/Runner.xcworkspace/contents.xcworkspacedata
  - naver_blog_image_downloader/ios/Flutter/Debug.xcconfig
  - naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart
  - naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart
  - naver_blog_image_downloader/lib/ui/core/result.dart
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_request.dart
  - naver_blog_image_downloader/lib/ui/download/widgets/download_view.dart
  - naver_blog_image_downloader/lib/routing/app_router.dart
  - naver_blog_image_downloader/lib/amplifyconfiguration.dart
  - naver_blog_image_downloader/lib/utils/extensions.dart
tests:
  - naver_blog_image_downloader/test/data/services/api_service_test.dart
  - naver_blog_image_downloader/test/data/repositories/cache_repository_test.dart
  - naver_blog_image_downloader/test/ui/download/download_view_model_test.dart
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
-->

---
### Requirement: Error message displayed

The `BlogInputView` SHALL display an `AlertDialog` when `viewModel.errorMessage` becomes non-null. The dialog title SHALL be "發生錯誤" and the content SHALL display the error message text. The dialog SHALL have a single "好的" `TextButton` to dismiss it. After the dialog is shown, the view SHALL clear the error state to prevent duplicate dialogs. The error detection SHALL occur in the ViewModel listener callback, not in the `build` method. The view SHALL NOT display error messages as inline red `Text` widgets.

#### Scenario: No error present

- **GIVEN** `viewModel.errorMessage` is null
- **WHEN** the BlogInputView is rendered
- **THEN** no error dialog SHALL be displayed

#### Scenario: Error message triggers dialog

- **GIVEN** the BlogInputView is active
- **WHEN** `viewModel.errorMessage` changes to a non-null value
- **THEN** an `AlertDialog` SHALL be displayed with title "發生錯誤" and the error message as content

#### Scenario: Error dialog dismissed

- **GIVEN** an error `AlertDialog` is displayed
- **WHEN** the user taps the "好的" button
- **THEN** the dialog SHALL be dismissed


<!-- @trace
source: lambda-error-dialog
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/blog_input/view_model/blog_input_view_model.dart
tests:
  - naver_blog_image_downloader/test/ui/blog_input/blog_input_view_model_test.dart
-->

---
### Requirement: Navigation on fetch result

The `BlogInputView` SHALL navigate to the download page when `viewModel.fetchResult` is successfully obtained. The navigation SHALL pass the fetchResult data to the download page.

The `_BlogInputViewState` SHALL store a reference to `BlogInputViewModel` in a `late final` field during `initState`. The `dispose` method SHALL use this stored reference to remove the listener, instead of calling `context.read<BlogInputViewModel>()`.

#### Scenario: Fetch result obtained

- **WHEN** `viewModel.fetchResult` becomes available after a successful fetch
- **THEN** the app SHALL navigate to the download page with the fetchResult data

#### Scenario: ViewModel reference stored safely

- **WHEN** `initState` is called
- **THEN** the ViewModel reference SHALL be stored in a `late final` field

#### Scenario: Listener removed safely on dispose

- **WHEN** `dispose` is called
- **THEN** the listener SHALL be removed using the stored ViewModel reference, NOT via `context.read`


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
### Requirement: Settings navigation button in AppBar

The AppBar SHALL display a settings icon button (`Icons.settings`) in the `actions` area.

When tapped, the button SHALL present the `SettingsView` as a modal bottom sheet with `isScrollControlled: true`, `useSafeArea: true`, top-left and top-right rounded corners (radius 16), `Clip.antiAlias`, and a custom `transitionAnimationController` created by `BottomSheetAnimation.createController` with platform-specific durations.

The `_BlogInputViewState` SHALL mix in `SingleTickerProviderStateMixin` to provide `vsync` for the `AnimationController`. The `AnimationController` SHALL be created in `initState` using `defaultTargetPlatform` for platform detection and SHALL be disposed in `dispose` before `super.dispose()`. The same `AnimationController` instance SHALL be reused across multiple sheet presentations.

#### Scenario: Settings button is visible

- **GIVEN** the user is on the BlogInputView (home page)
- **WHEN** the page renders
- **THEN** the AppBar SHALL display a settings icon button on the right side

#### Scenario: Tapping settings button presents settings sheet with custom animation

- **GIVEN** the user is on the BlogInputView
- **WHEN** the user taps the settings icon button
- **THEN** the app SHALL present SettingsView as a modal bottom sheet with rounded top corners and a platform-specific `transitionAnimationController`

#### Scenario: Animation controller uses platform-specific durations

- **GIVEN** the app is running on iOS
- **WHEN** the settings sheet is presented
- **THEN** the sheet enter animation SHALL use a 500ms duration and the exit animation SHALL use a 350ms duration

#### Scenario: Animation controller uses Android durations

- **GIVEN** the app is running on Android
- **WHEN** the settings sheet is presented
- **THEN** the sheet enter animation SHALL use a 400ms duration and the exit animation SHALL use a 250ms duration

#### Scenario: User can dismiss settings sheet

- **GIVEN** the settings sheet is presented
- **WHEN** the user swipes down or taps the close button
- **THEN** the sheet SHALL be dismissed with the reverse animation and the user SHALL return to the BlogInputView

#### Scenario: Animation controller reused across presentations

- **GIVEN** the settings sheet has been previously presented and dismissed
- **WHEN** the user taps the settings icon button again
- **THEN** the same `AnimationController` instance SHALL be reused for the new presentation


<!-- @trace
source: settings-sheet-animation
updated: 2026-03-23
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart
-->

---
### Requirement: Fetch failure warning dialog

The `BlogInputView` SHALL display a warning dialog when `fetchResult.failureDownloads > 0`, before proceeding to the download flow.

The dialog SHALL display:
- A title: "部分照片擷取失敗"
- A content message summarizing total, successful, and failed counts (e.g., "總共有 31 張照片，成功取得 30 張，無法取得 1 張。請問是否繼續下載已取得的照片？")
- A "繼續下載" button that proceeds to the download flow with the successfully fetched photos
- A "取消下載" button that dismisses the dialog and returns to the input page

The dialog SHALL NOT display individual error messages from `fetchErrors`.

#### Scenario: Failure downloads present

- **WHEN** `fetchResult.failureDownloads` is greater than `0`
- **THEN** a warning `AlertDialog` SHALL be displayed before navigation

#### Scenario: User chooses to continue

- **GIVEN** the warning dialog is displayed
- **WHEN** the user taps "繼續下載"
- **THEN** the app SHALL proceed to the download flow with the available photos

#### Scenario: User chooses to cancel

- **GIVEN** the warning dialog is displayed
- **WHEN** the user taps "取消下載"
- **THEN** the dialog SHALL be dismissed and the user SHALL remain on the input page

#### Scenario: No failure downloads

- **WHEN** `fetchResult.failureDownloads` is `0`
- **THEN** no warning dialog SHALL be displayed and the app SHALL proceed directly to the download flow

<!-- @trace
source: fetch-failure-notification
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/data/models/fetch_result.dart
  - naver_blog_image_downloader/lib/data/repositories/photo_repository.dart
tests:
  - naver_blog_image_downloader/test/data/repositories/photo_repository_test.dart
  - naver_blog_image_downloader/test/widget_test.dart
-->

---
### Requirement: TextEditingController for programmatic text control

The `BlogInputView` SHALL use a `TextEditingController` to manage the TextField's text content. The controller SHALL be initialized in `initState` and disposed in `dispose`. The TextField SHALL bind to the controller via the `controller` property while retaining the `onChanged: viewModel.onUrlChanged` callback for ViewModel synchronization.

#### Scenario: Controller lifecycle

- **GIVEN** the BlogInputView is created
- **WHEN** `initState` is called
- **THEN** a `TextEditingController` SHALL be initialized

#### Scenario: Controller disposal

- **GIVEN** the BlogInputView is being destroyed
- **WHEN** `dispose` is called
- **THEN** the `TextEditingController` SHALL be disposed


<!-- @trace
source: blog-input-clipboard-paste
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
tests:
  - naver_blog_image_downloader/test/ui/core/naver_url_validator_test.dart
-->

---
### Requirement: Paste button as suffixIcon

The `BlogInputView` TextField SHALL display an `IconButton` with `Icons.content_paste` as the `suffixIcon` in its `InputDecoration`. Tapping the button SHALL read the system clipboard via `Clipboard.getData(Clipboard.kTextPlain)`.

If the clipboard is empty, a `SnackBar` SHALL inform the user that the clipboard has no content.

If the clipboard contains text, the text SHALL be validated using `NaverUrlValidator`. If valid, the text SHALL be set to the `TextEditingController` and `viewModel.onUrlChanged` SHALL be called. If invalid, an `AlertDialog` SHALL display a message informing the user that the clipboard content does not appear to be a Naver Blog URL.

#### Scenario: Paste valid URL from clipboard

- **GIVEN** the clipboard contains a valid Naver Blog URL
- **WHEN** the user taps the paste button
- **THEN** the URL SHALL be set in the TextField and `viewModel.onUrlChanged` SHALL be called with the URL

#### Scenario: Paste invalid content from clipboard

- **GIVEN** the clipboard contains text that is not a valid Naver Blog URL
- **WHEN** the user taps the paste button
- **THEN** an `AlertDialog` SHALL display a message indicating the content is not a valid Naver Blog URL

#### Scenario: Paste with empty clipboard

- **GIVEN** the clipboard is empty
- **WHEN** the user taps the paste button
- **THEN** a `SnackBar` SHALL inform the user that the clipboard has no content


<!-- @trace
source: blog-input-clipboard-paste
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
tests:
  - naver_blog_image_downloader/test/ui/core/naver_url_validator_test.dart
-->

---
### Requirement: Clipboard URL detection on app resume

The `BlogInputView` SHALL implement `WidgetsBindingObserver` to detect when the app returns to the foreground. On `AppLifecycleState.resumed`, the view SHALL read the clipboard and validate the content using `NaverUrlValidator`.

If the clipboard contains a valid Naver Blog URL that differs from the current TextField content, a `SnackBar` with a "Paste" action button SHALL be displayed. Tapping the action SHALL set the URL in the TextField and call `viewModel.onUrlChanged`.

If the clipboard content is not a valid URL or matches the current TextField content, no action SHALL be taken.

#### Scenario: Valid URL detected on resume

- **GIVEN** the clipboard contains a valid Naver Blog URL different from the current input
- **WHEN** the app returns to the foreground
- **THEN** a `SnackBar` with a "Paste" action SHALL be displayed

#### Scenario: User confirms paste from SnackBar

- **GIVEN** a clipboard detection SnackBar is displayed
- **WHEN** the user taps the "Paste" action
- **THEN** the URL SHALL be set in the TextField and `viewModel.onUrlChanged` SHALL be called

#### Scenario: Same URL already in input

- **GIVEN** the clipboard contains a valid Naver Blog URL identical to the current input
- **WHEN** the app returns to the foreground
- **THEN** no SnackBar SHALL be displayed

#### Scenario: Invalid content on resume

- **GIVEN** the clipboard contains text that is not a valid Naver Blog URL
- **WHEN** the app returns to the foreground
- **THEN** no action SHALL be taken and no UI feedback SHALL be shown

<!-- @trace
source: blog-input-clipboard-paste
updated: 2026-03-22
code:
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/ui/core/naver_url_validator.dart
tests:
  - naver_blog_image_downloader/test/ui/core/naver_url_validator_test.dart
-->

---
### Requirement: Localized UI text

All user-facing text in `BlogInputView` SHALL be sourced from `AppLocalizations.of(context)` instead of hardcoded string literals. This includes:

- AppBar title
- TextField labelText and hintText
- Button labels (fetch, cancel, paste)
- Dialog titles and content (error, clipboard detection, fetch failure warning)
- Tooltip text

#### Scenario: UI text displayed in English

- **WHEN** the app locale is set to English
- **THEN** all user-facing text in `BlogInputView` SHALL display English translations from `AppLocalizations`

#### Scenario: UI text displayed in Traditional Chinese

- **WHEN** the app locale is set to zh_TW
- **THEN** all user-facing text in `BlogInputView` SHALL display Traditional Chinese text from `AppLocalizations`


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
### Requirement: Error message mapping from ViewModel enum

The `BlogInputView` SHALL map `FetchErrorType` enum values from `BlogInputViewModel` to localized error messages using `AppLocalizations.of(context)`.

#### Scenario: FetchErrorType.emptyUrl mapped to localized message

- **WHEN** the ViewModel's `FetchState` is `FetchError` with `errorType` `FetchErrorType.emptyUrl`
- **THEN** the view SHALL display the localized empty URL error message from `AppLocalizations`

#### Scenario: FetchErrorType.timeout mapped to localized message

- **WHEN** the ViewModel's `FetchState` is `FetchError` with `errorType` `FetchErrorType.timeout`
- **THEN** the view SHALL display the localized timeout error message from `AppLocalizations`


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
### Requirement: Loading phase mapping from ViewModel enum

The `BlogInputView` SHALL map `FetchLoadingPhase` enum values from `BlogInputViewModel` to localized status messages using `AppLocalizations.of(context)`.

#### Scenario: FetchLoadingPhase.submitting mapped to localized message

- **WHEN** the ViewModel's `FetchState` is `FetchLoading` with `phase` `FetchLoadingPhase.submitting`
- **THEN** the view SHALL display the localized "submitting" status message from `AppLocalizations`

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
### Requirement: What's New check on first frame

`BlogInputView` SHALL add a `WidgetsBinding.instance.addPostFrameCallback` in `initState()` that reads the `WhatsNewViewModel` state. If the resolved state is `WhatsNewOnboarding` or `WhatsNewUpdate`, the view SHALL call `showWhatsNewDialog()` to display the fullscreen dialog, then call `WhatsNewViewModel.dismiss()` after the dialog closes. If the state is `WhatsNewHidden`, no dialog SHALL be shown.

#### Scenario: Onboarding shown on first install

- **GIVEN** a fresh install with no stored `lastSeenVersion`
- **WHEN** `BlogInputView` mounts and the first frame completes
- **THEN** the onboarding fullscreen dialog SHALL be displayed

#### Scenario: What's New shown after update

- **GIVEN** the stored `lastSeenVersion` differs from the current version
- **AND** the current version has a registry entry
- **WHEN** `BlogInputView` mounts and the first frame completes
- **THEN** the What's New fullscreen dialog SHALL be displayed

#### Scenario: No dialog on repeat launch

- **GIVEN** the stored `lastSeenVersion` equals the current version
- **WHEN** `BlogInputView` mounts and the first frame completes
- **THEN** no dialog SHALL be shown

<!-- @trace
source: whats-new-onboarding
updated: 2026-04-05
code:
  - naver_blog_image_downloader/lib/l10n/app_zh_TW.arb
  - naver_blog_image_downloader/lib/ui/whats_new/view_model/whats_new_view_model.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_en.dart
  - naver_blog_image_downloader/lib/config/app_settings_keys.dart
  - naver_blog_image_downloader/lib/l10n/app_zh.arb
  - naver_blog_image_downloader/lib/config/whats_new_registry.dart
  - naver_blog_image_downloader/lib/l10n/app_ko.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations.dart
  - naver_blog_image_downloader/lib/l10n/app_en.arb
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_dialog.dart
  - naver_blog_image_downloader/lib/l10n/app_ja.arb
  - naver_blog_image_downloader/lib/l10n/app_localizations_ko.dart
  - naver_blog_image_downloader/lib/data/repositories/settings_repository.dart
  - naver_blog_image_downloader/lib/data/services/local_storage_service.dart
  - naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart
  - naver_blog_image_downloader/lib/l10n/app_localizations_ja.dart
  - naver_blog_image_downloader/lib/ui/whats_new/widgets/whats_new_view.dart
  - naver_blog_image_downloader/pubspec.yaml
  - naver_blog_image_downloader/lib/l10n/app_localizations_zh.dart
-->