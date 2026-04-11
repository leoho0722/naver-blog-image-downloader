import 'package:flutter/services.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'photo_viewer_service.g.dart';

/// PhotoViewerService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳 [PhotoViewerService] 實例。
@Riverpod(keepAlive: true)
PhotoViewerService photoViewerService(Ref ref) => PhotoViewerService();

/// 原生圖片檢視器橋接服務，透過 MethodChannel 啟動原生全螢幕檢視器
/// 並接收原生端回傳的事件（儲存完成、檢視器關閉）。
///
/// 遵循 [PhotoService] 的設計模式，以 `@Riverpod(keepAlive: true)` 單例註冊。
class PhotoViewerService {
  /// 與原生平台溝通的 MethodChannel 通道。
  static const _channel = MethodChannel(
    'com.leoho.naverBlogImageDownloader/photoViewer',
  );

  /// 儲存完成的回呼函式，接收 blogId。
  void Function(String blogId)? _onSaveCompleted;

  /// 檢視器關閉的回呼函式，接收最後顯示的照片索引。
  void Function(int lastIndex)? _onDismissed;

  /// 註冊原生端回呼處理器。
  ///
  /// - [onSaveCompleted]：原生端儲存照片成功時觸發，帶入 blogId。
  /// - [onDismissed]：使用者關閉原生檢視器時觸發，帶入最後的照片索引。
  void setCallbackHandler({
    required void Function(String blogId) onSaveCompleted,
    required void Function(int lastIndex) onDismissed,
  }) {
    _onSaveCompleted = onSaveCompleted;
    _onDismissed = onDismissed;

    _channel.setMethodCallHandler((call) async {
      switch (call.method) {
        case 'onSaveCompleted':
          final args = call.arguments as Map<Object?, Object?>;
          final blogId = args['blogId'] as String? ?? '';
          _onSaveCompleted?.call(blogId);
          break;
        case 'onDismissed':
          final args = call.arguments as Map<Object?, Object?>;
          final lastIndex = args['lastIndex'] as int? ?? 0;
          _onDismissed?.call(lastIndex);
          break;
      }
    });
  }

  /// 移除原生端回呼處理器。
  void removeCallbackHandler() {
    _onSaveCompleted = null;
    _onDismissed = null;
    _channel.setMethodCallHandler(null);
  }

  /// 啟動原生全螢幕圖片檢視器。
  ///
  /// - [filePaths]：照片檔案的本機絕對路徑清單。
  /// - [initialIndex]：檢視器開啟時要顯示的照片索引。
  /// - [blogId]：照片所屬的 Blog 識別碼。
  /// - [localizedStrings]：已翻譯的 UI 字串，包含 `fileInfo`、`fileSize`、`dimensions`。
  /// - [isDarkMode]：是否為深色模式。
  /// - [themeColors]：Material 3 色彩的 ARGB 整數值 Map，包含
  ///   `surfaceContainerHigh`、`onSurface`、`onSurfaceVariant`、`primary`、`surface`。
  ///
  /// 失敗時拋出 [PlatformException]。
  Future<void> openViewer({
    required List<String> filePaths,
    required int initialIndex,
    required String blogId,
    required Map<String, String> localizedStrings,
    required bool isDarkMode,
    required Map<String, int> themeColors,
  }) async {
    await _channel.invokeMethod<void>('openViewer', {
      'filePaths': filePaths,
      'initialIndex': initialIndex,
      'blogId': blogId,
      'localizedStrings': localizedStrings,
      'isDarkMode': isDarkMode,
      'themeColors': themeColors,
    });
  }
}
