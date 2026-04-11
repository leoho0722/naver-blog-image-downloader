import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/download_batch_result.dart';
import '../../../data/models/photo_entity.dart';
import '../../../data/repositories/log_repository.dart';
import '../../../data/repositories/photo_repository.dart';

export '../../../data/models/download_batch_result.dart';

part 'download_view_model.g.dart';

/// 下載頁面的不可變狀態，封裝下載進度與結果。
class DownloadViewModelState {
  /// 建立 [DownloadViewModelState]。
  ///
  /// - [completed]：已完成下載的照片數量，預設為 0。
  /// - [total]：本次批次需下載的照片總數，預設為 0。
  /// - [downloadResult]：批次下載的非同步結果，預設為 `AsyncData(null)`。
  const DownloadViewModelState({
    this.completed = 0,
    this.total = 0,
    this.downloadResult = const AsyncData(null),
  });

  /// 已完成下載的照片數量（含成功、失敗與跳過）。
  final int completed;

  /// 本次批次需下載的照片總數。
  final int total;

  /// 批次下載的非同步結果。
  final AsyncValue<DownloadBatchResult?> downloadResult;

  /// 下載進度比例（0.0 ~ 1.0），用於進度條顯示。
  ///
  /// 回傳 [completed] / [total] 的比例值；[total] 為 0 時回傳 0.0。
  double get progress => total > 0 ? completed / total : 0.0;

  /// 是否正在下載中。
  ///
  /// 回傳 `true` 表示 [downloadResult] 為 [AsyncLoading] 狀態。
  bool get isDownloading => downloadResult is AsyncLoading;

  /// 批次下載結果，下載完成後可檢查失敗項目。
  ///
  /// 回傳 [DownloadBatchResult]；尚未完成或未開始時回傳 `null`。
  DownloadBatchResult? get result => downloadResult.value;

  /// 複製並覆寫指定欄位，回傳新的 [DownloadViewModelState]。
  ///
  /// - [completed]：若提供則覆寫已完成數量。
  /// - [total]：若提供則覆寫照片總數。
  /// - [downloadResult]：若提供則覆寫下載結果。
  ///
  /// 回傳新的 [DownloadViewModelState]，未指定的欄位保留原值。
  DownloadViewModelState copyWith({
    int? completed,
    int? total,
    AsyncValue<DownloadBatchResult?>? downloadResult,
  }) {
    return DownloadViewModelState(
      completed: completed ?? this.completed,
      total: total ?? this.total,
      downloadResult: downloadResult ?? this.downloadResult,
    );
  }
}

/// 下載頁面的 ViewModel，負責管理批次照片下載進度與結果。
@riverpod
class DownloadViewModel extends _$DownloadViewModel {
  /// 初始化狀態，回傳預設的 [DownloadViewModelState]。
  @override
  DownloadViewModelState build() => const DownloadViewModelState();

  /// 開始批次下載指定的照片至本機快取。
  ///
  /// [photos] 為要下載的照片清單，[blogId] 用於建立快取目錄結構，
  /// [blogUrl] 為原始 Blog 網址，用於記錄快取 metadata。
  Future<void> startDownload({
    required List<PhotoEntity> photos,
    required String blogId,
    required String blogUrl,
  }) async {
    if (state.isDownloading) return;

    final stopwatch = Stopwatch()..start();

    state = DownloadViewModelState(
      total: photos.length,
      downloadResult: const AsyncLoading(),
    );

    try {
      final repo = ref.read(photoRepositoryProvider);
      final result = await repo.downloadAllToCache(
        photos: photos,
        blogId: blogId,
        blogUrl: blogUrl,
        onProgress: (completed, total) {
          state = state.copyWith(completed: completed, total: total);
        },
      );

      ref
          .read(logRepositoryProvider)
          .logDownload(
            blogId: blogId,
            successCount: result.successCount,
            failedCount: result.failureCount,
            skippedCount: result.skippedCount,
            totalCount: photos.length,
            durationMs: stopwatch.elapsedMilliseconds,
          );

      state = state.copyWith(downloadResult: AsyncData(result));
    } catch (e, st) {
      ref
          .read(logRepositoryProvider)
          .logError(
            errorType: e.runtimeType.toString(),
            message: e.toString(),
            stackTrace: st.toString(),
          );

      state = state.copyWith(downloadResult: AsyncError(e, st));
    }
  }
}
