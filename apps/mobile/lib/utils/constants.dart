/// 應用程式共用常數。
///
/// 集中定義應用程式中多處使用的常數值，避免硬編碼散落各處。
/// 使用 `abstract final class` 確保不可被實例化或繼承。
abstract final class Constants {
  /// 應用程式名稱。
  static const String appName = 'Naver Blog 照片下載器';
}
