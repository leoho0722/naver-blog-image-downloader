import 'package:flutter/material.dart';

/// 應用程式的 Material 3 主題配置。
///
/// 以單一種子色彩 [_seedColor] 為基礎，自動產生亮色與暗色兩套完整配色方案。
/// 使用 `abstract final class` 確保此類別不可被實例化或繼承。
abstract final class AppTheme {
  /// 種子色彩（藍色系 #1565C0），Material 3 會根據此顏色自動衍生完整配色。
  static const Color _seedColor = Color(0xFF1565C0);

  /// 字型 fallback 清單，確保中 / 日 / 韓 / 英數字在所有裝置上都能正常顯示，
  /// 同時避免 screenshot / golden 測試在缺字型的環境下出現方格。
  ///
  /// `Helvetica` 放在最前面處理 Latin 字元（iOS 系統內建；Android 未安裝時 Flutter
  /// 會自動 skip），後面接 CJK 字型按語系優先序排列。
  static const List<String> _fontFamilyFallback = [
    'Helvetica',
    'PingFang TC',
    'Hiragino Sans GB',
    'Apple SD Gothic Neo',
    'Noto Sans CJK TC',
    'Noto Sans CJK JP',
    'Noto Sans CJK KR',
    'Noto Sans JP',
    'Noto Sans KR',
    'sans-serif',
  ];

  /// 亮色主題，適用於一般日間使用情境。
  ///
  /// 回傳以 [_seedColor] 為基礎產生的亮色 [ThemeData]。
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Helvetica',
      fontFamilyFallback: _fontFamilyFallback,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _seedColor,
        brightness: Brightness.light,
      ),
    );
  }

  /// 暗色主題，適用於夜間或低光源使用情境。
  ///
  /// 回傳以 [_seedColor] 為基礎產生的暗色 [ThemeData]。
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Helvetica',
      fontFamilyFallback: _fontFamilyFallback,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _seedColor,
        brightness: Brightness.dark,
      ),
    );
  }
}
