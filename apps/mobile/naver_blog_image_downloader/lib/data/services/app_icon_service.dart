import 'package:flutter/services.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../ui/core/app_error.dart';

part 'app_icon_service.g.dart';

/// AppIconService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳 [AppIconService] 實例。
@Riverpod(keepAlive: true)
AppIconService appIconService(Ref ref) => AppIconService();

/// App 圖示切換服務，透過 MethodChannel 呼叫原生 API 變更應用程式圖示。
///
/// iOS 使用 `UIApplication.setAlternateIconName(_:)` 切換 xcassets 中的 icon set，
/// Android 使用 `PackageManager.setComponentEnabledSetting` 啟停 activity-alias。
class AppIconService {
  /// 與原生平台（iOS / Android）溝通的 MethodChannel 通道。
  static const _channel = MethodChannel(
    'com.leoho.naverBlogImageDownloader/appIcon',
  );

  /// 切換應用程式圖示至指定的圖示。
  ///
  /// [iconName] 為目標圖示的識別名稱（`"classic"` 或 `"new"`）。
  /// 失敗時拋出 [AppError]（type: [AppErrorType.appIcon]）。
  Future<void> setAppIcon(String iconName) async {
    try {
      await _channel.invokeMethod<void>('setAppIcon', {'iconName': iconName});
    } on PlatformException catch (e) {
      throw AppError(
        type: AppErrorType.appIcon,
        message: e.message ?? '切換 App 圖示失敗',
      );
    }
  }

  /// 取得目前使用中的 App 圖示名稱。
  ///
  /// 回傳圖示名稱字串（`"classic"` 或 `"new"`），失敗時回傳 `"classic"` 作為 fallback。
  Future<String> getCurrentIcon() async {
    try {
      final result = await _channel.invokeMethod<String>('getCurrentIcon');
      return result ?? 'default';
    } on PlatformException {
      return 'default';
    }
  }
}
