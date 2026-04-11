import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ja.dart';
import 'app_localizations_ko.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ja'),
    Locale('ko'),
    Locale('zh'),
    Locale('zh', 'TW'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'Naver Blog 照片下載器'**
  String get appTitle;

  /// No description provided for @commonCancel.
  ///
  /// In zh_TW, this message translates to:
  /// **'取消'**
  String get commonCancel;

  /// No description provided for @commonConfirm.
  ///
  /// In zh_TW, this message translates to:
  /// **'確認'**
  String get commonConfirm;

  /// No description provided for @commonOk.
  ///
  /// In zh_TW, this message translates to:
  /// **'好的'**
  String get commonOk;

  /// No description provided for @settingsTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'設定'**
  String get settingsTitle;

  /// No description provided for @settingsSectionAppearance.
  ///
  /// In zh_TW, this message translates to:
  /// **'外觀'**
  String get settingsSectionAppearance;

  /// No description provided for @settingsSectionLanguage.
  ///
  /// In zh_TW, this message translates to:
  /// **'語言'**
  String get settingsSectionLanguage;

  /// No description provided for @settingsSectionCache.
  ///
  /// In zh_TW, this message translates to:
  /// **'快取'**
  String get settingsSectionCache;

  /// No description provided for @settingsSectionAbout.
  ///
  /// In zh_TW, this message translates to:
  /// **'關於'**
  String get settingsSectionAbout;

  /// No description provided for @settingsThemeSystem.
  ///
  /// In zh_TW, this message translates to:
  /// **'系統'**
  String get settingsThemeSystem;

  /// No description provided for @settingsThemeLight.
  ///
  /// In zh_TW, this message translates to:
  /// **'淺色'**
  String get settingsThemeLight;

  /// No description provided for @settingsThemeDark.
  ///
  /// In zh_TW, this message translates to:
  /// **'深色'**
  String get settingsThemeDark;

  /// No description provided for @settingsCacheSizeLabel.
  ///
  /// In zh_TW, this message translates to:
  /// **'快取大小'**
  String get settingsCacheSizeLabel;

  /// No description provided for @settingsClearAllTooltip.
  ///
  /// In zh_TW, this message translates to:
  /// **'清除所有快取'**
  String get settingsClearAllTooltip;

  /// No description provided for @settingsClearAllDialogTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'清除全部快取'**
  String get settingsClearAllDialogTitle;

  /// No description provided for @settingsClearAllDialogContent.
  ///
  /// In zh_TW, this message translates to:
  /// **'確定要清除所有已快取的照片嗎？此操作無法復原。'**
  String get settingsClearAllDialogContent;

  /// No description provided for @settingsVersionLabel.
  ///
  /// In zh_TW, this message translates to:
  /// **'版本'**
  String get settingsVersionLabel;

  /// No description provided for @blogInputAppBarTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'照片下載器'**
  String get blogInputAppBarTitle;

  /// No description provided for @blogInputUrlLabel.
  ///
  /// In zh_TW, this message translates to:
  /// **'Naver Blog 網址'**
  String get blogInputUrlLabel;

  /// No description provided for @blogInputUrlHint.
  ///
  /// In zh_TW, this message translates to:
  /// **'https://blog.naver.com/...'**
  String get blogInputUrlHint;

  /// No description provided for @blogInputPasteTooltip.
  ///
  /// In zh_TW, this message translates to:
  /// **'從剪貼板貼上'**
  String get blogInputPasteTooltip;

  /// No description provided for @blogInputFetchButton.
  ///
  /// In zh_TW, this message translates to:
  /// **'取得照片列表'**
  String get blogInputFetchButton;

  /// No description provided for @blogInputClipboardDetectedTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'偵測到 Blog 網址'**
  String get blogInputClipboardDetectedTitle;

  /// No description provided for @blogInputPasteButton.
  ///
  /// In zh_TW, this message translates to:
  /// **'貼上'**
  String get blogInputPasteButton;

  /// No description provided for @blogInputClipboardEmptyTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'剪貼板沒有內容'**
  String get blogInputClipboardEmptyTitle;

  /// No description provided for @blogInputClipboardEmptyContent.
  ///
  /// In zh_TW, this message translates to:
  /// **'目前剪貼板中沒有可貼上的文字。'**
  String get blogInputClipboardEmptyContent;

  /// No description provided for @blogInputClipboardInvalidTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'無法貼上'**
  String get blogInputClipboardInvalidTitle;

  /// No description provided for @blogInputClipboardInvalidContent.
  ///
  /// In zh_TW, this message translates to:
  /// **'目前剪貼板的內容似乎不是 Naver Blog 網址，請確認後再試一次。'**
  String get blogInputClipboardInvalidContent;

  /// No description provided for @blogInputFetchFailureTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'部分照片擷取失敗'**
  String get blogInputFetchFailureTitle;

  /// No description provided for @blogInputFetchFailureContent.
  ///
  /// In zh_TW, this message translates to:
  /// **'總共有 {totalImages} 張照片，成功取得 {successCount} 張，無法取得 {failureCount} 張。\n\n請問是否繼續下載已取得的照片？'**
  String blogInputFetchFailureContent(
    int totalImages,
    int successCount,
    int failureCount,
  );

  /// No description provided for @blogInputCancelDownload.
  ///
  /// In zh_TW, this message translates to:
  /// **'取消下載'**
  String get blogInputCancelDownload;

  /// No description provided for @blogInputContinueDownload.
  ///
  /// In zh_TW, this message translates to:
  /// **'繼續下載'**
  String get blogInputContinueDownload;

  /// No description provided for @blogInputErrorDialogTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'發生錯誤'**
  String get blogInputErrorDialogTitle;

  /// No description provided for @errorEmptyUrl.
  ///
  /// In zh_TW, this message translates to:
  /// **'請輸入 Blog 網址'**
  String get errorEmptyUrl;

  /// No description provided for @errorTimeout.
  ///
  /// In zh_TW, this message translates to:
  /// **'請求逾時，請稍後再試'**
  String get errorTimeout;

  /// No description provided for @errorServerUnavailable.
  ///
  /// In zh_TW, this message translates to:
  /// **'伺服器暫時無法使用（{statusCode}），請稍後再試'**
  String errorServerUnavailable(int statusCode);

  /// No description provided for @errorApiFailed.
  ///
  /// In zh_TW, this message translates to:
  /// **'API 呼叫失敗，請稍後再試'**
  String get errorApiFailed;

  /// No description provided for @errorServerError.
  ///
  /// In zh_TW, this message translates to:
  /// **'伺服器處理失敗，請稍後再試'**
  String get errorServerError;

  /// No description provided for @errorNetworkError.
  ///
  /// In zh_TW, this message translates to:
  /// **'網路連線異常，請檢查網路設定'**
  String get errorNetworkError;

  /// No description provided for @errorGeneric.
  ///
  /// In zh_TW, this message translates to:
  /// **'發生錯誤，請稍後再試'**
  String get errorGeneric;

  /// No description provided for @statusSubmitting.
  ///
  /// In zh_TW, this message translates to:
  /// **'正在提交任務...'**
  String get statusSubmitting;

  /// No description provided for @statusProcessing.
  ///
  /// In zh_TW, this message translates to:
  /// **'伺服器處理中...'**
  String get statusProcessing;

  /// No description provided for @statusCompleted.
  ///
  /// In zh_TW, this message translates to:
  /// **'處理完成'**
  String get statusCompleted;

  /// No description provided for @downloadDialogTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'下載照片'**
  String get downloadDialogTitle;

  /// No description provided for @downloadProgress.
  ///
  /// In zh_TW, this message translates to:
  /// **'{completed} / {total}'**
  String downloadProgress(int completed, int total);

  /// No description provided for @downloadStatusDownloading.
  ///
  /// In zh_TW, this message translates to:
  /// **'下載中...'**
  String get downloadStatusDownloading;

  /// No description provided for @downloadStatusCompleted.
  ///
  /// In zh_TW, this message translates to:
  /// **'下載完成'**
  String get downloadStatusCompleted;

  /// No description provided for @downloadFailedCount.
  ///
  /// In zh_TW, this message translates to:
  /// **'{count} 張下載失敗'**
  String downloadFailedCount(int count);

  /// No description provided for @galleryTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'照片瀏覽（{count}）'**
  String galleryTitle(int count);

  /// No description provided for @galleryDeselectMode.
  ///
  /// In zh_TW, this message translates to:
  /// **'取消選取'**
  String get galleryDeselectMode;

  /// No description provided for @gallerySelectMode.
  ///
  /// In zh_TW, this message translates to:
  /// **'選取模式'**
  String get gallerySelectMode;

  /// No description provided for @gallerySelectAll.
  ///
  /// In zh_TW, this message translates to:
  /// **'全選'**
  String get gallerySelectAll;

  /// No description provided for @gallerySaveSelected.
  ///
  /// In zh_TW, this message translates to:
  /// **'儲存已選取'**
  String get gallerySaveSelected;

  /// No description provided for @gallerySaveAll.
  ///
  /// In zh_TW, this message translates to:
  /// **'儲存全部'**
  String get gallerySaveAll;

  /// No description provided for @galleryEmpty.
  ///
  /// In zh_TW, this message translates to:
  /// **'沒有照片'**
  String get galleryEmpty;

  /// No description provided for @gallerySaving.
  ///
  /// In zh_TW, this message translates to:
  /// **'儲存中...'**
  String get gallerySaving;

  /// No description provided for @gallerySaveToGalleryFailed.
  ///
  /// In zh_TW, this message translates to:
  /// **'儲存至相簿失敗'**
  String get gallerySaveToGalleryFailed;

  /// No description provided for @detailPhotoCounter.
  ///
  /// In zh_TW, this message translates to:
  /// **'{current} / {total}'**
  String detailPhotoCounter(int current, int total);

  /// No description provided for @detailFileInfo.
  ///
  /// In zh_TW, this message translates to:
  /// **'檔案資訊'**
  String get detailFileInfo;

  /// No description provided for @detailFileSize.
  ///
  /// In zh_TW, this message translates to:
  /// **'檔案大小'**
  String get detailFileSize;

  /// No description provided for @detailDimensions.
  ///
  /// In zh_TW, this message translates to:
  /// **'照片尺寸'**
  String get detailDimensions;

  /// No description provided for @whatsNewTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'v{version} 新功能'**
  String whatsNewTitle(String version);

  /// No description provided for @whatsNewOnboardingTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'歡迎使用'**
  String get whatsNewOnboardingTitle;

  /// No description provided for @whatsNewDismissButton.
  ///
  /// In zh_TW, this message translates to:
  /// **'知道了'**
  String get whatsNewDismissButton;

  /// No description provided for @whatsNewCloseButton.
  ///
  /// In zh_TW, this message translates to:
  /// **'關閉'**
  String get whatsNewCloseButton;

  /// No description provided for @settingsSectionAppIcon.
  ///
  /// In zh_TW, this message translates to:
  /// **'App 圖示'**
  String get settingsSectionAppIcon;

  /// No description provided for @settingsAppIconSheetTitle.
  ///
  /// In zh_TW, this message translates to:
  /// **'選擇 App 圖示'**
  String get settingsAppIconSheetTitle;

  /// No description provided for @settingsAppIconStyleScroll.
  ///
  /// In zh_TW, this message translates to:
  /// **'以滑動檢視'**
  String get settingsAppIconStyleScroll;

  /// No description provided for @settingsAppIconStyleSheet.
  ///
  /// In zh_TW, this message translates to:
  /// **'以網格檢視'**
  String get settingsAppIconStyleSheet;

  /// No description provided for @settingsAppIconDefault.
  ///
  /// In zh_TW, this message translates to:
  /// **'預設'**
  String get settingsAppIconDefault;

  /// No description provided for @settingsAppIconNew.
  ///
  /// In zh_TW, this message translates to:
  /// **'新版'**
  String get settingsAppIconNew;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ja', 'ko', 'zh'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when language+country codes are specified.
  switch (locale.languageCode) {
    case 'zh':
      {
        switch (locale.countryCode) {
          case 'TW':
            return AppLocalizationsZhTw();
        }
        break;
      }
  }

  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'ja':
      return AppLocalizationsJa();
    case 'ko':
      return AppLocalizationsKo();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
