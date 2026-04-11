import 'dart:async';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../services/auth_service.dart';
import '../services/crashlytics_service.dart';
import '../services/log_service.dart';

part 'log_repository.g.dart';

/// LogRepository 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照，用於取得各 Service 的實例。
/// 回傳注入所有依賴的 [LogRepository] 實例。
@Riverpod(keepAlive: true)
LogRepository logRepository(Ref ref) {
  return LogRepository(
    authService: ref.watch(authServiceProvider),
    logService: ref.watch(logServiceProvider),
    crashlyticsService: ref.watch(crashlyticsServiceProvider),
  );
}

/// 日誌 Repository，負責收集裝置資訊並透過 [LogService] 將操作紀錄寫入 Firestore。
///
/// 作為 Domain 與 Data 層之間的橋梁，將 [AuthService]、[LogService] 與
/// [CrashlyticsService] 的操作組合為上層可直接使用的日誌記錄用例。
/// 所有公開方法皆為 fire-and-forget 模式（使用 [unawaited]），不阻塞呼叫端。
class LogRepository {
  /// 建立 [LogRepository]，需注入所有依賴的服務。
  ///
  /// - [authService]：身份驗證服務，用於取得目前使用者的 UID。
  /// - [logService]：Firestore 日誌寫入服務，負責實際的文件寫入。
  /// - [crashlyticsService]：Crashlytics 服務，用於 [logError] 時同步回報非致命錯誤。
  LogRepository({
    required AuthService authService,
    required LogService logService,
    required CrashlyticsService crashlyticsService,
  }) : _authService = authService,
       _logService = logService,
       _crashlyticsService = crashlyticsService;

  /// 身份驗證服務，用於取得目前使用者的 UID。
  final AuthService _authService;

  /// Firestore 日誌寫入服務，負責實際的文件寫入。
  final LogService _logService;

  /// Crashlytics 服務，用於 [logError] 時同步回報非致命錯誤。
  final CrashlyticsService _crashlyticsService;

  /// 裝置資訊快取，首次取得後不再重複查詢。
  Map<String, dynamic>? _deviceInfoCache;

  /// 取得裝置資訊（含平台、OS 版本與機型），首次呼叫後快取結果。
  ///
  /// iOS 裝置回傳 `platform`、`osVersion`、`model`；
  /// Android 裝置回傳 `platform`、`osVersion`、`model`。
  /// 取得失敗時回傳僅含 `platform` 的 fallback 資料。
  ///
  /// 回傳裝置資訊的 [Map]，包含平台相關的 key-value 對。
  Future<Map<String, dynamic>> _getDeviceInfo() async {
    if (_deviceInfoCache != null) return _deviceInfoCache!;
    try {
      final plugin = DeviceInfoPlugin();
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        final info = await plugin.iosInfo;
        _deviceInfoCache = {
          'platform': 'ios',
          'osVersion': info.systemVersion,
          'model': info.utsname.machine,
        };
      } else {
        final info = await plugin.androidInfo;
        _deviceInfoCache = {
          'platform': 'android',
          'osVersion': info.version.release,
          'model': info.model,
        };
      }
    } on Exception catch (e) {
      debugPrint('[LogRepository] 裝置資訊取得失敗：$e');
      _deviceInfoCache = {'platform': defaultTargetPlatform.name};
    }
    return _deviceInfoCache!;
  }

  /// 內部日誌寫入方法，取得使用者 UID 與裝置資訊後委派給 [LogService.writeLog]。
  ///
  /// - [type]：日誌類型字串。
  /// - [data]：日誌的附加資料。
  ///
  /// 若使用者尚未登入（[AuthService.currentUserId] 為 `null`），則靜默跳過不寫入。
  /// 整段邏輯以 try-catch 包覆，所有例外皆靜默處理，僅輸出 debug 訊息。
  Future<void> _log(String type, Map<String, dynamic> data) async {
    try {
      final userId = _authService.currentUserId;
      if (userId == null) return;
      final deviceInfo = await _getDeviceInfo();
      await _logService.writeLog(
        userId: userId,
        type: type,
        data: data,
        deviceInfo: deviceInfo,
      );
    } on Exception catch (e) {
      debugPrint('[LogRepository] log 失敗：$e');
    }
  }

  /// 記錄照片擷取操作的日誌（類型：`fetch_photos`）。
  ///
  /// - [blogUrl]：擷取的 Naver Blog 完整網址。
  /// - [blogId]：Blog 的唯一識別碼（URL 的 SHA-256 前 16 碼）。
  /// - [resultCount]：成功取得的照片數量。
  /// - [isFromCache]：是否從本機快取取得結果。
  /// - [totalImages]：伺服器端偵測到的照片總數（選填）。
  /// - [failureDownloads]：伺服器端下載失敗的數量（選填）。
  /// - [durationMs]：操作耗時（毫秒）。
  void logFetchPhotos({
    required String blogUrl,
    required String blogId,
    required int resultCount,
    required bool isFromCache,
    int? totalImages,
    int? failureDownloads,
    required int durationMs,
  }) {
    unawaited(
      _log('fetch_photos', {
        'blogUrl': blogUrl,
        'blogId': blogId,
        'resultCount': resultCount,
        'isFromCache': isFromCache,
        'totalImages': ?totalImages,
        'failureDownloads': ?failureDownloads,
        'durationMs': durationMs,
      }),
    );
  }

  /// 記錄照片擷取失敗的日誌（類型：`fetch_photos_error`）。
  ///
  /// - [blogUrl]：擷取失敗的 Naver Blog 完整網址。
  /// - [errorType]：錯誤類型字串（如 `timeout`、`serverError` 等）。
  /// - [durationMs]：操作耗時（毫秒）。
  void logFetchPhotosError({
    required String blogUrl,
    required String errorType,
    required int durationMs,
  }) {
    unawaited(
      _log('fetch_photos_error', {
        'blogUrl': blogUrl,
        'errorType': errorType,
        'durationMs': durationMs,
      }),
    );
  }

  /// 記錄照片批次下載的日誌（類型：`download`）。
  ///
  /// - [blogId]：Blog 的唯一識別碼。
  /// - [successCount]：下載成功的數量。
  /// - [failedCount]：下載失敗的數量。
  /// - [skippedCount]：因已快取而跳過的數量。
  /// - [totalCount]：本批次照片總數。
  /// - [durationMs]：操作耗時（毫秒）。
  void logDownload({
    required String blogId,
    required int successCount,
    required int failedCount,
    required int skippedCount,
    required int totalCount,
    required int durationMs,
  }) {
    unawaited(
      _log('download', {
        'blogId': blogId,
        'successCount': successCount,
        'failedCount': failedCount,
        'skippedCount': skippedCount,
        'totalCount': totalCount,
        'durationMs': durationMs,
      }),
    );
  }

  /// 記錄照片儲存至相簿的日誌（類型：`save_to_gallery`）。
  ///
  /// - [blogId]：Blog 的唯一識別碼。
  /// - [photoCount]：儲存的照片數量。
  /// - [mode]：儲存模式字串（如 `single`、`batch` 等）。
  void logSaveToGallery({
    required String blogId,
    required int photoCount,
    required String mode,
  }) {
    unawaited(
      _log('save_to_gallery', {
        'blogId': blogId,
        'photoCount': photoCount,
        'mode': mode,
      }),
    );
  }

  /// 記錄快取清除操作的日誌（類型：`clear_cache`）。
  ///
  /// - [previousSizeBytes]：清除前的快取大小（位元組）。
  void logClearCache({required int previousSizeBytes}) {
    unawaited(_log('clear_cache', {'previousSizeBytes': previousSizeBytes}));
  }

  /// 記錄頁面導航的日誌（類型：`page_navigation`）。
  ///
  /// - [screenName]：導航目標畫面的名稱。
  void logPageNavigation({required String screenName}) {
    unawaited(_log('page_navigation', {'screenName': screenName}));
  }

  /// 記錄設定變更的日誌（類型：`settings_change`）。
  ///
  /// - [setting]：變更的設定項目名稱。
  /// - [oldValue]：變更前的值。
  /// - [newValue]：變更後的值。
  void logSettingsChange({
    required String setting,
    required String oldValue,
    required String newValue,
  }) {
    unawaited(
      _log('settings_change', {
        'setting': setting,
        'oldValue': oldValue,
        'newValue': newValue,
      }),
    );
  }

  /// 記錄錯誤的日誌（類型：`error`），並同步回報至 Crashlytics 作為非致命錯誤。
  ///
  /// - [errorType]：錯誤類型字串。
  /// - [message]：錯誤描述訊息。
  /// - [stackTrace]：錯誤發生時的堆疊追蹤字串，超過 500 字元時自動截斷以符合 Firestore 文件大小限制。
  void logError({
    required String errorType,
    required String message,
    required String stackTrace,
  }) {
    // 截斷堆疊追蹤至 500 字元以符合 Firestore 文件大小限制
    final truncatedStack = stackTrace.length > 500
        ? stackTrace.substring(0, 500)
        : stackTrace;
    unawaited(
      _log('error', {
        'errorType': errorType,
        'message': message,
        'stackTrace': truncatedStack,
      }),
    );
    // 同步回報至 Crashlytics 作為非致命錯誤
    _crashlyticsService.recordError(
      Exception('$errorType: $message'),
      StackTrace.fromString(stackTrace),
    );
  }
}
