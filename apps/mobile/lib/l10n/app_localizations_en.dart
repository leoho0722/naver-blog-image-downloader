// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Naver Blog Photo Downloader';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonConfirm => 'Confirm';

  @override
  String get commonOk => 'OK';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsSectionAppearance => 'Appearance';

  @override
  String get settingsSectionLanguage => 'Language';

  @override
  String get settingsSectionCache => 'Cache';

  @override
  String get settingsSectionAbout => 'About';

  @override
  String get settingsThemeSystem => 'System';

  @override
  String get settingsThemeLight => 'Light';

  @override
  String get settingsThemeDark => 'Dark';

  @override
  String get settingsCacheSizeLabel => 'Cache Size';

  @override
  String get settingsClearAllTooltip => 'Clear All Cache';

  @override
  String get settingsClearAllDialogTitle => 'Clear All Cache';

  @override
  String get settingsClearAllDialogContent =>
      'Are you sure you want to clear all cached photos? This action cannot be undone.';

  @override
  String get settingsVersionLabel => 'Version';

  @override
  String get blogInputAppBarTitle => 'Photo Downloader';

  @override
  String get blogInputUrlLabel => 'Naver Blog URL';

  @override
  String get blogInputUrlHint => 'https://blog.naver.com/...';

  @override
  String get blogInputPasteTooltip => 'Paste from clipboard';

  @override
  String get blogInputFetchButton => 'Fetch Photo List';

  @override
  String get blogInputClipboardDetectedTitle => 'Blog URL Detected';

  @override
  String get blogInputPasteButton => 'Paste';

  @override
  String get blogInputClipboardEmptyTitle => 'Clipboard Empty';

  @override
  String get blogInputClipboardEmptyContent =>
      'There is no text to paste from the clipboard.';

  @override
  String get blogInputClipboardInvalidTitle => 'Cannot Paste';

  @override
  String get blogInputClipboardInvalidContent =>
      'The clipboard content does not appear to be a Naver Blog URL. Please check and try again.';

  @override
  String get blogInputFetchFailureTitle => 'Some Photos Failed';

  @override
  String blogInputFetchFailureContent(
    int totalImages,
    int successCount,
    int failureCount,
  ) {
    return 'Out of $totalImages photos, $successCount were retrieved successfully and $failureCount failed.\n\nWould you like to continue downloading the retrieved photos?';
  }

  @override
  String get blogInputCancelDownload => 'Cancel Download';

  @override
  String get blogInputContinueDownload => 'Continue Download';

  @override
  String get blogInputErrorDialogTitle => 'Error';

  @override
  String get errorEmptyUrl => 'Please enter a Blog URL';

  @override
  String get errorTimeout => 'Request timed out. Please try again later.';

  @override
  String errorServerUnavailable(int statusCode) {
    return 'Server temporarily unavailable ($statusCode). Please try again later.';
  }

  @override
  String get errorApiFailed => 'API call failed. Please try again later.';

  @override
  String get errorServerError =>
      'Server processing failed. Please try again later.';

  @override
  String get errorNetworkError =>
      'Network error. Please check your connection.';

  @override
  String get errorGeneric => 'An error occurred. Please try again later.';

  @override
  String get statusSubmitting => 'Submitting task...';

  @override
  String get statusProcessing => 'Server processing...';

  @override
  String get statusCompleted => 'Processing complete';

  @override
  String get downloadDialogTitle => 'Download Photos';

  @override
  String downloadProgress(int completed, int total) {
    return '$completed / $total';
  }

  @override
  String get downloadStatusDownloading => 'Downloading...';

  @override
  String get downloadStatusCompleted => 'Download Complete';

  @override
  String downloadFailedCount(int count) {
    return '$count failed to download';
  }

  @override
  String galleryTitle(int count) {
    return 'Photos ($count)';
  }

  @override
  String get galleryDeselectMode => 'Cancel Selection';

  @override
  String get gallerySelectMode => 'Select Mode';

  @override
  String get gallerySelectAll => 'Select All';

  @override
  String get gallerySaveSelected => 'Save Selected';

  @override
  String get gallerySaveAll => 'Save All';

  @override
  String get galleryEmpty => 'No Photos';

  @override
  String get gallerySaving => 'Saving...';

  @override
  String get gallerySaveToGalleryFailed => 'Failed to save to gallery';

  @override
  String detailPhotoCounter(int current, int total) {
    return '$current / $total';
  }

  @override
  String get detailFileInfo => 'File Info';

  @override
  String get detailFileSize => 'File Size';

  @override
  String get detailDimensions => 'Dimensions';

  @override
  String whatsNewTitle(String version) {
    return 'What\'s New in v$version';
  }

  @override
  String get whatsNewOnboardingTitle => 'Welcome';

  @override
  String get whatsNewDismissButton => 'Got it';

  @override
  String get whatsNewCloseButton => 'Close';

  @override
  String get settingsSectionAppIcon => 'App Icon';

  @override
  String get settingsAppIconSheetTitle => 'Choose App Icon';

  @override
  String get settingsAppIconStyleScroll => 'Scroll View';

  @override
  String get settingsAppIconStyleSheet => 'Grid View';

  @override
  String get settingsAppIconDefault => 'Default';

  @override
  String get settingsAppIconNew => 'New';
}
