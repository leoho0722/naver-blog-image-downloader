import 'dart:async';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/models/dtos/job_status_response.dart';
import '../../../data/models/fetch_result.dart';
import '../../../data/repositories/log_repository.dart';
import '../../../data/repositories/photo_repository.dart';
import '../../../data/services/api_service.dart' show ApiServiceException;
import '../../core/app_error.dart';
import '../../core/naver_url_validator.dart';

part 'blog_input_view_model.g.dart';

/// 擷取載入階段的列舉。
enum FetchLoadingPhase {
  /// 正在提交任務。
  submitting,

  /// 伺服器處理中。
  processing,

  /// 處理完成。
  completed,
}

/// 擷取錯誤類型的列舉。
enum FetchErrorType {
  /// 使用者未輸入網址。
  emptyUrl,

  /// 請求逾時。
  timeout,

  /// 伺服器暫時無法使用（可重試）。
  serverUnavailable,

  /// API 呼叫失敗（不可重試）。
  apiFailed,

  /// 伺服器處理失敗。
  serverError,

  /// 網路連線異常。
  networkError,

  /// 未知錯誤。
  unknown,
}

/// 照片擷取操作的例外，攜帶錯誤類型與可選的 HTTP 狀態碼。
class FetchException implements Exception {
  /// 建立 [FetchException]。
  ///
  /// - [errorType]：錯誤類型，由 [FetchErrorType] 列舉指定。
  /// - [statusCode]：HTTP 狀態碼，僅部分錯誤類型會帶值。
  const FetchException({required this.errorType, this.statusCode});

  /// 錯誤類型。
  final FetchErrorType errorType;

  /// HTTP 狀態碼（僅 [FetchErrorType.serverUnavailable] 時有值）。
  final int? statusCode;
}

/// Blog 網址輸入頁面的不可變狀態，封裝網址、擷取結果與載入階段。
class BlogInputState {
  /// 建立 [BlogInputState]。
  ///
  /// - [blogUrl]：使用者輸入的 Blog 網址，預設為空字串。
  /// - [fetchResult]：照片擷取的非同步結果，預設為 `AsyncData(null)`。
  /// - [loadingPhase]：目前的載入階段，預設為 `null`（非載入中）。
  const BlogInputState({
    this.blogUrl = '',
    this.fetchResult = const AsyncData(null),
    this.loadingPhase,
  });

  /// 使用者輸入的 Blog 網址。
  final String blogUrl;

  /// 照片擷取的非同步結果。
  final AsyncValue<FetchResult?> fetchResult;

  /// 目前的載入階段，非載入中時為 null。
  final FetchLoadingPhase? loadingPhase;

  /// 是否正在擷取照片（含提交任務 + 輪詢中）。
  ///
  /// 回傳 `true` 表示 [fetchResult] 為 [AsyncLoading] 狀態。
  bool get isLoading => fetchResult is AsyncLoading;

  /// 照片擷取結果，尚未擷取或擷取中時為 null。
  ///
  /// 回傳 [FetchResult]；尚未擷取或擷取中時回傳 `null`。
  FetchResult? get fetchResultValue => fetchResult.value;

  /// 複製並覆寫指定欄位，回傳新的 [BlogInputState]。
  ///
  /// - [blogUrl]：若提供則覆寫 Blog 網址。
  /// - [fetchResult]：若提供則覆寫擷取結果。
  /// - [loadingPhase]：使用函式包裝以允許顯式設定為 `null`。
  ///
  /// 回傳新的 [BlogInputState]，未指定的欄位保留原值。
  BlogInputState copyWith({
    String? blogUrl,
    AsyncValue<FetchResult?>? fetchResult,
    FetchLoadingPhase? Function()? loadingPhase,
  }) {
    return BlogInputState(
      blogUrl: blogUrl ?? this.blogUrl,
      fetchResult: fetchResult ?? this.fetchResult,
      loadingPhase: loadingPhase != null ? loadingPhase() : this.loadingPhase,
    );
  }
}

/// Blog 網址輸入頁面的 ViewModel，負責管理使用者輸入的網址並發起照片擷取請求。
@riverpod
class BlogInputViewModel extends _$BlogInputViewModel {
  /// 初始化狀態。
  ///
  /// 回傳預設的 [BlogInputState]（空網址、無結果、非載入中）。
  @override
  BlogInputState build() => const BlogInputState();

  /// 當使用者修改網址時呼叫，同時將擷取狀態重設為初始值。
  ///
  /// [url] 為使用者目前輸入的 Blog 網址。
  void onUrlChanged(String url) {
    state = BlogInputState(blogUrl: url);
  }

  /// 根據目前的 blogUrl 發起照片擷取請求（非同步任務模式）。
  ///
  /// 若網址為空會設定 [FetchErrorType.emptyUrl] 錯誤；若已在載入中則不重複發送。
  /// 任務提交後會自動輪詢狀態，並透過 [FetchLoadingPhase] 通知 UI。
  /// 失敗時將例外映射為 [FetchException] 並設定至 [BlogInputState.fetchResult]。
  Future<void> fetchPhotos() async {
    if (state.blogUrl.isEmpty) {
      state = state.copyWith(
        fetchResult: AsyncError(
          const FetchException(errorType: FetchErrorType.emptyUrl),
          StackTrace.current,
        ),
      );
      return;
    }

    final stopwatch = Stopwatch()..start();

    if (state.isLoading) return;

    state = state.copyWith(
      fetchResult: const AsyncLoading(),
      loadingPhase: () => FetchLoadingPhase.submitting,
    );

    try {
      final normalizedUrl = NaverUrlValidator.normalize(state.blogUrl);
      final repo = ref.read(photoRepositoryProvider);
      final result = await repo.fetchPhotos(
        normalizedUrl,
        onStatusChanged: (status) {
          state = state.copyWith(
            loadingPhase: () => switch (status) {
              JobStatus.processing => FetchLoadingPhase.processing,
              JobStatus.completed => FetchLoadingPhase.completed,
              JobStatus.failed => FetchLoadingPhase.completed,
            },
          );
        },
      );

      ref
          .read(logRepositoryProvider)
          .logFetchPhotos(
            blogUrl: state.blogUrl,
            blogId: result.blogId,
            resultCount: result.photos.length,
            isFromCache: result.isFullyCached,
            totalImages: result.totalImages,
            failureDownloads: result.failureDownloads,
            durationMs: stopwatch.elapsedMilliseconds,
          );

      state = state.copyWith(
        fetchResult: AsyncData(result),
        loadingPhase: () => null,
      );
    } on Exception catch (e, st) {
      ref
          .read(logRepositoryProvider)
          .logFetchPhotosError(
            blogUrl: state.blogUrl,
            errorType: e.runtimeType.toString(),
            durationMs: stopwatch.elapsedMilliseconds,
          );
      ref
          .read(logRepositoryProvider)
          .logError(
            errorType: e.runtimeType.toString(),
            message: e.toString(),
            stackTrace: st.toString(),
          );

      state = state.copyWith(
        fetchResult: AsyncError(_mapException(e), st),
        loadingPhase: () => null,
      );
    }
  }

  /// 將例外映射為對應的 [FetchException]。
  ///
  /// [error] 為 Repository 或 Service 層拋出的例外物件，會依照類型對應至 [FetchErrorType]。
  ///
  /// 回傳包含錯誤類型（與可選 HTTP 狀態碼）的 [FetchException]。
  FetchException _mapException(Exception error) {
    if (error is TimeoutException) {
      return const FetchException(errorType: FetchErrorType.timeout);
    }
    if (error is ApiServiceException) {
      if (error.isRetryable) {
        return FetchException(
          errorType: FetchErrorType.serverUnavailable,
          statusCode: error.statusCode,
        );
      }
      return const FetchException(errorType: FetchErrorType.apiFailed);
    }
    if (error is AppError) {
      return FetchException(
        errorType: switch (error.type) {
          AppErrorType.serverError => FetchErrorType.serverError,
          AppErrorType.network => FetchErrorType.networkError,
          AppErrorType.timeout => FetchErrorType.timeout,
          _ => FetchErrorType.unknown,
        },
      );
    }
    return const FetchException(errorType: FetchErrorType.unknown);
  }

  /// 重設擷取結果與錯誤訊息，保留目前的 blogUrl。
  void reset() {
    state = BlogInputState(blogUrl: state.blogUrl);
  }
}
