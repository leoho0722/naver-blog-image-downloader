import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 應用程式的執行模式列舉。
enum AppRuntimeMode {
  /// 正常應用程式模式。
  normal,

  /// 截圖專用模式。
  screenshot,
}

/// 目前執行模式的 provider。
///
/// 預設為 [AppRuntimeMode.normal]，screenshot mode 會在根 [ProviderScope]
/// 以 override 方式改為 [AppRuntimeMode.screenshot]。
final appRuntimeModeProvider = Provider<AppRuntimeMode>(
  (ref) => AppRuntimeMode.normal,
);
