import 'package:package_info_plus/package_info_plus.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../config/supported_locale.dart';
import '../../../data/models/whats_new_item.dart';
import '../../../data/services/whats_new_data_source.dart';
import '../../../data/repositories/log_repository.dart';
import '../../../data/repositories/settings_repository.dart';
import '../../core/view_model/app_settings_view_model.dart';

part 'whats_new_view_model.g.dart';

// region State

/// 「版本新功能」與「首次安裝引導」的顯示狀態。
///
/// 使用 sealed class 區分三種情境：不顯示、顯示引導、顯示新功能。
sealed class WhatsNewState {
  /// 建立 [WhatsNewState]。
  const WhatsNewState();
}

/// 不需要顯示任何 Dialog 的狀態。
class WhatsNewHidden extends WhatsNewState {
  /// 建立 [WhatsNewHidden]。
  const WhatsNewHidden();
}

/// 首次安裝時顯示操作引導的狀態。
class WhatsNewOnboarding extends WhatsNewState {
  /// 建立 [WhatsNewOnboarding]。
  ///
  /// [version] 為當前 App 版本號。
  /// [entry] 為引導內容。
  const WhatsNewOnboarding({required this.version, required this.entry});

  /// 當前 App 版本號。
  final String version;

  /// 引導內容。
  final WhatsNewEntry entry;
}

/// App 更新後顯示新功能介紹的狀態。
class WhatsNewUpdate extends WhatsNewState {
  /// 建立 [WhatsNewUpdate]。
  ///
  /// [version] 為當前 App 版本號。
  /// [entry] 為該版本的新功能內容。
  const WhatsNewUpdate({required this.version, required this.entry});

  /// 當前 App 版本號。
  final String version;

  /// 該版本的新功能內容。
  final WhatsNewEntry entry;
}

// endregion

// region ViewModel

/// 版本新功能與首次安裝引導的 ViewModel。
///
/// 負責判斷使用者狀態（首次安裝 / 更新 / 同版本），
/// 透過 [WhatsNewDataSource] 取得內容，
/// 並在 [build] 中回傳對應的 [WhatsNewState]。
///
/// 使用 `keepAlive: true` 確保 Dialog 顯示期間 provider 不被回收，
/// 避免 [dismiss] 時取得新的 notifier 導致版本號未寫入。
@Riverpod(keepAlive: true)
class WhatsNewViewModel extends _$WhatsNewViewModel {
  /// 判斷是否需要顯示新功能介紹或首次安裝引導。
  ///
  /// 所有情境皆以 fire-and-forget 方式透過 [LogRepository] 記錄 log。
  ///
  /// 回傳對應的 [WhatsNewState]。
  @override
  Future<WhatsNewState> build() async {
    final repo = ref.read(settingsRepositoryProvider);
    final dataSource = ref.read(whatsNewDataSourceProvider);
    final log = ref.read(logRepositoryProvider);

    // PackageInfo 在測試環境或無 plugin 的環境中會拋出 MissingPluginException，
    // 此時靜默回傳 Hidden 狀態，不阻斷主畫面渲染。
    final PackageInfo info;
    try {
      info = await PackageInfo.fromPlatform();
    } on Exception {
      log.logPageNavigation(screenName: 'whats_new_version_check_failed');
      return const WhatsNewHidden();
    }

    final currentVersion = info.version;
    final lastSeenVersion = repo.loadLastSeenVersion();

    // 取得使用者語系：優先使用 App 設定，無偏好時從裝置語系解析
    // 統一透過 SupportedLocale 正規化，確保發送給後端的值都在支援範圍內
    final appSettings = ref.read(appSettingsViewModelProvider).value;
    final supportedLocale =
        appSettings?.locale ?? SupportedLocale.fromDeviceLocale();
    final locale = supportedLocale.locale.toLanguageTag();

    if (lastSeenVersion == null) {
      // 區分「真正首次安裝」與「從舊版升級」：
      // 舊版使用者即使沒有 lastSeenVersion，也會有 cache_metadata、
      // themeMode、locale 或其他 Flutter plugin 寫入的 SharedPreferences key。
      if (repo.hasExistingData()) {
        return _handleUpdate(currentVersion, locale, dataSource, repo, log);
      }

      // 真正首次安裝
      final entry = await dataSource.getOnboardingEntry(
        version: currentVersion,
        locale: locale,
      );
      if (entry != null) {
        log.logPageNavigation(screenName: 'whats_new_onboarding_shown');
        return WhatsNewOnboarding(version: currentVersion, entry: entry);
      }

      // 引導內容為 null：靜默寫入版本，不顯示
      await repo.saveLastSeenVersion(currentVersion);
      log.logPageNavigation(screenName: 'whats_new_onboarding_skipped');
      return const WhatsNewHidden();
    }

    // 同版本：不顯示
    if (lastSeenVersion == currentVersion) {
      log.logPageNavigation(screenName: 'whats_new_same_version');
      return const WhatsNewHidden();
    }

    // 版本更新
    return _handleUpdate(currentVersion, locale, dataSource, repo, log);
  }

  /// 處理版本更新的邏輯（從舊版升級或一般版本更新共用）。
  ///
  /// [currentVersion] 為當前 App 版本號。
  /// [locale] 為使用者語系。
  /// [dataSource] 為資料來源。
  /// [repo] 為設定 Repository。
  /// [log] 為日誌 Repository。
  ///
  /// 回傳 [WhatsNewUpdate] 或 [WhatsNewHidden]。
  Future<WhatsNewState> _handleUpdate(
    String currentVersion,
    String locale,
    WhatsNewDataSource dataSource,
    SettingsRepository repo,
    LogRepository log,
  ) async {
    final entry = await dataSource.getWhatsNewEntry(
      version: currentVersion,
      locale: locale,
    );
    if (entry != null) {
      log.logPageNavigation(screenName: 'whats_new_update_shown');
      return WhatsNewUpdate(version: currentVersion, entry: entry);
    }

    // 無該版本的新功能內容：靜默寫入版本，不顯示
    await repo.saveLastSeenVersion(currentVersion);
    log.logPageNavigation(screenName: 'whats_new_update_skipped');
    return const WhatsNewHidden();
  }

  /// 使用者關閉 Dialog 後呼叫，將當前版本寫入持久化儲存。
  ///
  /// 儲存後更新狀態為 [WhatsNewHidden]，
  /// 並以 fire-and-forget 方式記錄確認日誌。
  Future<void> dismiss() async {
    final currentState = state.value;
    if (currentState == null || currentState is WhatsNewHidden) return;

    final version = switch (currentState) {
      WhatsNewOnboarding(:final version) => version,
      WhatsNewUpdate(:final version) => version,
      _ => null,
    };

    if (version != null) {
      final repo = ref.read(settingsRepositoryProvider);
      await repo.saveLastSeenVersion(version);
      state = const AsyncData(WhatsNewHidden());
      ref
          .read(logRepositoryProvider)
          .logPageNavigation(screenName: 'whats_new_confirmed');
    }
  }
}

// endregion
