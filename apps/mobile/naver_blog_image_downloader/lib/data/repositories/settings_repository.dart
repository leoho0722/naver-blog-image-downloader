import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../config/app_icon.dart';
import '../../config/app_settings_keys.dart';
import '../../config/supported_locale.dart';
import '../services/local_storage_service.dart';

part 'settings_repository.g.dart';

/// SettingsRepository 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照，用於取得 [LocalStorageService] 實例。
/// 回傳注入 [LocalStorageService] 的 [SettingsRepository] 實例。
@Riverpod(keepAlive: true)
SettingsRepository settingsRepository(Ref ref) {
  return SettingsRepository(
    localStorageService: ref.watch(localStorageServiceProvider),
  );
}

/// 使用者偏好設定的 Repository，封裝 [LocalStorageService] 提供主題模式與語系的讀寫介面。
class SettingsRepository {
  /// 建立 [SettingsRepository]。
  ///
  /// - [localStorageService]：注入的本機儲存服務，用於讀寫使用者偏好設定。
  SettingsRepository({required LocalStorageService localStorageService})
    : _storage = localStorageService;

  /// 注入的本機儲存服務，用於讀寫使用者偏好設定。
  final LocalStorageService _storage;

  /// 從持久化儲存載入主題模式，未設定時預設回傳 [ThemeMode.system]。
  ///
  /// - 回傳：使用者先前儲存的 [ThemeMode]，若無記錄則回傳 [ThemeMode.system]。
  ThemeMode loadThemeMode() {
    final value = _storage.getString(AppSettingsKeys.themeMode);
    return switch (value) {
      'system' => ThemeMode.system,
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  /// 將主題模式持久化至儲存。
  ///
  /// - [mode]：要儲存的 [ThemeMode]（`system`、`light` 或 `dark`）。
  Future<void> saveThemeMode(ThemeMode mode) async {
    await _storage.setString(AppSettingsKeys.themeMode, mode.name);
  }

  /// 從持久化儲存載入語系，未設定時回傳 `null`（表示無明確偏好）。
  ///
  /// - 回傳：使用者先前儲存的 [SupportedLocale]，若無記錄或值無法識別則回傳 `null`。
  SupportedLocale? loadLocale() {
    final value = _storage.getString(AppSettingsKeys.locale);
    if (value == null) return null;
    final locale = SupportedLocale.values.where((e) => e.name == value);
    return locale.isEmpty ? null : locale.first;
  }

  /// 將語系持久化至儲存。
  ///
  /// - [locale]：要儲存的 [SupportedLocale]。
  Future<void> saveLocale(SupportedLocale locale) async {
    await _storage.setString(AppSettingsKeys.locale, locale.name);
  }

  /// 檢查 SharedPreferences 中是否有任何既有資料（排除 `lastSeenVersion` 自身）。
  ///
  /// 用於區分「從舊版升級」與「真正首次安裝」：
  /// 舊版使用者即使沒有 `lastSeenVersion`，也可能有 `cache_metadata`、
  /// `app_theme_mode`、`app_locale` 或其他 Flutter plugin 寫入的 key。
  ///
  /// 回傳 `true` 表示至少有一項既有資料，代表非首次安裝。
  bool hasExistingData() {
    final keys = _storage.getKeys();
    final otherKeys = keys.where((k) => k != AppSettingsKeys.lastSeenVersion);
    return otherKeys.isNotEmpty;
  }

  /// 從持久化儲存載入使用者上次確認過新功能頁面時的版本號。
  ///
  /// 回傳先前儲存的版本字串，首次安裝時回傳 `null`（表示從未確認過任何版本）。
  String? loadLastSeenVersion() {
    return _storage.getString(AppSettingsKeys.lastSeenVersion);
  }

  /// 將使用者已確認的版本號持久化至儲存。
  ///
  /// [version] 為當前 App 版本號，儲存後同版本不再重複顯示新功能頁面。
  Future<void> saveLastSeenVersion(String version) async {
    await _storage.setString(AppSettingsKeys.lastSeenVersion, version);
  }

  /// 從持久化儲存載入 App 圖示偏好，未設定時回傳 [AppIcon.defaultIcon]（預設）。
  ///
  /// 回傳使用者先前儲存的 [AppIcon]，若無記錄或值無法識別則回傳 [AppIcon.defaultIcon]。
  AppIcon loadAppIcon() {
    final value = _storage.getString(AppSettingsKeys.appIcon);
    if (value == null) return AppIcon.defaultIcon;
    final matched = AppIcon.values.where((e) => e.nativeKey == value);
    return matched.isEmpty ? AppIcon.defaultIcon : matched.first;
  }

  /// 將 App 圖示偏好持久化至儲存。
  ///
  /// [icon] 為要儲存的 [AppIcon]。
  Future<void> saveAppIcon(AppIcon icon) async {
    await _storage.setString(AppSettingsKeys.appIcon, icon.nativeKey);
  }
}
