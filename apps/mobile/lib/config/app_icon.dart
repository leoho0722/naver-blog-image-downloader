/// 應用程式圖示選項列舉，定義可供使用者切換的 App 圖示。
///
/// 包含圖示的原生平台識別名稱與 Flutter 側預覽圖資源路徑。
enum AppIcon {
  /// 預設圖示。
  defaultIcon('default', 'assets/icons/icon_default.png'),

  /// 新版圖示。
  newIcon('new', 'assets/icons/icon_new.png');

  /// 建立 [AppIcon]。
  ///
  /// [nativeKey] 為原生平台辨識用的字串名稱，用於 MethodChannel 傳遞與 SharedPreferences 儲存。
  /// [previewAsset] 為 Flutter 側預覽圖片的 asset 路徑，用於設定頁面顯示。
  const AppIcon(this.nativeKey, this.previewAsset);

  /// 原生平台使用的圖示識別字串。
  ///
  /// iOS：`"classic"` 對應主圖示（`nil`）、`"new"` 對應 `"NewAppIcon"` icon set。
  /// Android：對應 activity-alias 的識別。
  final String nativeKey;

  /// Flutter 側預覽圖片的 asset 路徑，用於設定頁面中顯示圖示預覽。
  final String previewAsset;
}
