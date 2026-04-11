/// API 請求資料傳輸物件（DTO），透過 `action` 欄位區分操作類型。
///
/// 同一個 API endpoint 支援兩種操作：
/// - `download`：啟動非同步爬蟲任務
/// - `status`：查詢任務執行狀態
class PhotoDownloadRequest {
  /// 建立下載請求。
  ///
  /// - [blogUrl]：要下載照片的 Naver 部落格網址。
  const PhotoDownloadRequest.download({required this.blogUrl})
    : action = 'download',
      jobId = null;

  /// 建立狀態查詢請求。
  ///
  /// - [jobId]：要查詢狀態的任務識別碼。
  const PhotoDownloadRequest.status({required String this.jobId})
    : action = 'status',
      blogUrl = null;

  /// 操作類型：`download` 或 `status`。
  final String action;

  /// 要下載照片的 Naver 部落格網址（僅 `download` 操作使用）。
  final String? blogUrl;

  /// 任務識別碼（僅 `status` 操作使用）。
  final String? jobId;

  /// 將此請求序列化為 JSON 格式的 [Map]。
  ///
  /// 回傳包含 `action` 以及對應操作參數的 `Map<String, dynamic>`。
  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{'action': action};
    if (blogUrl != null) json['blog_url'] = blogUrl;
    if (jobId != null) json['job_id'] = jobId;
    return json;
  }
}
