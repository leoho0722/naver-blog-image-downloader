// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Japanese (`ja`).
class AppLocalizationsJa extends AppLocalizations {
  AppLocalizationsJa([String locale = 'ja']) : super(locale);

  @override
  String get appTitle => 'Naverブログ写真ダウンローダー';

  @override
  String get commonCancel => 'キャンセル';

  @override
  String get commonConfirm => '確認';

  @override
  String get commonOk => 'OK';

  @override
  String get settingsTitle => '設定';

  @override
  String get settingsSectionAppearance => '外観';

  @override
  String get settingsSectionLanguage => '言語';

  @override
  String get settingsSectionCache => 'キャッシュ';

  @override
  String get settingsSectionAbout => '情報';

  @override
  String get settingsThemeSystem => 'システム';

  @override
  String get settingsThemeLight => 'ライト';

  @override
  String get settingsThemeDark => 'ダーク';

  @override
  String get settingsCacheSizeLabel => 'キャッシュサイズ';

  @override
  String get settingsClearAllTooltip => 'すべてのキャッシュを削除';

  @override
  String get settingsClearAllDialogTitle => 'すべてのキャッシュを削除';

  @override
  String get settingsClearAllDialogContent =>
      'キャッシュされたすべての写真を削除しますか？この操作は元に戻せません。';

  @override
  String get settingsVersionLabel => 'バージョン';

  @override
  String get blogInputAppBarTitle => '写真ダウンローダー';

  @override
  String get blogInputUrlLabel => 'NaverブログURL';

  @override
  String get blogInputUrlHint => 'https://blog.naver.com/...';

  @override
  String get blogInputPasteTooltip => 'クリップボードから貼り付け';

  @override
  String get blogInputFetchButton => '写真一覧を取得';

  @override
  String get blogInputClipboardDetectedTitle => 'ブログURLを検出しました';

  @override
  String get blogInputPasteButton => '貼り付け';

  @override
  String get blogInputClipboardEmptyTitle => 'クリップボードが空です';

  @override
  String get blogInputClipboardEmptyContent => 'クリップボードに貼り付けるテキストがありません。';

  @override
  String get blogInputClipboardInvalidTitle => '貼り付け不可';

  @override
  String get blogInputClipboardInvalidContent =>
      'クリップボードの内容はNaverブログのURLではないようです。確認してからもう一度お試しください。';

  @override
  String get blogInputFetchFailureTitle => '一部の写真の取得に失敗しました';

  @override
  String blogInputFetchFailureContent(
    int totalImages,
    int successCount,
    int failureCount,
  ) {
    return '合計$totalImages枚の写真のうち$successCount枚を正常に取得しましたが、$failureCount枚を取得できませんでした。\n\n取得した写真のダウンロードを続けますか？';
  }

  @override
  String get blogInputCancelDownload => 'ダウンロードをキャンセル';

  @override
  String get blogInputContinueDownload => 'ダウンロードを続行';

  @override
  String get blogInputErrorDialogTitle => 'エラーが発生しました';

  @override
  String get errorEmptyUrl => 'ブログURLを入力してください';

  @override
  String get errorTimeout => 'リクエストがタイムアウトしました。しばらくしてからもう一度お試しください。';

  @override
  String errorServerUnavailable(int statusCode) {
    return 'サーバーが一時的に利用できません（$statusCode）。しばらくしてからもう一度お試しください。';
  }

  @override
  String get errorApiFailed => 'API呼び出しに失敗しました。しばらくしてからもう一度お試しください。';

  @override
  String get errorServerError => 'サーバー処理に失敗しました。しばらくしてからもう一度お試しください。';

  @override
  String get errorNetworkError => 'ネットワークエラーです。接続状態を確認してください。';

  @override
  String get errorGeneric => 'エラーが発生しました。しばらくしてからもう一度お試しください。';

  @override
  String get statusSubmitting => 'タスクを送信中...';

  @override
  String get statusProcessing => 'サーバー処理中...';

  @override
  String get statusCompleted => '処理完了';

  @override
  String get downloadDialogTitle => '写真ダウンロード';

  @override
  String downloadProgress(int completed, int total) {
    return '$completed / $total';
  }

  @override
  String get downloadStatusDownloading => 'ダウンロード中...';

  @override
  String get downloadStatusCompleted => 'ダウンロード完了';

  @override
  String downloadFailedCount(int count) {
    return '$count枚のダウンロードに失敗しました';
  }

  @override
  String galleryTitle(int count) {
    return '写真一覧（$count枚）';
  }

  @override
  String get galleryDeselectMode => '選択解除';

  @override
  String get gallerySelectMode => '選択モード';

  @override
  String get gallerySelectAll => 'すべて選択';

  @override
  String get gallerySaveSelected => '選択した写真を保存';

  @override
  String get gallerySaveAll => 'すべて保存';

  @override
  String get galleryEmpty => '写真がありません';

  @override
  String get gallerySaving => '保存中...';

  @override
  String get gallerySaveToGalleryFailed => 'ギャラリーへの保存に失敗しました';

  @override
  String detailPhotoCounter(int current, int total) {
    return '$current / $total';
  }

  @override
  String get detailFileInfo => 'ファイル情報';

  @override
  String get detailFileSize => 'ファイルサイズ';

  @override
  String get detailDimensions => '写真サイズ';

  @override
  String whatsNewTitle(String version) {
    return 'v$version の新機能';
  }

  @override
  String get whatsNewOnboardingTitle => 'ようこそ';

  @override
  String get whatsNewDismissButton => '了解';

  @override
  String get whatsNewCloseButton => '閉じる';

  @override
  String get settingsSectionAppIcon => 'アプリアイコン';

  @override
  String get settingsAppIconSheetTitle => 'アプリアイコンを選択';

  @override
  String get settingsAppIconStyleScroll => 'スクロール表示';

  @override
  String get settingsAppIconStyleSheet => 'グリッド表示';

  @override
  String get settingsAppIconDefault => 'デフォルト';

  @override
  String get settingsAppIconNew => '新バージョン';
}
