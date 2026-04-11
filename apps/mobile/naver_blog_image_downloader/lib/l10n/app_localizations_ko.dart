// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Korean (`ko`).
class AppLocalizationsKo extends AppLocalizations {
  AppLocalizationsKo([String locale = 'ko']) : super(locale);

  @override
  String get appTitle => '네이버 블로그 사진 다운로더';

  @override
  String get commonCancel => '취소';

  @override
  String get commonConfirm => '확인';

  @override
  String get commonOk => '확인';

  @override
  String get settingsTitle => '설정';

  @override
  String get settingsSectionAppearance => '외관';

  @override
  String get settingsSectionLanguage => '언어';

  @override
  String get settingsSectionCache => '캐시';

  @override
  String get settingsSectionAbout => '정보';

  @override
  String get settingsThemeSystem => '시스템';

  @override
  String get settingsThemeLight => '라이트';

  @override
  String get settingsThemeDark => '다크';

  @override
  String get settingsCacheSizeLabel => '캐시 크기';

  @override
  String get settingsClearAllTooltip => '모든 캐시 삭제';

  @override
  String get settingsClearAllDialogTitle => '모든 캐시 삭제';

  @override
  String get settingsClearAllDialogContent =>
      '캐시된 모든 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';

  @override
  String get settingsVersionLabel => '버전';

  @override
  String get blogInputAppBarTitle => '사진 다운로더';

  @override
  String get blogInputUrlLabel => '네이버 블로그 URL';

  @override
  String get blogInputUrlHint => 'https://blog.naver.com/...';

  @override
  String get blogInputPasteTooltip => '클립보드에서 붙여넣기';

  @override
  String get blogInputFetchButton => '사진 목록 가져오기';

  @override
  String get blogInputClipboardDetectedTitle => '블로그 URL 감지됨';

  @override
  String get blogInputPasteButton => '붙여넣기';

  @override
  String get blogInputClipboardEmptyTitle => '클립보드가 비어있습니다';

  @override
  String get blogInputClipboardEmptyContent => '클립보드에 붙여넣을 텍스트가 없습니다.';

  @override
  String get blogInputClipboardInvalidTitle => '붙여넣기 불가';

  @override
  String get blogInputClipboardInvalidContent =>
      '클립보드의 내용이 네이버 블로그 URL이 아닌 것 같습니다. 확인 후 다시 시도해 주세요.';

  @override
  String get blogInputFetchFailureTitle => '일부 사진 가져오기 실패';

  @override
  String blogInputFetchFailureContent(
    int totalImages,
    int successCount,
    int failureCount,
  ) {
    return '총 $totalImages장의 사진 중 $successCount장을 성공적으로 가져왔고, $failureCount장을 가져오지 못했습니다.\n\n가져온 사진을 계속 다운로드하시겠습니까?';
  }

  @override
  String get blogInputCancelDownload => '다운로드 취소';

  @override
  String get blogInputContinueDownload => '다운로드 계속';

  @override
  String get blogInputErrorDialogTitle => '오류 발생';

  @override
  String get errorEmptyUrl => '블로그 URL을 입력해 주세요';

  @override
  String get errorTimeout => '요청 시간이 초과되었습니다. 나중에 다시 시도해 주세요.';

  @override
  String errorServerUnavailable(int statusCode) {
    return '서버를 일시적으로 사용할 수 없습니다($statusCode). 나중에 다시 시도해 주세요.';
  }

  @override
  String get errorApiFailed => 'API 호출에 실패했습니다. 나중에 다시 시도해 주세요.';

  @override
  String get errorServerError => '서버 처리에 실패했습니다. 나중에 다시 시도해 주세요.';

  @override
  String get errorNetworkError => '네트워크 오류입니다. 연결 상태를 확인해 주세요.';

  @override
  String get errorGeneric => '오류가 발생했습니다. 나중에 다시 시도해 주세요.';

  @override
  String get statusSubmitting => '작업 제출 중...';

  @override
  String get statusProcessing => '서버 처리 중...';

  @override
  String get statusCompleted => '처리 완료';

  @override
  String get downloadDialogTitle => '사진 다운로드';

  @override
  String downloadProgress(int completed, int total) {
    return '$completed / $total';
  }

  @override
  String get downloadStatusDownloading => '다운로드 중...';

  @override
  String get downloadStatusCompleted => '다운로드 완료';

  @override
  String downloadFailedCount(int count) {
    return '$count장 다운로드 실패';
  }

  @override
  String galleryTitle(int count) {
    return '사진 보기 ($count)';
  }

  @override
  String get galleryDeselectMode => '선택 해제';

  @override
  String get gallerySelectMode => '선택 모드';

  @override
  String get gallerySelectAll => '전체 선택';

  @override
  String get gallerySaveSelected => '선택 항목 저장';

  @override
  String get gallerySaveAll => '전체 저장';

  @override
  String get galleryEmpty => '사진 없음';

  @override
  String get gallerySaving => '저장 중...';

  @override
  String get gallerySaveToGalleryFailed => '갤러리에 저장 실패';

  @override
  String detailPhotoCounter(int current, int total) {
    return '$current / $total';
  }

  @override
  String get detailFileInfo => '파일 정보';

  @override
  String get detailFileSize => '파일 크기';

  @override
  String get detailDimensions => '사진 크기';

  @override
  String whatsNewTitle(String version) {
    return 'v$version 새로운 기능';
  }

  @override
  String get whatsNewOnboardingTitle => '환영합니다';

  @override
  String get whatsNewDismissButton => '확인';

  @override
  String get whatsNewCloseButton => '닫기';

  @override
  String get settingsSectionAppIcon => '앱 아이콘';

  @override
  String get settingsAppIconSheetTitle => '앱 아이콘 선택';

  @override
  String get settingsAppIconStyleScroll => '스크롤 보기';

  @override
  String get settingsAppIconStyleSheet => '그리드 보기';

  @override
  String get settingsAppIconDefault => '기본';

  @override
  String get settingsAppIconNew => '새 버전';
}
