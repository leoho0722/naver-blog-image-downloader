import 'package:flutter/material.dart';

import '../config/app_icon.dart';
import '../config/app_settings_keys.dart';
import '../config/supported_locale.dart';

/// screenshot mode 支援的主題列舉。
enum ScreenshotTheme {
  /// 亮色主題。
  light,

  /// 暗色主題。
  dark;

  /// 對應的 [ThemeMode]。
  ThemeMode get themeMode =>
      this == ScreenshotTheme.dark ? ThemeMode.dark : ThemeMode.light;
}

/// screenshot mode 的啟動設定。
class ScreenshotConfig {
  /// 建立 [ScreenshotConfig]。
  ///
  /// - [scenarioId]：要渲染的截圖場景識別碼。
  /// - [locale]：要套用的語系。
  /// - [theme]：要套用的主題。
  const ScreenshotConfig({
    required this.scenarioId,
    required this.locale,
    required this.theme,
  });

  /// 從原始字串建立 [ScreenshotConfig]。
  ///
  /// - [scenarioId]：截圖場景識別碼。
  /// - [localeCode]：語系代碼，如 `zhTW`、`en`。
  /// - [themeCode]：主題代碼，如 `light`、`dark`。
  ///
  /// 回傳解析完成的 [ScreenshotConfig]；未知值會 fallback 至預設值。
  factory ScreenshotConfig.fromRaw({
    required String scenarioId,
    required String localeCode,
    required String themeCode,
  }) {
    var locale = SupportedLocale.zhTW;
    for (final candidate in SupportedLocale.values) {
      if (candidate.name == localeCode) {
        locale = candidate;
        break;
      }
    }

    var theme = ScreenshotTheme.light;
    for (final candidate in ScreenshotTheme.values) {
      if (candidate.name == themeCode) {
        theme = candidate;
        break;
      }
    }

    return ScreenshotConfig(
      scenarioId: scenarioId,
      locale: locale,
      theme: theme,
    );
  }

  /// 要渲染的截圖場景識別碼。
  final String scenarioId;

  /// 要套用的語系。
  final SupportedLocale locale;

  /// 要套用的主題。
  final ScreenshotTheme theme;

  /// screenshot mode 專用的 SharedPreferences 初始資料。
  ///
  /// 回傳固定主題、語系與 App 圖示偏好的初始值，避免畫面受先前本機資料影響。
  /// 由 `test/screenshot/golden_test.dart` 透過 `SharedPreferences.setMockInitialValues`
  /// 注入。
  Map<String, Object> get sharedPreferencesSeed => {
    AppSettingsKeys.themeMode: theme.themeMode.name,
    AppSettingsKeys.locale: locale.name,
    AppSettingsKeys.appIcon: AppIcon.defaultIcon.nativeKey,
  };
}
