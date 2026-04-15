import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';

import '../config/app_icon.dart';
import '../data/services/photo_viewer_service.dart';
import '../ui/blog_input/view_model/blog_input_view_model.dart';
import '../ui/blog_input/widgets/blog_input_view.dart';
import '../ui/core/view_model/app_settings_view_model.dart';
import '../ui/download/view_model/download_view_model.dart';
import '../ui/download/widgets/download_view.dart';
import '../ui/photo_gallery/view_model/photo_gallery_view_model.dart';
import '../ui/photo_gallery/widgets/photo_gallery_view.dart';
import '../ui/settings/view_model/settings_view_model.dart';
import '../ui/settings/widgets/settings_view.dart';
import '../ui/whats_new/widgets/whats_new_dialog.dart';
import 'screenshot_mock_data.dart';
import 'widgets/screenshot_scaffold.dart';

/// screenshot 場景 builder 的函式型別。
typedef ScreenshotScenarioBuilder = Widget Function();

/// 所有 screenshot 場景對應的 builder。
final Map<String, ScreenshotScenarioBuilder> screenshotScenarioBuilders = {
  'blog_input_empty': buildBlogInputEmptyScenario,
  'blog_input_with_url': buildBlogInputWithUrlScenario,
  'blog_input_loading': buildBlogInputLoadingScenario,
  'photo_gallery_grid': buildPhotoGalleryGridScenario,
  'photo_gallery_select': buildPhotoGallerySelectScenario,
  'photo_detail_native': buildPhotoDetailNativeScenario,
  'settings_default': buildSettingsDefaultScenario,
  'download_in_progress': buildDownloadInProgressScenario,
  'download_completed': buildDownloadCompletedScenario,
  'whats_new_onboarding': buildWhatsNewOnboardingScenario,
  'whats_new_update': buildWhatsNewUpdateScenario,
};

/// 建立 Blog 輸入頁空白狀態情境。
Widget buildBlogInputEmptyScenario() {
  return ProviderScope(
    overrides: [
      blogInputViewModelProvider.overrideWith(
        () => FixedBlogInputViewModel(const BlogInputState()),
      ),
    ],
    child: const ScreenshotScaffold(child: BlogInputView()),
  );
}

/// 建立 Blog 輸入頁帶網址狀態情境。
Widget buildBlogInputWithUrlScenario() {
  return ProviderScope(
    overrides: [
      blogInputViewModelProvider.overrideWith(
        () => FixedBlogInputViewModel(
          const BlogInputState(blogUrl: screenshotBlogUrl),
        ),
      ),
    ],
    child: const ScreenshotScaffold(child: BlogInputView()),
  );
}

/// 建立 Blog 輸入頁載入中情境。
Widget buildBlogInputLoadingScenario() {
  return ProviderScope(
    overrides: [
      blogInputViewModelProvider.overrideWith(
        () => FixedBlogInputViewModel(
          const BlogInputState(
            blogUrl: screenshotBlogUrl,
            fetchResult: AsyncLoading(),
            loadingPhase: FetchLoadingPhase.processing,
          ),
        ),
      ),
    ],
    child: const ScreenshotScaffold(child: BlogInputView()),
  );
}

/// 建立照片列表一般瀏覽情境。
Widget buildPhotoGalleryGridScenario() => const _PhotoGalleryScenario();

/// 建立照片列表選取模式情境。
Widget buildPhotoGallerySelectScenario() =>
    const _PhotoGalleryScenario(isSelectMode: true);

/// 建立原生 PhotoViewer 情境。
Widget buildPhotoDetailNativeScenario() => const _NativePhotoViewerScenario();

/// 建立設定頁情境。
Widget buildSettingsDefaultScenario() {
  return ProviderScope(
    overrides: [
      settingsViewModelProvider.overrideWith(
        () => FixedSettingsViewModel(
          SettingsData(
            cacheSizeBytes: 52 * 1024 * 1024,
            cachedBlogs: screenshotCachedBlogs,
          ),
        ),
      ),
    ],
    child: const ScreenshotScaffold(child: SettingsView()),
  );
}

/// 建立下載中情境。
Widget buildDownloadInProgressScenario() {
  return _ScreenshotModalSurface(
    child: Builder(
      builder: (context) {
        final l10n = AppLocalizations.of(context);
        return AlertDialog(
          title: Text(l10n.downloadDialogTitle),
          content: const DownloadDialogContent(
            state: DownloadViewModelState(
              completed: 5,
              total: 9,
              downloadResult: AsyncLoading(),
            ),
          ),
        );
      },
    ),
  );
}

/// 建立下載完成情境。
Widget buildDownloadCompletedScenario() {
  return _ScreenshotModalSurface(
    child: Builder(
      builder: (context) {
        final l10n = AppLocalizations.of(context);
        return AlertDialog(
          title: Text(l10n.downloadDialogTitle),
          content: const DownloadDialogContent(
            state: DownloadViewModelState(
              completed: 9,
              total: 9,
              downloadResult: AsyncData(
                DownloadBatchResult(successCount: 9, failedPhotos: []),
              ),
            ),
          ),
        );
      },
    ),
  );
}

/// 建立首次安裝引導情境。
Widget buildWhatsNewOnboardingScenario() {
  return _ScreenshotModalSurface(
    child: Builder(
      builder: (context) {
        final l10n = AppLocalizations.of(context);
        return WhatsNewTextDialog(
          title: l10n.whatsNewOnboardingTitle,
          entry: screenshotOnboardingEntry,
          dismissLabel: l10n.whatsNewDismissButton,
          onDismiss: () {},
        );
      },
    ),
  );
}

/// 建立版本更新說明情境。
Widget buildWhatsNewUpdateScenario() {
  return _ScreenshotModalSurface(
    child: Builder(
      builder: (context) {
        final l10n = AppLocalizations.of(context);
        return WhatsNewTextDialog(
          title: l10n.whatsNewTitle('1.6.0'),
          entry: screenshotUpdateEntry,
          dismissLabel: l10n.whatsNewDismissButton,
          onDismiss: () {},
        );
      },
    ),
  );
}

/// 固定回傳指定狀態的 BlogInputViewModel。
class FixedBlogInputViewModel extends BlogInputViewModel {
  /// 建立 [FixedBlogInputViewModel]。
  ///
  /// - [fixedState]：要固定回傳的狀態。
  FixedBlogInputViewModel(this.fixedState);

  /// 要固定回傳的狀態。
  final BlogInputState fixedState;

  /// 回傳固定狀態。
  @override
  BlogInputState build() => fixedState;
}

/// 固定回傳指定狀態的 PhotoGalleryViewModel。
class FixedPhotoGalleryViewModel extends PhotoGalleryViewModel {
  /// 建立 [FixedPhotoGalleryViewModel]。
  ///
  /// - [fixedState]：要固定回傳的狀態。
  FixedPhotoGalleryViewModel(this.fixedState);

  /// 要固定回傳的狀態。
  final PhotoGalleryState fixedState;

  /// 回傳固定狀態。
  @override
  PhotoGalleryState build() => fixedState;
}

/// 固定回傳指定狀態的 SettingsViewModel。
class FixedSettingsViewModel extends SettingsViewModel {
  /// 建立 [FixedSettingsViewModel]。
  ///
  /// - [fixedData]：要固定回傳的資料。
  FixedSettingsViewModel(this.fixedData);

  /// 要固定回傳的資料。
  final SettingsData fixedData;

  /// 回傳固定資料。
  @override
  Future<SettingsData> build() async => fixedData;
}

/// 固定回傳指定狀態的 AppSettingsViewModel。
class FixedAppSettingsViewModel extends AppSettingsViewModel {
  /// 建立 [FixedAppSettingsViewModel]。
  ///
  /// - [fixedState]：要固定回傳的狀態。
  FixedAppSettingsViewModel(this.fixedState);

  /// 要固定回傳的狀態。
  final AppSettingsState fixedState;

  /// 回傳固定狀態。
  @override
  Future<AppSettingsState> build() async => fixedState;
}

/// 包裝 Dialog 類型截圖情境的通用底板。
class _ScreenshotModalSurface extends StatelessWidget {
  /// 建立 [_ScreenshotModalSurface]。
  ///
  /// - [child]：實際要顯示的對話框內容。
  const _ScreenshotModalSurface({required this.child});

  /// 實際要顯示的對話框內容。
  final Widget child;

  /// 建構帶有半透明遮罩的截圖頁面。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳模擬 modal barrier 的畫面。
  @override
  Widget build(BuildContext context) {
    return ScreenshotScaffold(
      child: Scaffold(
        backgroundColor: Colors.black54,
        body: SafeArea(child: Center(child: child)),
      ),
    );
  }
}

/// 準備完成的照片列表截圖資料。
class _PreparedGalleryData {
  /// 建立 [_PreparedGalleryData]。
  ///
  /// - [cachedFiles]：照片 ID 與暫存檔案的對照表。
  const _PreparedGalleryData({required this.cachedFiles});

  /// 照片 ID 與暫存檔案的對照表。
  final Map<String, File?> cachedFiles;
}

/// 照片列表截圖情境。
class _PhotoGalleryScenario extends StatefulWidget {
  /// 建立 [_PhotoGalleryScenario]。
  ///
  /// - [isSelectMode]：是否顯示選取模式。
  const _PhotoGalleryScenario({this.isSelectMode = false});

  /// 是否顯示選取模式。
  final bool isSelectMode;

  /// 建立 [_PhotoGalleryScenario] 對應的狀態物件。
  ///
  /// 回傳 [_PhotoGalleryScenarioState]。
  @override
  State<_PhotoGalleryScenario> createState() => _PhotoGalleryScenarioState();
}

/// [_PhotoGalleryScenario] 的狀態管理類。
class _PhotoGalleryScenarioState extends State<_PhotoGalleryScenario> {
  /// 非同步準備後的暫存檔案資料。
  late final Future<_PreparedGalleryData> _preparedData;

  /// 初始化畫面需要的暫存圖片檔案。
  @override
  void initState() {
    super.initState();
    _preparedData = _prepareGalleryData();
  }

  /// 建構照片列表截圖情境。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳帶有固定狀態 override 的 [PhotoGalleryView]。
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_PreparedGalleryData>(
      future: _preparedData,
      builder: (context, snapshot) {
        final data = snapshot.data;
        if (data == null) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final state = PhotoGalleryState(
          photos: screenshotPhotos,
          blogId: screenshotBlogId,
          cachedFiles: data.cachedFiles,
          selectedIds: widget.isSelectMode
              ? {'photo-01', 'photo-03', 'photo-05'}
              : const {},
          isSelectMode: widget.isSelectMode,
        );

        return ProviderScope(
          overrides: [
            photoGalleryViewModelProvider.overrideWith(
              () => FixedPhotoGalleryViewModel(state),
            ),
          ],
          child: const ScreenshotScaffold(
            child: PhotoGalleryView(blogId: screenshotBlogId),
          ),
        );
      },
    );
  }
}

/// 原生 PhotoViewer 截圖情境。
class _NativePhotoViewerScenario extends ConsumerStatefulWidget {
  /// 建立 [_NativePhotoViewerScenario]。
  const _NativePhotoViewerScenario();

  /// 建立 [_NativePhotoViewerScenario] 對應的狀態物件。
  ///
  /// 回傳 [_NativePhotoViewerScenarioState]。
  @override
  ConsumerState<_NativePhotoViewerScenario> createState() =>
      _NativePhotoViewerScenarioState();
}

/// [_NativePhotoViewerScenario] 的狀態管理類。
class _NativePhotoViewerScenarioState
    extends ConsumerState<_NativePhotoViewerScenario> {
  /// 原生 viewer 是否已啟動。
  bool _isLaunched = false;

  /// 準備給原生 viewer 使用的圖片檔案。
  File? _preparedFile;

  /// 若啟動失敗時要顯示的錯誤訊息。
  String? _errorMessage;

  /// 快取的 [PhotoViewerService] 引用，供 [dispose] 使用。
  PhotoViewerService? _photoViewerService;

  /// 初始化情境時準備暫存圖片檔案並啟動原生 viewer。
  @override
  void initState() {
    super.initState();
    unawaited(_prepareAndLaunch());
  }

  /// 釋放原生回呼處理器。
  @override
  void dispose() {
    _photoViewerService?.removeCallbackHandler();
    super.dispose();
  }

  /// 建構原生 viewer 啟動前的背景頁。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳黑底佔位畫面；真正可截圖目標會由原生 viewer 提供。
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _errorMessage == null
          ? const SizedBox.expand()
          : Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
    );
  }

  /// 準備檔案並在下一幀啟動原生 PhotoViewer。
  Future<void> _prepareAndLaunch() async {
    try {
      final file = await _writeAssetToTemporaryFile(
        assetPath: AppIcon.defaultIcon.previewAsset,
        filename: 'screenshot_photo_viewer.png',
      );
      if (!mounted) return;
      setState(() {
        _preparedFile = file;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        unawaited(_launchNativeViewer());
      });
    } on Exception catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = '原生檢視器截圖檔案準備失敗：$error';
      });
    }
  }

  /// 啟動原生 PhotoViewer。
  Future<void> _launchNativeViewer() async {
    if (!mounted || _isLaunched || _preparedFile == null) return;
    _isLaunched = true;

    final service = ref.read(photoViewerServiceProvider);
    _photoViewerService = service;
    service.setCallbackHandler(onSaveCompleted: (_) {}, onDismissed: (_) {});

    final l10n = AppLocalizations.of(context);
    final colorScheme = Theme.of(context).colorScheme;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    try {
      await service.openViewer(
        filePaths: [_preparedFile!.path],
        initialIndex: 0,
        blogId: screenshotBlogId,
        localizedStrings: {
          'fileInfo': l10n.detailFileInfo,
          'fileSize': l10n.detailFileSize,
          'dimensions': l10n.detailDimensions,
        },
        isDarkMode: isDarkMode,
        themeColors: {
          'surfaceContainerHigh': colorScheme.surfaceContainerHigh.toARGB32(),
          'onSurface': colorScheme.onSurface.toARGB32(),
          'onSurfaceVariant': colorScheme.onSurfaceVariant.toARGB32(),
          'primary': colorScheme.primary.toARGB32(),
          'surface': colorScheme.surface.toARGB32(),
        },
      );
    } on Exception catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = '原生檢視器啟動失敗：$error';
      });
    }
  }
}

/// 準備照片列表截圖所需的暫存圖片檔案。
///
/// 所有照片共用同一個暫存目錄，避免每張圖各自 `createTemp` 產生 9 個孤兒目錄。
///
/// 回傳包含所有照片暫存檔案的 [_PreparedGalleryData]。
Future<_PreparedGalleryData> _prepareGalleryData() async {
  final directory = await Directory.systemTemp.createTemp('nbid_screenshot_');
  final cachedFiles = <String, File?>{};

  for (var index = 0; index < screenshotPhotos.length; index++) {
    final photo = screenshotPhotos[index];
    final assetPath = index.isEven
        ? AppIcon.defaultIcon.previewAsset
        : AppIcon.newIcon.previewAsset;
    final file = await _writeAssetToTemporaryFile(
      assetPath: assetPath,
      filename: photo.filename,
      directory: directory,
    );
    cachedFiles[photo.id] = file;
  }

  return _PreparedGalleryData(cachedFiles: cachedFiles);
}

/// 將 asset 寫入系統暫存目錄，回傳對應的 [File]。
///
/// - [assetPath]：要複製的 asset 路徑。
/// - [filename]：寫入暫存目錄時使用的檔名。
/// - [directory]：可選的暫存目錄，若未提供則自動建立一個新的暫存目錄。
///
/// 回傳寫入完成的 [File]。
Future<File> _writeAssetToTemporaryFile({
  required String assetPath,
  required String filename,
  Directory? directory,
}) async {
  final byteData = await rootBundle.load(assetPath);
  final targetDir =
      directory ?? await Directory.systemTemp.createTemp('nbid_screenshot_');
  final file = File('${targetDir.path}/$filename');
  await file.writeAsBytes(
    byteData.buffer.asUint8List(byteData.offsetInBytes, byteData.lengthInBytes),
  );
  return file;
}
