import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/blog_cache_metadata.dart';
import '../../../data/repositories/cache_repository.dart';
import '../../../data/repositories/log_repository.dart';

part 'settings_view_model.g.dart';

/// 設定頁面的不可變狀態，包含快取大小與已快取 Blog 清單。
class SettingsData {
  /// 建立 [SettingsData]。
  ///
  /// - [cacheSizeBytes]：快取佔用的磁碟空間大小（bytes），預設為 0。
  /// - [cachedBlogs]：已快取 Blog 的 metadata 清單，預設為空清單。
  const SettingsData({this.cacheSizeBytes = 0, this.cachedBlogs = const []});

  /// 目前快取佔用的磁碟空間大小（bytes）。
  final int cacheSizeBytes;

  /// 所有已快取 Blog 的 metadata 清單。
  final List<BlogCacheMetadata> cachedBlogs;

  /// 人類可讀的快取大小字串（MB 為單位，保留一位小數）。
  ///
  /// 回傳格式化後的快取大小字串，例如 `"12.3 MB"`。
  String get formattedCacheSize =>
      '${(cacheSizeBytes / 1024 / 1024).toStringAsFixed(1)} MB';

  /// 回傳複製後的新實例，僅覆寫指定欄位。
  ///
  /// - [cacheSizeBytes]：若提供則覆寫快取大小。
  /// - [cachedBlogs]：若提供則覆寫已快取 Blog 清單。
  ///
  /// 回傳新的 [SettingsData]，未指定的欄位保留原值。
  SettingsData copyWith({
    int? cacheSizeBytes,
    List<BlogCacheMetadata>? cachedBlogs,
  }) {
    return SettingsData(
      cacheSizeBytes: cacheSizeBytes ?? this.cacheSizeBytes,
      cachedBlogs: cachedBlogs ?? this.cachedBlogs,
    );
  }

  /// 比較兩個 [SettingsData] 是否相等。
  ///
  /// [other] 為比較對象。
  /// 當 [other] 同為 [SettingsData] 且 [cacheSizeBytes] 與 [cachedBlogs] 皆相同時回傳 `true`。
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SettingsData &&
          runtimeType == other.runtimeType &&
          cacheSizeBytes == other.cacheSizeBytes &&
          cachedBlogs == other.cachedBlogs;

  /// 基於 [cacheSizeBytes] 與 [cachedBlogs] 計算雜湊值。
  ///
  /// 回傳此實例的雜湊碼。
  @override
  int get hashCode => Object.hash(cacheSizeBytes, cachedBlogs);
}

/// 設定頁面的 ViewModel，負責快取資訊查詢與清除操作。
///
/// 以 [AsyncNotifier] 實作，`build()` 負責從 [CacheRepository] 載入快取資訊。
@riverpod
class SettingsViewModel extends _$SettingsViewModel {
  /// 從 [CacheRepository] 載入快取大小與所有 Blog metadata。
  ///
  /// 回傳包含快取大小與已快取 Blog 清單的 [SettingsData]。
  @override
  Future<SettingsData> build() async {
    final cacheRepository = ref.read(cacheRepositoryProvider);
    final cacheSizeBytes = await cacheRepository.totalCacheSize();
    final cachedBlogs = await cacheRepository.allMetadata();
    return SettingsData(
      cacheSizeBytes: cacheSizeBytes,
      cachedBlogs: cachedBlogs,
    );
  }

  /// 清除所有快取檔案與 metadata，完成後重設狀態為空。
  Future<void> clearAllCache() async {
    final previousSize = state.value?.cacheSizeBytes ?? 0;
    state = const AsyncLoading();
    final cacheRepository = ref.read(cacheRepositoryProvider);
    await cacheRepository.clearAll();
    ref
        .read(logRepositoryProvider)
        .logClearCache(previousSizeBytes: previousSize);
    state = const AsyncData(SettingsData());
  }
}
