import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/blog_cache_metadata.dart';

part 'cache_repository.g.dart';

/// CacheRepository 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳 [CacheRepository] 實例。
@Riverpod(keepAlive: true)
CacheRepository cacheRepository(Ref ref) => CacheRepository();

/// 快取子系統的唯一存取介面，負責管理本地磁碟上的照片檔案快取
/// 與對應的 [BlogCacheMetadata]。
///
/// 主要功能：
/// - 以 Blog 為單位儲存與查詢快取檔案
/// - 透過 [SharedPreferences] 持久化快取的 metadata
/// - 當快取超過 300 MB 軟性閥值時，自動淘汰已儲存至相簿的最舊資料
class CacheRepository {
  /// [SharedPreferences] 中儲存 metadata 的 key 名稱。
  static const _metadataKey = 'cache_metadata';

  /// 快取空間的軟性上限（300 MB），超過時觸發自動淘汰。
  static const _softLimit = 300 * 1024 * 1024; // 300 MB

  /// 單張照片的預估平均檔案大小（bytes），用於淘汰策略的空間估算。
  static const _estimatedPhotoSizeBytes = 500000;

  /// 是否已完成延遲初始化（載入快取目錄與 metadata）。
  bool _initialized = false;

  /// 應用程式快取的根目錄，由 [path_provider] 提供。
  late Directory _cacheDir;

  /// 記憶體中的 metadata 對應表（blogId → [BlogCacheMetadata]）。
  final Map<String, BlogCacheMetadata> _metadataStore = {};

  /// 以 SHA-256 對 Blog URL 進行 hash，回傳前 16 碼十六進制字串作為 blogId。
  ///
  /// 呼叫端須確保傳入的 [blogUrl] 已完成正規化（例如將手機版 URL 轉為電腦版），
  /// 以保證同一篇文章不論原始 URL 格式都能對應到相同的 blogId。
  ///
  /// [blogUrl] 為 Naver Blog 的完整網址（已正規化）。
  ///
  /// 回傳 SHA-256 前 16 碼的十六進制字串。
  String blogId(String blogUrl) {
    final bytes = utf8.encode(blogUrl);
    final digest = sha256.convert(bytes);
    return digest.toString().substring(0, 16);
  }

  /// 延遲初始化：取得應用程式快取目錄，並從 shared_preferences 載入已持久化的 metadata。
  Future<void> _ensureInitialized() async {
    if (_initialized) return;

    _cacheDir = await getApplicationCacheDirectory();

    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_metadataKey);
    if (jsonString != null) {
      final map = jsonDecode(jsonString) as Map<String, dynamic>;
      for (final entry in map.entries) {
        _metadataStore[entry.key] = BlogCacheMetadata.fromJson(
          entry.value as Map<String, dynamic>,
        );
      }
    }

    _initialized = true;
  }

  /// 取得指定 blogId 的快取目錄，不存在時遞迴建立。
  ///
  /// [blogId] 為 Blog 的唯一識別碼。
  ///
  /// 回傳 `<appCacheDir>/blogs/<blogId>` 路徑的 [Directory]。
  Future<Directory> cacheDirectory(String blogId) async {
    await _ensureInitialized();
    final dir = Directory(p.join(_cacheDir.path, 'blogs', blogId));
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  /// 將臨時檔案複製到快取目錄。
  ///
  /// - [tempFile]：下載完成的臨時檔案。
  /// - [filename]：目標檔案名稱。
  /// - [blogId]：Blog 的唯一識別碼，決定快取子目錄。
  ///
  /// 回傳複製後的快取 [File]。
  Future<File> storeFile(File tempFile, String filename, String blogId) async {
    final dir = await cacheDirectory(blogId);
    final targetPath = p.join(dir.path, filename);
    return tempFile.copy(targetPath);
  }

  /// 查詢已快取檔案，存在則回傳 [File]，否則回傳 `null`。
  ///
  /// - [filename]：要查詢的檔案名稱。
  /// - [blogId]：Blog 的唯一識別碼。
  ///
  /// 回傳對應的快取 [File]；檔案不存在時回傳 `null`。
  Future<File?> cachedFile(String filename, String blogId) async {
    final dir = await cacheDirectory(blogId);
    final file = File(p.join(dir.path, filename));
    if (await file.exists()) {
      return file;
    }
    return null;
  }

  /// 判斷 Blog 是否已完整快取：檢查所有預期檔案是否存在。
  ///
  /// - [blogId]：Blog 的唯一識別碼。
  /// - [expectedFilenames]：預期應存在的檔案名稱清單。
  ///
  /// 回傳 `true` 表示所有預期檔案皆已存在於快取中。
  Future<bool> isBlogFullyCached(
    String blogId,
    List<String> expectedFilenames,
  ) async {
    final dir = await cacheDirectory(blogId);
    for (final filename in expectedFilenames) {
      final file = File(p.join(dir.path, filename));
      if (!await file.exists()) {
        return false;
      }
    }
    return true;
  }

  /// 更新 metadata 並持久化至 shared_preferences。
  ///
  /// [metadata] 為要儲存或更新的 [BlogCacheMetadata]，以 `blogId` 作為 key。
  Future<void> updateMetadata(BlogCacheMetadata metadata) async {
    await _ensureInitialized();
    _metadataStore[metadata.blogId] = metadata;
    await _persistMetadata();
  }

  /// 查詢指定 blogId 的 metadata。
  ///
  /// [blogId] 為 Blog 的唯一識別碼。
  ///
  /// 回傳對應的 [BlogCacheMetadata]；尚未記錄時回傳 `null`。
  Future<BlogCacheMetadata?> metadata(String blogId) async {
    await _ensureInitialized();
    return _metadataStore[blogId];
  }

  /// 回傳所有已儲存的 metadata。
  ///
  /// 回傳所有 [BlogCacheMetadata] 的清單；無資料時回傳空清單。
  Future<List<BlogCacheMetadata>> allMetadata() async {
    await _ensureInitialized();
    return _metadataStore.values.toList();
  }

  /// 標記指定 Blog 的照片已儲存至相簿。
  ///
  /// [blogId] 為 Blog 的唯一識別碼。
  /// 若該 blogId 不存在於 metadata 中，則不做任何處理。
  Future<void> markAsSavedToGallery(String blogId) async {
    final meta = _metadataStore[blogId];
    if (meta == null) return;
    _metadataStore[blogId] = meta.copyWith(isSavedToGallery: true);
    await _persistMetadata();
  }

  /// 計算目前快取總大小（bytes），遞迴遍歷 `blogs/` 目錄下所有檔案。
  ///
  /// 回傳快取總大小的 bytes 整數值；`blogs/` 目錄不存在時回傳 0。
  Future<int> totalCacheSize() async {
    await _ensureInitialized();
    int total = 0;
    final blogsDir = Directory(p.join(_cacheDir.path, 'blogs'));
    if (!await blogsDir.exists()) return 0;
    await for (final entity in blogsDir.list(recursive: true)) {
      if (entity is File) total += await entity.length();
    }
    return total;
  }

  /// 當快取超過 300MB 軟性閥值時，優先清除已儲存至相簿的最舊 Blog。
  Future<void> evictIfNeeded() async {
    final currentSize = await totalCacheSize();
    if (currentSize <= _softLimit) return;

    final sorted = _metadataStore.values.toList()
      ..sort((a, b) {
        if (a.isSavedToGallery != b.isSavedToGallery) {
          return a.isSavedToGallery ? -1 : 1;
        }
        return a.downloadedAt.compareTo(b.downloadedAt);
      });

    int freed = 0;
    final target = currentSize - _softLimit;
    for (final meta in sorted) {
      if (freed >= target) break;
      if (!meta.isSavedToGallery) continue;
      await clearBlog(meta.blogId);
      freed += meta.photoCount * _estimatedPhotoSizeBytes;
    }
  }

  /// 清除所有快取檔案與 metadata。
  Future<void> clearAll() async {
    await _ensureInitialized();
    final blogsDir = Directory(p.join(_cacheDir.path, 'blogs'));
    if (await blogsDir.exists()) await blogsDir.delete(recursive: true);
    _metadataStore.clear();
    await _persistMetadata();
  }

  /// 清除指定 Blog 的快取檔案與 metadata。
  ///
  /// [blogId] 為要清除的 Blog 唯一識別碼。
  Future<void> clearBlog(String blogId) async {
    final dir = await cacheDirectory(blogId);
    if (await dir.exists()) await dir.delete(recursive: true);
    _metadataStore.remove(blogId);
    await _persistMetadata();
  }

  /// 將 metadata map 序列化為 JSON 並寫入 shared_preferences。
  Future<void> _persistMetadata() async {
    final prefs = await SharedPreferences.getInstance();
    final map = <String, dynamic>{};
    for (final entry in _metadataStore.entries) {
      map[entry.key] = entry.value.toJson();
    }
    await prefs.setString(_metadataKey, jsonEncode(map));
  }
}
