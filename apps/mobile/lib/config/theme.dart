import 'package:flutter/material.dart';

/// 應用程式的 Material 3 主題配置。
///
/// 以單一種子色彩 [_seedColor] 為基礎，自動產生亮色與暗色兩套完整配色方案。
/// 使用 `abstract final class` 確保此類別不可被實例化或繼承。
abstract final class AppTheme {
  /// 種子色彩（藍色系 #1565C0），Material 3 會根據此顏色自動衍生完整配色。
  static const Color _seedColor = Color(0xFF1565C0);

  /// CJK 字型 fallback 清單，確保所有使用者的中 / 日 / 韓文字都能正常顯示；
  /// 當裝置不含優先的字型時 Flutter engine 會自動 skip 到下一個 fallback。
  static const List<String> _fontFamilyFallback = [
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
      fontFamilyFallback: _fontFamilyFallback,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _seedColor,
        brightness: Brightness.dark,
      ),
    );
  }
}
