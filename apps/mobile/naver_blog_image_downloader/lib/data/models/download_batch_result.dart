import 'photo_entity.dart';

/// 一批照片下載操作的結果摘要。
///
/// 記錄成功、失敗與略過的數量，以及失敗的照片清單和錯誤訊息，
/// 供 UI 層顯示下載進度或結果報告使用。
class DownloadBatchResult {
  /// 建立 [DownloadBatchResult] 實例。
  ///
  /// - [successCount]：成功下載的照片數量。
  /// - [failedPhotos]：下載失敗的照片實體清單。
  /// - [skippedCount]：因已存在而略過下載的照片數量，預設為 `0`。
  /// - [errors]：下載過程中產生的錯誤訊息清單，預設為空清單。
  const DownloadBatchResult({
    required this.successCount,
    required this.failedPhotos,
    this.skippedCount = 0,
    this.errors = const [],
  });

  /// 成功下載的照片數量。
  final int successCount;

  /// 下載失敗的照片實體清單。
  final List<PhotoEntity> failedPhotos;

  /// 因已存在而略過下載的照片數量。
  final int skippedCount;

  /// 下載過程中產生的錯誤訊息清單。
  final List<String> errors;

  /// 下載失敗的照片數量。
  ///
  /// 回傳 [failedPhotos] 的長度。
  int get failureCount => failedPhotos.length;

  /// 是否全部照片皆下載成功。
  ///
  /// 回傳 `true` 表示 [failedPhotos] 為空（無失敗項目）。
  bool get isAllSuccessful => failedPhotos.isEmpty;
}
