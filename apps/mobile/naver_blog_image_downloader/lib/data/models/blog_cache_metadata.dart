/// 部落格照片下載的快取後設資料。
///
/// 記錄某次下載操作的摘要資訊，包含部落格來源、照片數量、
/// 下載時間以及是否已儲存至裝置相簿等狀態，用於快取管理與歷史紀錄。
class BlogCacheMetadata {
  /// 建立 [BlogCacheMetadata] 實例。
  ///
  /// - [blogId]：部落格的唯一識別碼。
  /// - [blogUrl]：部落格的網址。
  /// - [photoCount]：該部落格中下載的照片數量。
  /// - [downloadedAt]：下載完成的時間戳記。
  /// - [isSavedToGallery]：是否已將照片儲存至裝置相簿。
  /// - [filenames]：所有已下載照片的檔案名稱清單。
  const BlogCacheMetadata({
    required this.blogId,
    required this.blogUrl,
    required this.photoCount,
    required this.downloadedAt,
    required this.isSavedToGallery,
    required this.filenames,
  });

  /// 部落格的唯一識別碼。
  final String blogId;

  /// 部落格的網址。
  final String blogUrl;

  /// 該部落格中下載的照片數量。
  final int photoCount;

  /// 下載完成的時間戳記。
  final DateTime downloadedAt;

  /// 是否已將照片儲存至裝置相簿。
  final bool isSavedToGallery;

  /// 所有已下載照片的檔案名稱清單。
  final List<String> filenames;

  /// 複製一份 [BlogCacheMetadata]，並可選擇性地覆寫 [isSavedToGallery]。
  ///
  /// - [isSavedToGallery]：若提供則覆寫原值，否則保留現有值。
  ///
  /// 回傳新的 [BlogCacheMetadata] 實例。
  BlogCacheMetadata copyWith({bool? isSavedToGallery}) => BlogCacheMetadata(
    blogId: blogId,
    blogUrl: blogUrl,
    photoCount: photoCount,
    downloadedAt: downloadedAt,
    isSavedToGallery: isSavedToGallery ?? this.isSavedToGallery,
    filenames: filenames,
  );

  /// 將此實例序列化為 JSON 格式的 [Map]。
  ///
  /// 回傳包含所有欄位的 `Map<String, dynamic>`。
  Map<String, dynamic> toJson() => {
    'blogId': blogId,
    'blogUrl': blogUrl,
    'photoCount': photoCount,
    'downloadedAt': downloadedAt.toIso8601String(),
    'isSavedToGallery': isSavedToGallery,
    'filenames': filenames,
  };

  /// 從 JSON 格式的 [Map] 反序列化為 [BlogCacheMetadata] 實例。
  ///
  /// - [json]：包含所有必要欄位的 JSON [Map]。
  ///
  /// 回傳對應的 [BlogCacheMetadata] 實例。
  factory BlogCacheMetadata.fromJson(Map<String, dynamic> json) =>
      BlogCacheMetadata(
        blogId: json['blogId'] as String,
        blogUrl: json['blogUrl'] as String,
        photoCount: json['photoCount'] as int,
        downloadedAt: DateTime.parse(json['downloadedAt'] as String),
        isSavedToGallery: json['isSavedToGallery'] as bool,
        filenames: List<String>.from(json['filenames'] as List),
      );
}
