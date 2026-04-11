import 'package:flutter/services.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../ui/core/app_error.dart';

part 'photo_service.g.dart';

/// PhotoService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳 [PhotoService] 實例。
@Riverpod(keepAlive: true)
PhotoService photoService(Ref ref) => PhotoService();

/// 系統相簿存取服務，透過 MethodChannel 呼叫原生 API 儲存照片。
///
/// iOS 使用 PhotoKit `PHAssetCreationRequest.addResource(fileURL:)` 直接寫入，
/// Android 使用 MediaStore + FileInputStream 直接複製，
/// 兩者皆不轉碼，保留原始編碼與檔案大小。
class PhotoService {
  /// 與原生平台（iOS / Android）溝通的 MethodChannel 通道名稱。
  static const _channel = MethodChannel(
    'com.leoho.naverBlogImageDownloader/gallery',
  );

  /// 將指定路徑的圖片檔案儲存至系統相簿。
  ///
  /// - [filePath]：本機圖片檔案的絕對路徑。
  /// - [totalCount]：本次批次的照片總數，用於原生端判斷是否需要批次優化，預設為 1。
  ///
  /// 透過原生 API 直接寫入檔案，不經過 UIImage 或其他轉碼處理，
  /// 保留原始編碼與大小。iOS 會自動指派 IMG_xxxx 格式的檔名。
  /// 失敗時拋出 [AppError]（type: [AppErrorType.gallery]）。
  Future<void> saveToGallery(String filePath, {int totalCount = 1}) async {
    try {
      await _channel.invokeMethod<bool>('saveToGallery', {
        'filePath': filePath,
        'totalCount': totalCount,
      });
    } on PlatformException catch (e) {
      throw AppError(
        type: AppErrorType.gallery,
        message: e.message ?? '儲存至相簿失敗',
      );
    }
  }

  /// 請求相簿存取權限。
  ///
  /// 回傳 `true` 表示使用者已授權相簿存取；授權失敗或發生例外時回傳 `false`。
  Future<bool> requestPermission() async {
    try {
      final result = await _channel.invokeMethod<bool>('requestPermission');
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }
}
