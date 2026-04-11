// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appTitle => 'Naver Blog 照片下載器';

  @override
  String get commonCancel => '取消';

  @override
  String get commonConfirm => '確認';

  @override
  String get commonOk => '好的';

  @override
  String get settingsTitle => '設定';

  @override
  String get settingsSectionAppearance => '外觀';

  @override
  String get settingsSectionLanguage => '語言';

  @override
  String get settingsSectionCache => '快取';

  @override
  String get settingsSectionAbout => '關於';

  @override
  String get settingsThemeSystem => '系統';

  @override
  String get settingsThemeLight => '淺色';

  @override
  String get settingsThemeDark => '深色';

  @override
  String get settingsCacheSizeLabel => '快取大小';

  @override
  String get settingsClearAllTooltip => '清除所有快取';

  @override
  String get settingsClearAllDialogTitle => '清除全部快取';

  @override
  String get settingsClearAllDialogContent => '確定要清除所有已快取的照片嗎？此操作無法復原。';

  @override
  String get settingsVersionLabel => '版本';

  @override
  String get blogInputAppBarTitle => '照片下載器';

  @override
  String get blogInputUrlLabel => 'Naver Blog 網址';

  @override
  String get blogInputUrlHint => 'https://blog.naver.com/...';

  @override
  String get blogInputPasteTooltip => '從剪貼板貼上';

  @override
  String get blogInputFetchButton => '取得照片列表';

  @override
  String get blogInputClipboardDetectedTitle => '偵測到 Blog 網址';

  @override
  String get blogInputPasteButton => '貼上';

  @override
  String get blogInputClipboardEmptyTitle => '剪貼板沒有內容';

  @override
  String get blogInputClipboardEmptyContent => '目前剪貼板中沒有可貼上的文字。';

  @override
  String get blogInputClipboardInvalidTitle => '無法貼上';

  @override
  String get blogInputClipboardInvalidContent =>
      '目前剪貼板的內容似乎不是 Naver Blog 網址，請確認後再試一次。';

  @override
  String get blogInputFetchFailureTitle => '部分照片擷取失敗';

  @override
  String blogInputFetchFailureContent(
    int totalImages,
    int successCount,
    int failureCount,
  ) {
    return '總共有 $totalImages 張照片，成功取得 $successCount 張，無法取得 $failureCount 張。\n\n請問是否繼續下載已取得的照片？';
  }

  @override
  String get blogInputCancelDownload => '取消下載';

  @override
  String get blogInputContinueDownload => '繼續下載';

  @override
  String get blogInputErrorDialogTitle => '發生錯誤';

  @override
  String get errorEmptyUrl => '請輸入 Blog 網址';

  @override
  String get errorTimeout => '請求逾時，請稍後再試';

  @override
  String errorServerUnavailable(int statusCode) {
    return '伺服器暫時無法使用（$statusCode），請稍後再試';
  }

  @override
  String get errorApiFailed => 'API 呼叫失敗，請稍後再試';

  @override
  String get errorServerError => '伺服器處理失敗，請稍後再試';

  @override
  String get errorNetworkError => '網路連線異常，請檢查網路設定';

  @override
  String get errorGeneric => '發生錯誤，請稍後再試';

  @override
  String get statusSubmitting => '正在提交任務...';

  @override
  String get statusProcessing => '伺服器處理中...';

  @override
  String get statusCompleted => '處理完成';

  @override
  String get downloadDialogTitle => '下載照片';

  @override
  String downloadProgress(int completed, int total) {
    return '$completed / $total';
  }

  @override
  String get downloadStatusDownloading => '下載中...';

  @override
  String get downloadStatusCompleted => '下載完成';

  @override
  String downloadFailedCount(int count) {
    return '$count 張下載失敗';
  }

  @override
  String galleryTitle(int count) {
    return '照片瀏覽（$count）';
  }

  @override
  String get galleryDeselectMode => '取消選取';

  @override
  String get gallerySelectMode => '選取模式';

  @override
  String get gallerySelectAll => '全選';

  @override
  String get gallerySaveSelected => '儲存已選取';

  @override
  String get gallerySaveAll => '儲存全部';

  @override
  String get galleryEmpty => '沒有照片';

  @override
  String get gallerySaving => '儲存中...';

  @override
  String get gallerySaveToGalleryFailed => '儲存至相簿失敗';

  @override
  String detailPhotoCounter(int current, int total) {
    return '$current / $total';
  }

  @override
  String get detailFileInfo => '檔案資訊';

  @override
  String get detailFileSize => '檔案大小';

  @override
  String get detailDimensions => '照片尺寸';

  @override
  String whatsNewTitle(String version) {
    return 'v$version 新功能';
  }

  @override
  String get whatsNewOnboardingTitle => '歡迎使用';

  @override
  String get whatsNewDismissButton => '知道了';

  @override
  String get whatsNewCloseButton => '關閉';

  @override
  String get settingsSectionAppIcon => 'App 圖示';

  @override
  String get settingsAppIconSheetTitle => '選擇 App 圖示';

  @override
  String get settingsAppIconStyleScroll => '以滑動檢視';

  @override
  String get settingsAppIconStyleSheet => '以網格檢視';

  @override
  String get settingsAppIconDefault => '預設';

  @override
  String get settingsAppIconNew => '新版';
}

/// The translations for Chinese, as used in Taiwan (`zh_TW`).
class AppLocalizationsZhTw extends AppLocalizationsZh {
  AppLocalizationsZhTw() : super('zh_TW');

  @override
  String get appTitle => 'Naver Blog 照片下載器';

  @override
  String get commonCancel => '取消';

  @override
  String get commonConfirm => '確認';

  @override
  String get commonOk => '好的';

  @override
  String get settingsTitle => '設定';

  @override
  String get settingsSectionAppearance => '外觀';

  @override
  String get settingsSectionLanguage => '語言';

  @override
  String get settingsSectionCache => '快取';

  @override
  String get settingsSectionAbout => '關於';

  @override
  String get settingsThemeSystem => '系統';

  @override
  String get settingsThemeLight => '淺色';

  @override
  String get settingsThemeDark => '深色';

  @override
  String get settingsCacheSizeLabel => '快取大小';

  @override
  String get settingsClearAllTooltip => '清除所有快取';

  @override
  String get settingsClearAllDialogTitle => '清除全部快取';

  @override
  String get settingsClearAllDialogContent => '確定要清除所有已快取的照片嗎？此操作無法復原。';

  @override
  String get settingsVersionLabel => '版本';

  @override
  String get blogInputAppBarTitle => '照片下載器';

  @override
  String get blogInputUrlLabel => 'Naver Blog 網址';

  @override
  String get blogInputUrlHint => 'https://blog.naver.com/...';

  @override
  String get blogInputPasteTooltip => '從剪貼板貼上';

  @override
  String get blogInputFetchButton => '取得照片列表';

  @override
  String get blogInputClipboardDetectedTitle => '偵測到 Blog 網址';

  @override
  String get blogInputPasteButton => '貼上';

  @override
  String get blogInputClipboardEmptyTitle => '剪貼板沒有內容';

  @override
  String get blogInputClipboardEmptyContent => '目前剪貼板中沒有可貼上的文字。';

  @override
  String get blogInputClipboardInvalidTitle => '無法貼上';

  @override
  String get blogInputClipboardInvalidContent =>
      '目前剪貼板的內容似乎不是 Naver Blog 網址，請確認後再試一次。';

  @override
  String get blogInputFetchFailureTitle => '部分照片擷取失敗';

  @override
  String blogInputFetchFailureContent(
    int totalImages,
    int successCount,
    int failureCount,
  ) {
    return '總共有 $totalImages 張照片，成功取得 $successCount 張，無法取得 $failureCount 張。\n\n請問是否繼續下載已取得的照片？';
  }

  @override
  String get blogInputCancelDownload => '取消下載';

  @override
  String get blogInputContinueDownload => '繼續下載';

  @override
  String get blogInputErrorDialogTitle => '發生錯誤';

  @override
  String get errorEmptyUrl => '請輸入 Blog 網址';

  @override
  String get errorTimeout => '請求逾時，請稍後再試';

  @override
  String errorServerUnavailable(int statusCode) {
    return '伺服器暫時無法使用（$statusCode），請稍後再試';
  }

  @override
  String get errorApiFailed => 'API 呼叫失敗，請稍後再試';

  @override
  String get errorServerError => '伺服器處理失敗，請稍後再試';

  @override
  String get errorNetworkError => '網路連線異常，請檢查網路設定';

  @override
  String get errorGeneric => '發生錯誤，請稍後再試';

  @override
  String get statusSubmitting => '正在提交任務...';

  @override
  String get statusProcessing => '伺服器處理中...';

  @override
  String get statusCompleted => '處理完成';

  @override
  String get downloadDialogTitle => '下載照片';

  @override
  String downloadProgress(int completed, int total) {
    return '$completed / $total';
  }

  @override
  String get downloadStatusDownloading => '下載中...';

  @override
  String get downloadStatusCompleted => '下載完成';

  @override
  String downloadFailedCount(int count) {
    return '$count 張下載失敗';
  }

  @override
  String galleryTitle(int count) {
    return '照片瀏覽（$count）';
  }

  @override
  String get galleryDeselectMode => '取消選取';

  @override
  String get gallerySelectMode => '選取模式';

  @override
  String get gallerySelectAll => '全選';

  @override
  String get gallerySaveSelected => '儲存已選取';

  @override
  String get gallerySaveAll => '儲存全部';

  @override
  String get galleryEmpty => '沒有照片';

  @override
  String get gallerySaving => '儲存中...';

  @override
  String get gallerySaveToGalleryFailed => '儲存至相簿失敗';

  @override
  String detailPhotoCounter(int current, int total) {
    return '$current / $total';
  }

  @override
  String get detailFileInfo => '檔案資訊';

  @override
  String get detailFileSize => '檔案大小';

  @override
  String get detailDimensions => '照片尺寸';

  @override
  String whatsNewTitle(String version) {
    return 'v$version 新功能';
  }

  @override
  String get whatsNewOnboardingTitle => '歡迎使用';

  @override
  String get whatsNewDismissButton => '知道了';

  @override
  String get whatsNewCloseButton => '關閉';

  @override
  String get settingsSectionAppIcon => 'App 圖示';

  @override
  String get settingsAppIconSheetTitle => '選擇 App 圖示';

  @override
  String get settingsAppIconStyleScroll => '以滑動檢視';

  @override
  String get settingsAppIconStyleSheet => '以網格檢視';

  @override
  String get settingsAppIconDefault => '預設';

  @override
  String get settingsAppIconNew => '新版';
}
