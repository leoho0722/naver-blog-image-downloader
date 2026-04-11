import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../models/blog_cache_metadata.dart';
import '../models/dtos/job_status_response.dart';
import '../models/download_batch_result.dart';
import '../models/fetch_result.dart';
import '../models/photo_entity.dart';
import '../services/api_service.dart';
import '../services/file_download_service.dart';
import '../services/photo_service.dart';
import '../../ui/core/app_error.dart';
import 'cache_repository.dart';

part 'photo_repository.g.dart';

/// PhotoRepository 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照，用於取得各 Service 與 Repository 的實例。
/// 回傳注入所有依賴的 [PhotoRepository] 實例。
@Riverpod(keepAlive: true)
PhotoRepository photoRepository(Ref ref) {
  return PhotoRepository(
    apiService: ref.watch(apiServiceProvider),
    fileDownloadService: ref.watch(fileDownloadServiceProvider),
    photoService: ref.watch(photoServiceProvider),
    cacheRepository: ref.watch(cacheRepositoryProvider),
  );
}

/// 照片 Repository，負責協調 API 呼叫、快取與相簿儲存操作。
///
/// 作為 Domain 與 Data 層之間的橋梁，將 [ApiService]、[CacheRepository]、
/// [FileDownloadService] 與 [PhotoService] 的操作組合為上層可直接使用的用例。
class PhotoRepository {
  /// 建立 [PhotoRepository]，需注入所有依賴的服務與子 Repository。
  ///
  /// - [apiService]：API 通訊服務，負責提交爬蟲任務與查詢狀態。
  /// - [cacheRepository]：快取 Repository，負責本機檔案快取與 metadata 管理。
  /// - [fileDownloadService]：檔案下載服務，負責從遠端 URL 下載圖片。
  /// - [photoService]：系統相簿存取服務，負責將照片儲存至使用者相簿。
  PhotoRepository({
    required ApiService apiService,
    required CacheRepository cacheRepository,
    required FileDownloadService fileDownloadService,
    required PhotoService photoService,
  }) : _apiService = apiService,
       _cacheRepository = cacheRepository,
       _fileDownloadService = fileDownloadService,
       _photoService = photoService;

  /// API 通訊服務，負責提交爬蟲任務與查詢狀態。
  final ApiService _apiService;

  /// 快取 Repository，負責本機檔案快取與 metadata 管理。
  final CacheRepository _cacheRepository;

  /// 檔案下載服務，負責從遠端 URL 下載圖片至本機。
  final FileDownloadService _fileDownloadService;

  /// 系統相簿存取服務，負責將照片儲存至使用者相簿。
  final PhotoService _photoService;

  /// 每次輪詢任務狀態的等待間隔（3 秒）。
  static const _pollInterval = Duration(seconds: 3);

  /// 輪詢最大次數（3 秒 × 200 次 = 最多等待 10 分鐘）。
  static const _maxPollAttempts = 200;

  /// 單批並行下載的最大併發數量。
  static const _maxConcurrency = 4;

  /// 取得指定 Blog URL 的照片列表（非同步任務模式）。
  ///
  /// - [blogUrl]：要爬取的 Naver Blog 完整網址。
  /// - [onStatusChanged]：任務狀態變更時的回呼，可用於通知 UI 目前的 [JobStatus]。
  ///
  /// 流程：
  /// 1. 以 [CacheRepository.blogId] 產生 blogId
  /// 2. 呼叫 [ApiService.submitJob] 提交非同步爬蟲任務
  /// 3. 每 3 秒輪詢 [ApiService.checkJobStatus] 直到完成或失敗
  /// 4. 透過 [PhotoDownloadResponse.toEntities] 將 URL 轉為 [PhotoEntity]
  /// 5. 檢查快取狀態
  ///
  /// 回傳 [FetchResult]，包含照片清單、blogId 與快取狀態。
  /// 伺服器處理失敗時拋出 [AppError]（type: [AppErrorType.serverError]）。
  /// 輪詢逾時時拋出 [AppError]（type: [AppErrorType.timeout]）。
  Future<FetchResult> fetchPhotos(
    String blogUrl, {
    void Function(JobStatus status)? onStatusChanged,
  }) async {
    final blogId = _cacheRepository.blogId(blogUrl);

    // 快取優先：若 metadata 存在且所有檔案完整快取，直接回傳
    final metadata = await _cacheRepository.metadata(blogId);
    if (metadata != null) {
      final isFullyCached = await _cacheRepository.isBlogFullyCached(
        blogId,
        metadata.filenames,
      );
      if (isFullyCached) {
        final photos = metadata.filenames
            .asMap()
            .entries
            .map(
              (e) =>
                  PhotoEntity(id: 'photo_${e.key}', url: '', filename: e.value),
            )
            .toList();
        return FetchResult(
          photos: photos,
          blogId: blogId,
          blogUrl: blogUrl,
          isFullyCached: true,
        );
      }
    }

    // 提交非同步任務
    final jobId = await _apiService.submitJob(blogUrl);
    onStatusChanged?.call(JobStatus.processing);

    // 輪詢任務狀態
    for (var attempt = 0; attempt < _maxPollAttempts; attempt++) {
      await Future<void>.delayed(_pollInterval);

      final jobStatus = await _apiService.checkJobStatus(jobId);
      onStatusChanged?.call(jobStatus.status);

      switch (jobStatus.status) {
        case JobStatus.processing:
          continue;

        case JobStatus.completed:
          final response = jobStatus.result!;
          final photos = response.toEntities();
          final filenames = photos.map((p) => p.filename).toList();
          final isFullyCached = await _cacheRepository.isBlogFullyCached(
            blogId,
            filenames,
          );

          return FetchResult(
            photos: photos,
            blogId: blogId,
            blogUrl: blogUrl,
            isFullyCached: isFullyCached,
            totalImages: response.totalImages,
            failureDownloads: response.failureDownloads,
            fetchErrors: response.errors,
          );

        case JobStatus.failed:
          final errors = jobStatus.result?.errors ?? [];
          final message = errors.isNotEmpty ? errors.join('; ') : '伺服器處理失敗';
          throw AppError(type: AppErrorType.serverError, message: message);
      }
    }

    throw const AppError(type: AppErrorType.timeout, message: '任務處理逾時，請稍後再試');
  }

  /// 將單張照片儲存至系統相簿。
  ///
  /// [filePath] 為本機照片檔案的絕對路徑。
  ///
  /// 先透過 [PhotoService.requestPermission] 確認權限，
  /// 再呼叫 [PhotoService.saveToGallery] 寫入相簿。
  /// 權限不足時拋出 [AppError]（type: [AppErrorType.gallery]）。
  Future<void> saveOneToGallery(String filePath) async {
    final hasPermission = await _photoService.requestPermission();
    if (!hasPermission) {
      throw const AppError(type: AppErrorType.gallery, message: '相簿權限未授權');
    }
    await _photoService.saveToGallery(filePath);
  }

  /// 從快取讀取照片檔案並逐一儲存至系統相簿，完成後標記 metadata。
  ///
  /// - [photos]：要儲存的照片實體清單。
  /// - [blogId]：Blog 的唯一識別碼，用於查詢快取檔案。
  ///
  /// 若快取中找不到某張照片的檔案，則跳過該張照片繼續處理。
  /// 儲存完成後會呼叫 [CacheRepository.markAsSavedToGallery] 標記 metadata。
  /// 失敗時直接拋出例外。
  Future<void> saveToGalleryFromCache({
    required List<PhotoEntity> photos,
    required String blogId,
  }) async {
    for (final photo in photos) {
      final file = await _cacheRepository.cachedFile(photo.filename, blogId);
      if (file == null) continue;
      await _photoService.saveToGallery(file.path, totalCount: photos.length);
    }
    await _cacheRepository.markAsSavedToGallery(blogId);
  }

  /// 將照片列表並行下載至本地快取。
  ///
  /// - [photos]：要下載的照片實體清單。
  /// - [blogId]：Blog 的唯一識別碼，決定快取子目錄。
  /// - [blogUrl]：原始 Blog 網址，用於記錄 [BlogCacheMetadata]。
  /// - [onProgress]：每完成一張照片（含跳過與失敗）時觸發的進度回呼，
  ///   參數為 `(completed, total)`。
  ///
  /// 最多 [_maxConcurrency] 條並行下載（分批 `Future.wait`），
  /// 已快取的檔案自動跳過，單一下載失敗不中斷整批下載。
  /// 完成後更新 [BlogCacheMetadata]。
  ///
  /// 回傳 [DownloadBatchResult]，包含成功、失敗與跳過的統計。
  Future<DownloadBatchResult> downloadAllToCache({
    required List<PhotoEntity> photos,
    required String blogId,
    required String blogUrl,
    void Function(int completed, int total)? onProgress,
  }) async {
    // 下載前先清理快取空間
    await _cacheRepository.evictIfNeeded();

    int successCount = 0;
    int skippedCount = 0;
    final failedPhotos = <PhotoEntity>[];
    final errors = <String>[];
    int completed = 0;

    Future<void> downloadOne(PhotoEntity photo) async {
      // 檢查是否已快取
      if (await _cacheRepository.cachedFile(photo.filename, blogId) != null) {
        skippedCount++;
        completed++;
        onProgress?.call(completed, photos.length);
        return;
      }

      try {
        // 產生臨時檔案路徑
        final cacheDir = await _cacheRepository.cacheDirectory(blogId);
        final tempPath = p.join(
          cacheDir.parent.path,
          'tmp_${DateTime.now().microsecondsSinceEpoch}_${photo.filename}',
        );

        // 下載到臨時檔案
        await _fileDownloadService.downloadFile(photo.url, tempPath);
        final tempFile = File(tempPath);
        final tempSize = await tempFile.length();
        debugPrint(
          '[PhotoRepo] 下載完成: ${photo.filename} '
          '(${(tempSize / 1024).toStringAsFixed(1)} KB)',
        );

        // 存入快取
        await _cacheRepository.storeFile(tempFile, photo.filename, blogId);

        // 清理臨時檔案
        if (await tempFile.exists()) {
          await tempFile.delete();
        }

        successCount++;
      } on Exception catch (e) {
        failedPhotos.add(photo);
        errors.add('${photo.filename}: $e');
      }
      completed++;
      onProgress?.call(completed, photos.length);
    }

    // 分批並行下載：每批最多 _maxConcurrency 張，一批完成再下一批
    for (var i = 0; i < photos.length; i += _maxConcurrency) {
      final end = (i + _maxConcurrency < photos.length)
          ? i + _maxConcurrency
          : photos.length;
      await Future.wait(photos.sublist(i, end).map(downloadOne));
    }

    // 更新 metadata
    await _cacheRepository.updateMetadata(
      BlogCacheMetadata(
        blogId: blogId,
        blogUrl: blogUrl,
        photoCount: photos.length,
        downloadedAt: DateTime.now(),
        isSavedToGallery: false,
        filenames: photos.map((p) => p.filename).toList(),
      ),
    );

    return DownloadBatchResult(
      successCount: successCount,
      failedPhotos: failedPhotos,
      skippedCount: skippedCount,
      errors: errors,
    );
  }
}
