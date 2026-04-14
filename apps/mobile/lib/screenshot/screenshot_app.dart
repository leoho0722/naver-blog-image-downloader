import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';

import '../config/theme.dart';
import '../data/repositories/log_repository.dart';
import '../ui/core/view_model/app_settings_view_model.dart';
import 'screenshot_config.dart';
import 'screenshot_scenarios.dart';
import 'widgets/screenshot_scaffold.dart';

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
  /// 回傳對應的截圖場景 Widget；未知場景時回傳錯誤畫面。
  Widget _buildHome() {
    final builder = screenshotScenarioBuilders[config.scenarioId];
    if (builder != null) {
      return builder();
    }

    return ScreenshotScaffold(
      child: Scaffold(body: Center(child: Text('未知截圖情境：${config.scenarioId}'))),
    );
  }
}
