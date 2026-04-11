import 'photo_entity.dart';

/// 從部落格擷取照片清單的結果。
///
/// 封裝一次擷取操作所取得的 [PhotoEntity] 清單，
/// 並記錄該結果是否完全來自快取。
class FetchResult {
  /// 建立 [FetchResult] 實例。
  ///
  /// - [photos]：擷取到的照片實體清單。
  /// - [blogId]：部落格的唯一識別碼。
  /// - [blogUrl]：原始的 Blog 網址。
  /// - [isFullyCached]：此次結果是否完全來自本地快取。
  /// - [totalImages]：Lambda API 回傳的總照片數量，預設為 `0`。
  /// - [failureDownloads]：Lambda API 回傳的擷取失敗照片數量，預設為 `0`。
  /// - [fetchErrors]：Lambda API 回傳的擷取失敗錯誤訊息清單，預設為空清單。
  const FetchResult({
    required this.photos,
    required this.blogId,
    required this.blogUrl,
    required this.isFullyCached,
    this.totalImages = 0,
    this.failureDownloads = 0,
    this.fetchErrors = const [],
  });

  /// 擷取到的照片實體清單。
  final List<PhotoEntity> photos;

  /// 部落格的唯一識別碼。
  final String blogId;

  /// 原始的 Blog 網址。
  final String blogUrl;

  /// 此次結果是否完全來自本地快取，而非從遠端重新擷取。
  final bool isFullyCached;

  /// Lambda API 回傳的總照片數量。
  final int totalImages;

  /// Lambda API 回傳的擷取失敗照片數量。
  final int failureDownloads;

  /// Lambda API 回傳的擷取失敗錯誤訊息清單，無錯誤時為空清單。
  final List<String> fetchErrors;
}
