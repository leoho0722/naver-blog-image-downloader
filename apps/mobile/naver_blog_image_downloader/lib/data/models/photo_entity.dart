/// 表示一張從 Naver 部落格擷取到的照片實體。
///
/// 包含照片的唯一識別碼、下載網址與檔案名稱。
class PhotoEntity {
  /// 建立 [PhotoEntity] 實例。
  ///
  /// - [id]：照片的唯一識別碼。
  /// - [url]：照片的下載網址。
  /// - [filename]：照片的檔案名稱（含副檔名）。
  /// - [width]：照片寬度（像素），可為 `null`。
  /// - [height]：照片高度（像素），可為 `null`。
  const PhotoEntity({
    required this.id,
    required this.url,
    required this.filename,
    this.width,
    this.height,
  });

  /// 照片的唯一識別碼。
  final String id;

  /// 照片的下載網址。
  final String url;

  /// 照片的檔案名稱（含副檔名）。
  final String filename;

  /// 照片寬度（像素），若無法取得則為 `null`。
  final int? width;

  /// 照片高度（像素），若無法取得則為 `null`。
  final int? height;
}
