import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../config/app_icon.dart';
import '../../../config/supported_locale.dart';
import '../../../data/repositories/log_repository.dart';
import '../../../data/repositories/settings_repository.dart';
import '../../../data/services/app_icon_service.dart';

part 'app_settings_view_model.g.dart';

/// 全域偏好設定的不可變狀態，包含主題模式與語系。
class AppSettingsState {
  /// 建立 [AppSettingsState]。
  ///
  /// - [themeMode]：主題模式，預設為 [ThemeMode.system]。
  /// - [locale]：語系偏好，`null` 表示無明確偏好。
  /// - [appIcon]：App 圖示偏好，預設為 [AppIcon.defaultIcon]。
  const AppSettingsState({
    this.themeMode = ThemeMode.system,
    this.locale,
    this.appIcon = AppIcon.defaultIcon,
  });

  /// 目前的主題模式，預設跟隨系統。
  final ThemeMode themeMode;

  /// 目前的語系，`null` 表示無明確偏好。
  final SupportedLocale? locale;

  /// 目前的 App 圖示，預設為預設圖示。
  final AppIcon appIcon;

  /// 回傳複製後的新實例，僅覆寫指定欄位。
  ///
  /// - [themeMode]：若提供則覆寫主題模式。
  /// - [locale]：若提供則覆寫語系。
  /// - [appIcon]：若提供則覆寫 App 圖示。
  ///
  /// 回傳新的 [AppSettingsState]，未指定的欄位保留原值。
  AppSettingsState copyWith({
    ThemeMode? themeMode,
    SupportedLocale? locale,
    AppIcon? appIcon,
  }) {
    return AppSettingsState(
      themeMode: themeMode ?? this.themeMode,
      locale: locale ?? this.locale,
      appIcon: appIcon ?? this.appIcon,
    );
  }

  /// 比較兩個 [AppSettingsState] 是否相等。
  ///
  /// [other] 為比較對象。
  /// 當 [other] 同為 [AppSettingsState] 且 [themeMode]、[locale] 與 [appIcon] 皆相同時回傳 `true`。
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AppSettingsState &&
          runtimeType == other.runtimeType &&
          themeMode == other.themeMode &&
          locale == other.locale &&
          appIcon == other.appIcon;

  /// 基於 [themeMode]、[locale] 與 [appIcon] 計算雜湊值。
  ///
  /// 回傳此實例的雜湊碼。
  @override
  int get hashCode => Object.hash(themeMode, locale, appIcon);
}

/// 全域偏好設定的 ViewModel，管理主題模式與語系狀態。
///
/// 以 [AsyncNotifier] 實作，`build()` 負責從 [SettingsRepository] 載入初始設定。
@Riverpod(keepAlive: true)
class AppSettingsViewModel extends _$AppSettingsViewModel {
  /// 從 [SettingsRepository] 載入偏好設定並回傳初始 [AppSettingsState]。
  ///
  /// 回傳包含主題模式與語系偏好的 [AppSettingsState]。
  @override
  Future<AppSettingsState> build() async {
    final repo = ref.read(settingsRepositoryProvider);
    final themeMode = repo.loadThemeMode();
    final locale = repo.loadLocale();
    final appIcon = repo.loadAppIcon();
    return AppSettingsState(
      themeMode: themeMode,
      locale: locale,
      appIcon: appIcon,
    );
  }

  /// 切換主題模式並持久化。
  ///
  /// [mode] 為要套用的主題模式（系統 / 淺色 / 深色）。
  /// 採用樂觀更新：先更新 UI 狀態，再寫入持久化儲存。
  Future<void> setThemeMode(ThemeMode mode) async {
    final oldMode = state.requireValue.themeMode;
    state = AsyncData(state.requireValue.copyWith(themeMode: mode));
    final repo = ref.read(settingsRepositoryProvider);
    await repo.saveThemeMode(mode);
    ref
        .read(logRepositoryProvider)
        .logSettingsChange(
          setting: 'theme',
          oldValue: oldMode.name,
          newValue: mode.name,
        );
  }

  /// 切換語系並持久化。
  ///
  /// [locale] 為要套用的語系（繁體中文 / English / 日本語 / 한국어）。
  /// 採用樂觀更新：先更新 UI 狀態，再寫入持久化儲存。
  Future<void> setLocale(SupportedLocale locale) async {
    final oldLocale = state.requireValue.locale;
    state = AsyncData(state.requireValue.copyWith(locale: locale));
    final repo = ref.read(settingsRepositoryProvider);
    await repo.saveLocale(locale);
    ref
        .read(logRepositoryProvider)
        .logSettingsChange(
          setting: 'locale',
          oldValue: oldLocale?.name ?? 'system',
          newValue: locale.name,
        );
  }

  /// 切換 App 圖示並持久化，透過 [AppIconService] 通知原生平台執行切換。
  ///
  /// [icon] 為要套用的 App 圖示（預設 / 新版）。
  /// 採用樂觀更新：先更新 UI 狀態，再寫入持久化儲存與呼叫原生 API。
  Future<void> setAppIcon(AppIcon icon) async {
    final oldIcon = state.requireValue.appIcon;
    state = AsyncData(state.requireValue.copyWith(appIcon: icon));
    final repo = ref.read(settingsRepositoryProvider);
    await repo.saveAppIcon(icon);
    final iconService = ref.read(appIconServiceProvider);
    await iconService.setAppIcon(icon.nativeKey);
    ref
        .read(logRepositoryProvider)
        .logSettingsChange(
          setting: 'appIcon',
          oldValue: oldIcon.nativeKey,
          newValue: icon.nativeKey,
        );
  }
}
