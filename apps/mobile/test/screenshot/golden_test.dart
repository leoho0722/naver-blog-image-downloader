import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:naver_blog_image_downloader/data/services/local_storage_service.dart';
import 'package:naver_blog_image_downloader/screenshot/app_runtime_mode.dart';
import 'package:naver_blog_image_downloader/screenshot/screenshot_app.dart';
import 'package:naver_blog_image_downloader/screenshot/screenshot_config.dart';
import 'package:naver_blog_image_downloader/screenshot/screenshot_scenario_definitions.dart';
import 'package:naver_blog_image_downloader/config/supported_locale.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// screenshot golden 的裝置寬度。
const double _goldenWidth = 1179;

/// screenshot golden 的裝置高度。
const double _goldenHeight = 2556;

/// 等待 screenshot app 完成必要的非同步初始化，但不等待無限動畫結束。
///
/// - [tester]：目前的 [WidgetTester]。
Future<void> _pumpScreenshotScenario(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 200));
  await tester.pump(const Duration(seconds: 1));
}

/// screenshot golden 測試進入點。
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  for (final locale in SupportedLocale.values) {
    for (final theme in ScreenshotTheme.values) {
      for (final scenario in screenshotScenarioMetadatas.where(
        (scenario) => scenario.supportsGolden,
      )) {
        testWidgets('golden_${locale.name}_${theme.name}_${scenario.id}', (
          tester,
        ) async {
          final config = ScreenshotConfig(
            scenarioId: scenario.id,
            locale: locale,
            theme: theme,
          );

          SharedPreferences.setMockInitialValues(config.sharedPreferencesSeed);
          PackageInfo.setMockInitialValues(
            appName: 'Naver Blog Image Downloader',
            packageName: 'com.leoho.naverBlogImageDownloader',
            version: '1.5.1',
            buildNumber: '1',
            buildSignature: '',
          );

          final prefs = await SharedPreferences.getInstance();

          tester.view.physicalSize = const Size(_goldenWidth, _goldenHeight);
          tester.view.devicePixelRatio = 3;
          addTearDown(() {
            tester.view.resetPhysicalSize();
            tester.view.resetDevicePixelRatio();
          });

          await tester.pumpWidget(
            ProviderScope(
              overrides: [
                sharedPreferencesProvider.overrideWithValue(prefs),
                appRuntimeModeProvider.overrideWith(
                  (ref) => AppRuntimeMode.screenshot,
                ),
              ],
              child: ScreenshotApp(config: config),
            ),
          );
          await _pumpScreenshotScenario(tester);

          await expectLater(
            find.byType(ScreenshotApp),
            matchesGoldenFile(
              'goldens/${locale.name}/${theme.name}/${scenario.id}.png',
            ),
          );
        });
      }
    }
  }
}
