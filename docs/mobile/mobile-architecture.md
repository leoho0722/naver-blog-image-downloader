# Naver Blog 照片下載器：系統架構設計書（完整版）

## 技術決策摘要

| 項目 | 選型 |
|------|------|
| 框架 | Flutter (Dart 3) |
| 架構模式 | MVVM（遵循 flutter/skills 官方規範） |
| 分層 | UI Layer (View + ViewModel) → Data Layer (Repository + Service) |
| 狀態管理 | ChangeNotifier + ListenableBuilder |
| 依賴注入 | provider |
| 錯誤處理 | Result\<T\> |
| 圖片快取/顯示 | cached_network_image（網格縮圖）+ 自管磁碟快取（原始檔） |
| 相簿存取 | gal |
| 檔案下載 | dio（串流下載） |
| 導航 | go_router |

**遵循 flutter/skills 官方規範**：
- Unidirectional Data Flow：資料從 Data Layer → UI Layer，事件從 UI → ViewModel → Repository
- Single Source of Truth：Repository 是唯一允許變更應用資料的類別
- Service Isolation：ViewModel 不得直接存取 Service，必須透過 Repository
- Stateless Services：Service 不持有狀態，僅包裝外部 API 或本地儲存
- Immutable Models：從 Repository 傳給 ViewModel 的 Domain Model 必須為不可變

---

## 設計原則

### 單一管線

```
下載 → 寫入本機快取 → UI 從快取顯示 → 儲存時從快取讀取寫入相簿
```

一次下載，三次消費，零重複網路請求。本機磁碟快取是 Single Source of Truth。

### 核心決策

- 全部下載完成後才跳轉至照片網格頁
- 下載失敗自動重試最多 3 次（指數退避 1s → 2s → 4s），單張失敗不中斷其餘下載
- 快取管理：設定頁手動清除 + 超過閥值自動清除（優先淘汰已儲存至相簿的最舊 Blog）
- 重複下載偵測：同一 Blog 再次開啟時，快取完整則直接顯示（秒開）
- 圖片顯示從本地快取檔案載入 + resize + 記憶體快取

---

## 一、專案結構

```
naver_photo_downloader/
├── lib/
│   ├── main.dart                              # 進入點 + Provider 配置
│   ├── app.dart                               # MaterialApp + GoRouter
│   │
│   ├── config/
│   │   ├── app_config.dart                    # 環境變數、API base URL
│   │   └── theme.dart                         # Material 3 主題
│   │
│   ├── data/
│   │   ├── services/                          # 無狀態，包裝外部 API
│   │   │   ├── api_service.dart               # HTTP 呼叫 Lambda API
│   │   │   ├── file_download_service.dart     # Dio 串流下載 + 自動重試
│   │   │   ├── gallery_service.dart           # gal 套件包裝
│   │   │   └── local_storage_service.dart     # SharedPreferences
│   │   │
│   │   ├── repositories/                      # SSOT，管理快取與商業邏輯
│   │   │   ├── photo_repository.dart          # 照片列表 + 下載 + 儲存
│   │   │   └── cache_repository.dart          # 磁碟快取管理 + metadata
│   │   │
│   │   └── models/                            # DTO + Domain Model
│   │       ├── photo_entity.dart              # 不可變 Domain Model
│   │       ├── blog_cache_metadata.dart       # 快取 metadata
│   │       ├── download_batch_result.dart     # 批次下載結果
│   │       ├── fetch_result.dart              # API 回傳 + 快取檢查結果
│   │       └── dtos/
│   │           ├── photo_download_request.dart
│   │           └── photo_download_response.dart
│   │
│   ├── ui/
│   │   ├── blog_input/
│   │   │   ├── view_model/
│   │   │   │   └── blog_input_view_model.dart
│   │   │   └── widgets/
│   │   │       └── blog_input_view.dart
│   │   │
│   │   ├── download/
│   │   │   ├── view_model/
│   │   │   │   └── download_view_model.dart
│   │   │   └── widgets/
│   │   │       └── download_view.dart
│   │   │
│   │   ├── photo_gallery/
│   │   │   ├── view_model/
│   │   │   │   └── photo_gallery_view_model.dart
│   │   │   └── widgets/
│   │   │       ├── photo_gallery_view.dart
│   │   │       └── photo_card.dart
│   │   │
│   │   ├── photo_detail/
│   │   │   ├── view_model/
│   │   │   │   └── photo_detail_view_model.dart
│   │   │   └── widgets/
│   │   │       └── photo_detail_view.dart
│   │   │
│   │   ├── settings/
│   │   │   ├── view_model/
│   │   │   │   └── settings_view_model.dart
│   │   │   └── widgets/
│   │   │       └── settings_view.dart
│   │   │
│   │   └── core/                              # 共享 UI 元件
│   │       ├── result.dart                    # Result<T> 型別
│   │       └── app_error.dart
│   │
│   ├── routing/
│   │   └── app_router.dart                    # GoRouter 路由定義
│   │
│   └── utils/
│       ├── extensions.dart
│       └── constants.dart
│
├── test/
│   ├── data/
│   │   ├── repositories/
│   │   │   ├── photo_repository_test.dart
│   │   │   └── cache_repository_test.dart
│   │   └── services/
│   │       └── api_service_test.dart
│   └── ui/
│       ├── blog_input/
│       │   └── blog_input_view_model_test.dart
│       └── download/
│           └── download_view_model_test.dart
│
├── pubspec.yaml
└── analysis_options.yaml
```

---

## 二、Data Layer

### 2.1 Result 型別（錯誤處理）

```dart
// ui/core/result.dart
sealed class Result<T> {
  const Result();

  factory Result.ok(T value) = Ok<T>;
  factory Result.error(Exception error) = Error<T>;
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);
  final T value;
}

final class Error<T> extends Result<T> {
  const Error(this.error);
  final Exception error;
}
```

### 2.2 Domain Models（不可變）

```dart
// data/models/photo_entity.dart
class PhotoEntity {
  const PhotoEntity({
    required this.id,
    required this.url,
    required this.filename,
    required this.blogTitle,
    this.width,
    this.height,
  });

  final String id;
  final String url;
  final String filename;
  final String blogTitle;
  final int? width;
  final int? height;
}

// data/models/fetch_result.dart
class FetchResult {
  const FetchResult({
    required this.photos,
    required this.blogId,
    required this.blogTitle,
    required this.isFullyCached,
  });

  final List<PhotoEntity> photos;
  final String blogId;
  final String blogTitle;
  final bool isFullyCached;
}

// data/models/download_batch_result.dart
class DownloadBatchResult {
  const DownloadBatchResult({
    required this.successCount,
    required this.failedPhotos,
  });

  final int successCount;
  final List<PhotoEntity> failedPhotos;

  bool get isAllSuccessful => failedPhotos.isEmpty;
}

// data/models/blog_cache_metadata.dart
import 'dart:convert';

class BlogCacheMetadata {
  const BlogCacheMetadata({
    required this.blogId,
    required this.blogUrl,
    required this.blogTitle,
    required this.photoCount,
    required this.downloadedAt,
    required this.isSavedToGallery,
    required this.filenames,
  });

  final String blogId;
  final String blogUrl;
  final String blogTitle;
  final int photoCount;
  final DateTime downloadedAt;
  final bool isSavedToGallery;
  final List<String> filenames;

  BlogCacheMetadata copyWith({bool? isSavedToGallery}) => BlogCacheMetadata(
        blogId: blogId,
        blogUrl: blogUrl,
        blogTitle: blogTitle,
        photoCount: photoCount,
        downloadedAt: downloadedAt,
        isSavedToGallery: isSavedToGallery ?? this.isSavedToGallery,
        filenames: filenames,
      );

  Map<String, dynamic> toJson() => {
        'blogId': blogId,
        'blogUrl': blogUrl,
        'blogTitle': blogTitle,
        'photoCount': photoCount,
        'downloadedAt': downloadedAt.toIso8601String(),
        'isSavedToGallery': isSavedToGallery,
        'filenames': filenames,
      };

  factory BlogCacheMetadata.fromJson(Map<String, dynamic> json) =>
      BlogCacheMetadata(
        blogId: json['blogId'] as String,
        blogUrl: json['blogUrl'] as String,
        blogTitle: json['blogTitle'] as String,
        photoCount: json['photoCount'] as int,
        downloadedAt: DateTime.parse(json['downloadedAt'] as String),
        isSavedToGallery: json['isSavedToGallery'] as bool,
        filenames: List<String>.from(json['filenames'] as List),
      );
}
```

### 2.3 Services（無狀態，包裝外部 API）

#### ApiService

```dart
// data/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  ApiService({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<PhotoDownloadResponse> fetchPhotos(String blogUrl) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/api/photos'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(PhotoDownloadRequest(blogUrl: blogUrl).toJson()),
    );

    if (response.statusCode != 200) {
      throw HttpException('Server error: ${response.statusCode}');
    }

    return PhotoDownloadResponse.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
  }
}

class HttpException implements Exception {
  const HttpException(this.message);
  final String message;
  @override
  String toString() => message;
}
```

#### FileDownloadService（串流下載 + 自動重試）

```dart
// data/services/file_download_service.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class FileDownloadService {
  FileDownloadService({Dio? dio}) : _dio = dio ?? Dio();

  final Dio _dio;
  static const _maxRetries = 3;

  /// 串流下載至臨時檔案，自動重試最多 3 次
  Future<File> downloadToFile(String imageUrl) async {
    Exception? lastError;

    for (var attempt = 0; attempt <= _maxRetries; attempt++) {
      if (attempt > 0) {
        // 指數退避：1s → 2s → 4s
        await Future.delayed(Duration(seconds: 1 << (attempt - 1)));
      }

      try {
        final tempDir = await getTemporaryDirectory();
        final filePath = p.join(
          tempDir.path,
          'downloads',
          '${DateTime.now().millisecondsSinceEpoch}.jpg',
        );
        await Directory(p.dirname(filePath)).create(recursive: true);

        await _dio.download(
          imageUrl,
          filePath,
          options: Options(
            responseType: ResponseType.stream,
            receiveTimeout: const Duration(seconds: 30),
          ),
        );

        return File(filePath);
      } on Exception catch (e) {
        lastError = e;
        continue;
      }
    }

    throw lastError ?? Exception('下載失敗');
  }
}
```

#### GalleryService

```dart
// data/services/gallery_service.dart
import 'package:gal/gal.dart';

class GalleryService {
  /// 從本地快取檔案路徑存入相簿（不刪除快取檔案）
  Future<void> saveToGallery(String filePath) async {
    await Gal.putImage(filePath);
  }

  Future<bool> requestPermission() async {
    return await Gal.requestAccess();
  }
}
```

### 2.4 Repositories（SSOT，管理快取與商業邏輯）

#### CacheRepository

```dart
// data/repositories/cache_repository.dart
import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class CacheRepository {
  static const _softLimit = 300 * 1024 * 1024; // 300 MB
  Map<String, BlogCacheMetadata> _metadataStore = {};
  late Directory _baseDirectory;
  bool _initialized = false;

  Future<void> _ensureInitialized() async {
    if (_initialized) return;
    final cacheDir = await getTemporaryDirectory();
    _baseDirectory = Directory(p.join(cacheDir.path, 'photos'));
    await _baseDirectory.create(recursive: true);
    _loadMetadata();
    _initialized = true;
  }

  /// URL 的 SHA-256 hash 前 16 碼
  String blogId(String blogUrl) {
    final digest = sha256.convert(utf8.encode(blogUrl));
    return digest.toString().substring(0, 16);
  }

  Future<Directory> cacheDirectory(String blogId) async {
    await _ensureInitialized();
    final dir = Directory(p.join(_baseDirectory.path, blogId));
    await dir.create(recursive: true);
    return dir;
  }

  Future<File> storeFile(File tempFile, String filename, String blogId) async {
    final dir = await cacheDirectory(blogId);
    final dest = File(p.join(dir.path, filename));
    if (await dest.exists()) await dest.delete();
    await tempFile.rename(dest.path);
    return dest;
  }

  Future<File?> cachedFile(String filename, String blogId) async {
    final dir = await cacheDirectory(blogId);
    final file = File(p.join(dir.path, filename));
    return await file.exists() ? file : null;
  }

  Future<bool> isBlogFullyCached(
      String blogId, List<String> expectedFilenames) async {
    for (final filename in expectedFilenames) {
      if (await cachedFile(filename, blogId) == null) return false;
    }
    return true;
  }

  Future<void> updateMetadata(BlogCacheMetadata metadata) async {
    await _ensureInitialized();
    _metadataStore[metadata.blogId] = metadata;
    await _persistMetadata();
  }

  BlogCacheMetadata? metadata(String blogId) => _metadataStore[blogId];

  List<BlogCacheMetadata> allMetadata() => _metadataStore.values.toList();

  Future<void> markAsSavedToGallery(String blogId) async {
    final meta = _metadataStore[blogId];
    if (meta == null) return;
    _metadataStore[blogId] = meta.copyWith(isSavedToGallery: true);
    await _persistMetadata();
  }

  Future<int> totalCacheSize() async {
    await _ensureInitialized();
    int total = 0;
    await for (final entity in _baseDirectory.list(recursive: true)) {
      if (entity is File && !entity.path.endsWith('metadata.json')) {
        total += await entity.length();
      }
    }
    return total;
  }

  /// 自動清除：優先清除已儲存至相簿的最舊 Blog
  Future<void> evictIfNeeded() async {
    final currentSize = await totalCacheSize();
    if (currentSize <= _softLimit) return;

    final sorted = _metadataStore.values.toList()
      ..sort((a, b) {
        if (a.isSavedToGallery != b.isSavedToGallery) {
          return a.isSavedToGallery ? -1 : 1; // 已儲存的優先清除
        }
        return a.downloadedAt.compareTo(b.downloadedAt); // 最舊優先
      });

    int freed = 0;
    final target = currentSize - _softLimit;

    for (final meta in sorted) {
      if (freed >= target) break;
      final dir = await cacheDirectory(meta.blogId);
      final dirSize = await _directorySize(dir);
      if (await dir.exists()) await dir.delete(recursive: true);
      _metadataStore.remove(meta.blogId);
      freed += dirSize;
    }
    await _persistMetadata();
  }

  Future<void> clearAll() async {
    await _ensureInitialized();
    final dirs = await _baseDirectory.list().toList();
    for (final dir in dirs) {
      if (dir is Directory) await dir.delete(recursive: true);
    }
    _metadataStore.clear();
    await _persistMetadata();
  }

  Future<void> clearBlog(String blogId) async {
    final dir = await cacheDirectory(blogId);
    if (await dir.exists()) await dir.delete(recursive: true);
    _metadataStore.remove(blogId);
    await _persistMetadata();
  }

  // Private

  File get _metadataFile =>
      File(p.join(_baseDirectory.path, 'metadata.json'));

  void _loadMetadata() {
    final file = _metadataFile;
    if (!file.existsSync()) return;
    try {
      final json = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
      _metadataStore = json.map(
        (key, value) => MapEntry(
          key,
          BlogCacheMetadata.fromJson(value as Map<String, dynamic>),
        ),
      );
    } catch (_) {
      _metadataStore = {};
    }
  }

  Future<void> _persistMetadata() async {
    final json = _metadataStore.map(
      (key, value) => MapEntry(key, value.toJson()),
    );
    await _metadataFile.writeAsString(jsonEncode(json));
  }

  Future<int> _directorySize(Directory dir) async {
    int total = 0;
    if (!await dir.exists()) return 0;
    await for (final entity in dir.list(recursive: true)) {
      if (entity is File) total += await entity.length();
    }
    return total;
  }
}
```

#### PhotoRepository

```dart
// data/repositories/photo_repository.dart
import 'dart:async';
import 'dart:io';

class PhotoRepository {
  PhotoRepository({
    required ApiService apiService,
    required FileDownloadService fileDownloadService,
    required GalleryService galleryService,
    required CacheRepository cacheRepository,
  })  : _apiService = apiService,
        _fileDownloadService = fileDownloadService,
        _galleryService = galleryService,
        _cacheRepository = cacheRepository;

  final ApiService _apiService;
  final FileDownloadService _fileDownloadService;
  final GalleryService _galleryService;
  final CacheRepository _cacheRepository;

  /// 階段 1：取得照片列表 + 檢查快取
  Future<Result<FetchResult>> fetchPhotos(String blogUrl) async {
    try {
      final blogId = _cacheRepository.blogId(blogUrl);
      final response = await _apiService.fetchPhotos(blogUrl);
      final photos = response.photos
          .map((dto) => dto.toEntity(response.blogTitle))
          .toList();
      final filenames = photos.map((p) => p.filename).toList();
      final isFullyCached =
          await _cacheRepository.isBlogFullyCached(blogId, filenames);

      return Result.ok(FetchResult(
        photos: photos,
        blogId: blogId,
        blogTitle: response.blogTitle,
        isFullyCached: isFullyCached,
      ));
    } on Exception catch (e) {
      return Result.error(e);
    }
  }

  /// 階段 2：批次下載至快取（全部完成後回傳，單張失敗不中斷）
  Future<DownloadBatchResult> downloadAllToCache({
    required List<PhotoEntity> photos,
    required String blogId,
    required void Function(int completed, int total) onProgress,
  }) async {
    await _cacheRepository.evictIfNeeded();

    int successCount = 0;
    final failedPhotos = <PhotoEntity>[];
    int completed = 0;

    // 並行最多 4 條下載，填滿 + 完成一個補一個
    final pool = <Future<void>>[];
    final iterator = photos.iterator;
    const maxConcurrency = 4;

    Future<void> downloadOne(PhotoEntity photo) async {
      // 跳過已快取（斷點續傳）
      if (await _cacheRepository.cachedFile(photo.filename, blogId) != null) {
        successCount++;
        completed++;
        onProgress(completed, photos.length);
        return;
      }

      try {
        final tempFile =
            await _fileDownloadService.downloadToFile(photo.url);
        await _cacheRepository.storeFile(tempFile, photo.filename, blogId);
        successCount++;
      } on Exception {
        failedPhotos.add(photo);
      }
      completed++;
      onProgress(completed, photos.length);
    }

    // 使用 Completer 池控制並行數
    final active = <Future<void>>[];
    for (final photo in photos) {
      if (active.length >= maxConcurrency) {
        await Future.any(active);
        active.removeWhere((f) => f == Future.value());
      }
      final future = downloadOne(photo);
      active.add(future);
      future.then((_) => active.remove(future));
    }
    await Future.wait(active);

    // 寫入 metadata
    await _cacheRepository.updateMetadata(BlogCacheMetadata(
      blogId: blogId,
      blogUrl: photos.firstOrNull?.url ?? '',
      blogTitle: photos.firstOrNull?.blogTitle ?? '',
      photoCount: photos.length,
      downloadedAt: DateTime.now(),
      isSavedToGallery: false,
      filenames: photos.map((p) => p.filename).toList(),
    ));

    return DownloadBatchResult(
      successCount: successCount,
      failedPhotos: failedPhotos,
    );
  }

  /// 階段 3：從快取儲存至相簿
  Future<Result<void>> saveToGalleryFromCache({
    required List<PhotoEntity> photos,
    required String blogId,
  }) async {
    try {
      for (final photo in photos) {
        final file =
            await _cacheRepository.cachedFile(photo.filename, blogId);
        if (file == null) continue;
        await _galleryService.saveToGallery(file.path);
      }
      await _cacheRepository.markAsSavedToGallery(blogId);
      return Result.ok(null);
    } on Exception catch (e) {
      return Result.error(e);
    }
  }
}
```

---

## 三、UI Layer

### 3.1 ViewModel（ChangeNotifier）

#### BlogInputViewModel

```dart
// ui/blog_input/view_model/blog_input_view_model.dart
import 'package:flutter/foundation.dart';

class BlogInputViewModel extends ChangeNotifier {
  BlogInputViewModel({required PhotoRepository photoRepository})
      : _photoRepository = photoRepository;

  final PhotoRepository _photoRepository;

  String _blogUrl = '';
  bool _isLoading = false;
  String? _errorMessage;
  FetchResult? _fetchResult;

  String get blogUrl => _blogUrl;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  FetchResult? get fetchResult => _fetchResult;

  void onUrlChanged(String url) {
    _blogUrl = url;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> fetchPhotos() async {
    if (_blogUrl.isEmpty) {
      _errorMessage = '請輸入 Blog 網址';
      notifyListeners();
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await _photoRepository.fetchPhotos(_blogUrl);

    switch (result) {
      case Ok<FetchResult>(:final value):
        _fetchResult = value;
        _isLoading = false;
      case Error<FetchResult>(:final error):
        _errorMessage = error.toString();
        _isLoading = false;
    }
    notifyListeners();
  }

  void reset() {
    _fetchResult = null;
    notifyListeners();
  }
}
```

#### DownloadViewModel

```dart
// ui/download/view_model/download_view_model.dart
import 'package:flutter/foundation.dart';

class DownloadViewModel extends ChangeNotifier {
  DownloadViewModel({required PhotoRepository photoRepository})
      : _photoRepository = photoRepository;

  final PhotoRepository _photoRepository;

  int _completed = 0;
  int _total = 0;
  bool _isDownloading = false;
  DownloadBatchResult? _result;

  int get completed => _completed;
  int get total => _total;
  bool get isDownloading => _isDownloading;
  DownloadBatchResult? get result => _result;
  double get progress => _total > 0 ? _completed / _total : 0;

  Future<void> startDownload({
    required List<PhotoEntity> photos,
    required String blogId,
  }) async {
    _isDownloading = true;
    _completed = 0;
    _total = photos.length;
    _result = null;
    notifyListeners();

    _result = await _photoRepository.downloadAllToCache(
      photos: photos,
      blogId: blogId,
      onProgress: (completed, total) {
        _completed = completed;
        _total = total;
        notifyListeners();
      },
    );

    _isDownloading = false;
    notifyListeners();
  }
}
```

#### PhotoGalleryViewModel

```dart
// ui/photo_gallery/view_model/photo_gallery_view_model.dart
import 'package:flutter/foundation.dart';

class PhotoGalleryViewModel extends ChangeNotifier {
  PhotoGalleryViewModel({
    required PhotoRepository photoRepository,
    required CacheRepository cacheRepository,
  })  : _photoRepository = photoRepository,
        _cacheRepository = cacheRepository;

  final PhotoRepository _photoRepository;
  final CacheRepository _cacheRepository;

  List<PhotoEntity> _photos = [];
  String _blogId = '';
  Set<String> _selectedIds = {};
  bool _isSelectMode = false;
  bool _isSaving = false;

  List<PhotoEntity> get photos => _photos;
  String get blogId => _blogId;
  Set<String> get selectedIds => _selectedIds;
  bool get isSelectMode => _isSelectMode;
  bool get isSaving => _isSaving;

  void load(List<PhotoEntity> photos, String blogId) {
    _photos = photos;
    _blogId = blogId;
    notifyListeners();
  }

  void toggleSelectMode() {
    _isSelectMode = !_isSelectMode;
    if (!_isSelectMode) _selectedIds.clear();
    notifyListeners();
  }

  void toggleSelection(String photoId) {
    if (_selectedIds.contains(photoId)) {
      _selectedIds.remove(photoId);
    } else {
      _selectedIds.add(photoId);
    }
    notifyListeners();
  }

  void selectAll() {
    if (_selectedIds.length == _photos.length) {
      _selectedIds.clear();
    } else {
      _selectedIds = _photos.map((p) => p.id).toSet();
    }
    notifyListeners();
  }

  Future<void> saveSelectedToGallery() async {
    _isSaving = true;
    notifyListeners();

    final selected =
        _photos.where((p) => _selectedIds.contains(p.id)).toList();
    await _photoRepository.saveToGalleryFromCache(
      photos: selected,
      blogId: _blogId,
    );

    _isSaving = false;
    _selectedIds.clear();
    _isSelectMode = false;
    notifyListeners();
  }

  Future<void> saveAllToGallery() async {
    _isSaving = true;
    notifyListeners();

    await _photoRepository.saveToGalleryFromCache(
      photos: _photos,
      blogId: _blogId,
    );

    _isSaving = false;
    notifyListeners();
  }

  /// 取得快取中的本地檔案路徑
  Future<File?> cachedFile(PhotoEntity photo) {
    return _cacheRepository.cachedFile(photo.filename, _blogId);
  }
}
```

#### SettingsViewModel

```dart
// ui/settings/view_model/settings_view_model.dart
import 'package:flutter/foundation.dart';

class SettingsViewModel extends ChangeNotifier {
  SettingsViewModel({required CacheRepository cacheRepository})
      : _cacheRepository = cacheRepository;

  final CacheRepository _cacheRepository;

  int _cacheSizeBytes = 0;
  List<BlogCacheMetadata> _cachedBlogs = [];
  bool _isClearing = false;

  int get cacheSizeBytes => _cacheSizeBytes;
  List<BlogCacheMetadata> get cachedBlogs => _cachedBlogs;
  bool get isClearing => _isClearing;
  String get formattedCacheSize =>
      '${(_cacheSizeBytes / 1024 / 1024).toStringAsFixed(1)} MB';

  Future<void> loadCacheInfo() async {
    _cacheSizeBytes = await _cacheRepository.totalCacheSize();
    _cachedBlogs = _cacheRepository.allMetadata();
    notifyListeners();
  }

  Future<void> clearAllCache() async {
    _isClearing = true;
    notifyListeners();

    await _cacheRepository.clearAll();

    _isClearing = false;
    _cacheSizeBytes = 0;
    _cachedBlogs = [];
    notifyListeners();
  }

  Future<void> clearBlogCache(String blogId) async {
    await _cacheRepository.clearBlog(blogId);
    await loadCacheInfo();
  }
}
```

### 3.2 Views（StatelessWidget + ListenableBuilder，零商業邏輯）

#### BlogInputView

```dart
// ui/blog_input/widgets/blog_input_view.dart
class BlogInputView extends StatelessWidget {
  const BlogInputView({super.key});

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<BlogInputViewModel>();

    return Scaffold(
      appBar: AppBar(title: const Text('照片下載器')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              onChanged: viewModel.onUrlChanged,
              decoration: const InputDecoration(
                labelText: 'Naver Blog 網址',
                hintText: 'https://blog.naver.com/...',
              ),
            ),
            const SizedBox(height: 16),
            if (viewModel.errorMessage != null)
              Text(
                viewModel.errorMessage!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: viewModel.isLoading ? null : viewModel.fetchPhotos,
                child: viewModel.isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('取得照片列表'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

#### DownloadView

```dart
// ui/download/widgets/download_view.dart
class DownloadView extends StatelessWidget {
  const DownloadView({super.key});

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<DownloadViewModel>();

    return Scaffold(
      appBar: AppBar(title: const Text('下載中')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(value: viewModel.progress),
              const SizedBox(height: 24),
              Text(
                '${viewModel.completed} / ${viewModel.total}',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                viewModel.isDownloading ? '下載中...' : '下載完成',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              if (viewModel.result != null &&
                  !viewModel.result!.isAllSuccessful) ...[
                const SizedBox(height: 16),
                Text(
                  '${viewModel.result!.failedPhotos.length} 張下載失敗',
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.error),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```

#### PhotoCard（從本地快取載入）

```dart
// ui/photo_gallery/widgets/photo_card.dart
class PhotoCard extends StatelessWidget {
  const PhotoCard({
    super.key,
    required this.photo,
    required this.cachedFile,
    required this.isSelected,
    required this.isSelectMode,
    required this.onTap,
    required this.onSelect,
  });

  final PhotoEntity photo;
  final File? cachedFile;
  final bool isSelected;
  final bool isSelectMode;
  final VoidCallback onTap;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isSelectMode ? onSelect : onTap,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // 從本地快取檔案載入，不走網路
          if (cachedFile != null)
            Image.file(
              cachedFile!,
              fit: BoxFit.cover,
              cacheWidth: 200, // 解碼為 200px 縮圖，節省記憶體
            )
          else
            const ColoredBox(
              color: Colors.black12,
              child: Center(child: CircularProgressIndicator()),
            ),
          if (isSelectMode)
            Positioned(
              top: 4,
              right: 4,
              child: Checkbox(
                value: isSelected,
                onChanged: (_) => onSelect(),
              ),
            ),
        ],
      ),
    );
  }
}
```

---

## 四、依賴注入（Provider）

```dart
// main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        // Services（無狀態）
        Provider(create: (_) => ApiService(baseUrl: AppConfig.baseUrl)),
        Provider(create: (_) => FileDownloadService()),
        Provider(create: (_) => GalleryService()),

        // Repositories（SSOT）
        Provider(create: (_) => CacheRepository()),
        ProxyProvider4<ApiService, FileDownloadService, GalleryService,
            CacheRepository, PhotoRepository>(
          update: (_, api, download, gallery, cache, __) => PhotoRepository(
            apiService: api,
            fileDownloadService: download,
            galleryService: gallery,
            cacheRepository: cache,
          ),
        ),

        // ViewModels（ChangeNotifier）
        ChangeNotifierProxyProvider<PhotoRepository, BlogInputViewModel>(
          create: (_) => BlogInputViewModel(
            photoRepository: PhotoRepository(
              apiService: ApiService(baseUrl: AppConfig.baseUrl),
              fileDownloadService: FileDownloadService(),
              galleryService: GalleryService(),
              cacheRepository: CacheRepository(),
            ),
          ),
          update: (_, repo, vm) => vm!.._updateRepository(repo),
        ),
        ChangeNotifierProxyProvider<PhotoRepository, DownloadViewModel>(
          create: (_) => DownloadViewModel(
            photoRepository: PhotoRepository(
              apiService: ApiService(baseUrl: AppConfig.baseUrl),
              fileDownloadService: FileDownloadService(),
              galleryService: GalleryService(),
              cacheRepository: CacheRepository(),
            ),
          ),
          update: (_, repo, vm) => vm!,
        ),
        ChangeNotifierProxyProvider2<PhotoRepository, CacheRepository,
            PhotoGalleryViewModel>(
          create: (_) => PhotoGalleryViewModel(
            photoRepository: PhotoRepository(
              apiService: ApiService(baseUrl: AppConfig.baseUrl),
              fileDownloadService: FileDownloadService(),
              galleryService: GalleryService(),
              cacheRepository: CacheRepository(),
            ),
            cacheRepository: CacheRepository(),
          ),
          update: (_, repo, cache, vm) => vm!,
        ),
        ChangeNotifierProxyProvider<CacheRepository, SettingsViewModel>(
          create: (_) => SettingsViewModel(
            cacheRepository: CacheRepository(),
          ),
          update: (_, cache, vm) => vm!,
        ),
      ],
      child: const NaverPhotoApp(),
    ),
  );
}
```

---

## 五、導航（GoRouter）

```dart
// routing/app_router.dart
import 'package:go_router/go_router.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const BlogInputView(),
    ),
    GoRoute(
      path: '/download/:blogId',
      builder: (context, state) => const DownloadView(),
    ),
    GoRoute(
      path: '/gallery/:blogId',
      builder: (context, state) => const PhotoGalleryView(),
    ),
    GoRoute(
      path: '/detail/:photoId',
      builder: (context, state) => const PhotoDetailView(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsView(),
    ),
  ],
);
```

---

## 六、單一管線資料流

```
使用者輸入 Blog URL
       │
       ▼
┌─ PhotoRepository.fetchPhotos ────────────────────────────┐
│  ApiService.fetchPhotos → 照片 URL 列表                    │
│  CacheRepository.isBlogFullyCached → 快取檢查               │
│  ├─ 已快取 → FetchResult(isFullyCached: true) → 秒開       │
│  └─ 未快取 → FetchResult(isFullyCached: false) → 下載      │
└──────────────────────────────────────────────────────────┘
       │ 未快取
       ▼
┌─ PhotoRepository.downloadAllToCache ─────────────────────┐
│  並行 4 條 · Dio 串流下載至臨時檔案                          │
│  FileDownloadService 內建重試 3 次（1s → 2s → 4s）          │
│  跳過已快取照片（斷點續傳）                                   │
│  單張失敗不中斷，匯總 DownloadBatchResult                    │
│  全部完成後才跳轉                                           │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌─ 本機磁碟快取（Single Source of Truth）──────────────────┐
│  CacheRepository 管理 metadata                           │
│  caches/photos/{blogId}/{filename}                       │
│  ├─ 讀取 → Image.file + cacheWidth:200（網格縮圖）         │
│  ├─ 讀取 → Image.file 原始解析度（全螢幕檢視）               │
│  └─ 讀取 → GalleryService 存入相簿（不刪除快取）             │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌─ 快取清除策略 ──────────────────────────────────────────┐
│  手動：設定頁 → clearAll / clearBlog                      │
│  自動：下載前檢查，> 300MB 軟性閥值則淘汰                    │
│        優先清除「已儲存至相簿」的最舊 Blog                    │
└──────────────────────────────────────────────────────────┘
```

---

## 七、測試策略

```dart
// test/ui/blog_input/blog_input_view_model_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockPhotoRepository extends Mock implements PhotoRepository {}

void main() {
  late MockPhotoRepository mockRepo;
  late BlogInputViewModel viewModel;

  setUp(() {
    mockRepo = MockPhotoRepository();
    viewModel = BlogInputViewModel(photoRepository: mockRepo);
  });

  test('空 URL 時顯示錯誤', () {
    viewModel.fetchPhotos();
    expect(viewModel.errorMessage, '請輸入 Blog 網址');
    expect(viewModel.isLoading, false);
  });

  test('成功取得照片列表', () async {
    final fetchResult = FetchResult(
      photos: [testPhoto],
      blogId: 'abc',
      blogTitle: 'Test',
      isFullyCached: false,
    );
    when(() => mockRepo.fetchPhotos(any()))
        .thenAnswer((_) async => Result.ok(fetchResult));

    viewModel.onUrlChanged('https://blog.naver.com/test');
    await viewModel.fetchPhotos();

    expect(viewModel.isLoading, false);
    expect(viewModel.fetchResult, fetchResult);
    expect(viewModel.errorMessage, isNull);
  });
}
```

---

## 八、關鍵套件版本

```yaml
# pubspec.yaml
environment:
  sdk: ^3.6.0
  flutter: ^3.29.0

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2            # 依賴注入
  go_router: ^14.8.0          # 導航
  dio: ^5.7.0                 # HTTP + 串流下載
  http: ^1.3.0                # 輕量 HTTP（API 呼叫）
  gal: ^2.3.0                 # 相簿存取（一行跨平台）
  crypto: ^3.0.6              # SHA-256（Blog ID hash）
  path_provider: ^2.1.5       # 臨時/快取目錄
  path: ^1.9.1                # 路徑操作
  shared_preferences: ^2.3.4  # 簡易 KV 儲存

dev_dependencies:
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.4            # Mock（零程式碼產生）
  flutter_lints: ^5.0.0       # Lint 規則
```

---

## 九、flutter/skills 架構約束檢查表

| 約束 | 本專案的實作 |
|------|------------|
| **No Logic in Views** | View 僅含佈局和基於 ViewModel 狀態的條件渲染 |
| **Unidirectional Data Flow** | 資料從 Repository → ViewModel → View；事件從 View → ViewModel → Repository |
| **Single Source of Truth** | CacheRepository 是快取資料的唯一變更點；PhotoRepository 是照片資料的唯一變更點 |
| **Service Isolation** | ViewModel 不直接存取任何 Service，僅透過 Repository |
| **Stateless Services** | ApiService、FileDownloadService、GalleryService 皆不持有狀態 |
| **Immutable Models** | PhotoEntity、FetchResult、DownloadBatchResult 皆為 const 建構函式 + final 欄位 |
| **Result 錯誤處理** | Repository 回傳 Result\<T\>，ViewModel 以 switch 處理 Ok / Error |
| **View-ViewModel 1:1** | 每個 Feature 恰好一個 View + 一個 ViewModel |
