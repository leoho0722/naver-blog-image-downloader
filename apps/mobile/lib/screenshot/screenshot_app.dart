import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';

import '../config/theme.dart';
import '../data/repositories/log_repository.dart';
import '../ui/core/view_model/app_settings_view_model.dart';
import 'screenshot_config.dart';
import 'screenshot_scenarios.dart';

/// screenshot mode 的根 Widget。
class ScreenshotApp extends StatelessWidget {
  /// 建立 [ScreenshotApp]。
  ///
  /// - [config]：本次截圖模式的設定。
  const ScreenshotApp({super.key, required this.config});

  /// 本次截圖模式的設定。
  final ScreenshotConfig config;

  /// 建構 screenshot mode 的 [MaterialApp]。
  ///
  /// [context] 為目前的 [BuildContext]。
  ///
  /// 回傳關閉 debug banner 的 [MaterialApp]，並套用固定語系與主題。
  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      overrides: [
        appSettingsViewModelProvider.overrideWith(
          () => FixedAppSettingsViewModel(
            AppSettingsState(
              themeMode: config.theme.themeMode,
              locale: config.locale,
            ),
          ),
        ),
        logRepositoryProvider.overrideWith((ref) => LogRepository.noop()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: config.theme.themeMode,
        locale: config.locale.locale,
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        home: _buildHome(),
      ),
    );
  }

  /// 根據 [config.scenarioId] 解析要顯示的畫面。
  ///
  /// 回傳對應的截圖場景 Widget；未知場景時回傳**不帶** `screenshot_ready`
  /// 識別碼的錯誤畫面，避免 Maestro 把錯誤畫面當成合法素材存檔。
  Widget _buildHome() {
    final builder = screenshotScenarioBuilders[config.scenarioId];
    if (builder != null) {
      return builder();
    }

    // 故意不包 ScreenshotScaffold，讓 Maestro 等不到 ready marker 超時失敗，
    // 以便盡早發現 JSON manifest 與 builder 註冊不一致。
    debugPrint('❌ 未知截圖情境：${config.scenarioId}');
    return Scaffold(
      backgroundColor: Colors.red,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            '未知截圖情境：${config.scenarioId}\n\n'
            '請檢查 scripts/screenshot_matrix.json 與 '
            'lib/screenshot/screenshot_scenarios.dart 是否一致。',
            style: const TextStyle(color: Colors.white, fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
