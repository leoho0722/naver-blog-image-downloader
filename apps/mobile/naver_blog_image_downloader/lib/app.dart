import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:naver_blog_image_downloader/l10n/app_localizations.dart';

import 'config/theme.dart';
import 'routing/app_router.dart';
import 'ui/core/view_model/app_settings_view_model.dart';

/// Naver Blog 照片下載器的根 Widget，負責設定主題、語系與路由。
class NaverPhotoApp extends ConsumerWidget {
  /// 建立 [NaverPhotoApp]。
  const NaverPhotoApp({super.key});

  /// 建構應用程式的 [MaterialApp.router]，根據使用者偏好設定主題模式與語系。
  ///
  /// [context] 為目前的 [BuildContext]。
  /// [ref] 為 Riverpod 的 [WidgetRef]，用於監聽 Provider 狀態變化。
  ///
  /// 使用 [AsyncValue.when] 處理 loading / error / data 三種狀態。
  ///
  /// 回傳已設定主題、語系、本地化代理與路由的 [MaterialApp.router]。
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appSettings = ref.watch(appSettingsViewModelProvider);

    return appSettings.when(
      data: (settings) => MaterialApp.router(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: settings.themeMode,
        locale: settings.locale?.locale,
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        routerConfig: ref.watch(appRouterProvider),
      ),
      loading: () => const MaterialApp(
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      ),
      error: (e, _) => MaterialApp.router(
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        routerConfig: ref.watch(appRouterProvider),
      ),
    );
  }
}
