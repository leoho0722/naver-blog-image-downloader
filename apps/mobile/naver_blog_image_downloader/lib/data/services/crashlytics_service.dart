import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'crashlytics_service.g.dart';

/// CrashlyticsService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳以預設 [FirebaseCrashlytics] 實例建立的 [CrashlyticsService]。
@Riverpod(keepAlive: true)
CrashlyticsService crashlyticsService(Ref ref) => CrashlyticsService();

/// Firebase Crashlytics 封裝服務，提供錯誤記錄、使用者識別與麵包屑日誌功能。
///
/// 所有方法皆以 try-catch 包覆，確保 Crashlytics 本身的異常不會影響 App 正常運作。
class CrashlyticsService {
  /// 建立 [CrashlyticsService]。
  ///
  /// - [crashlytics]：可選的 [FirebaseCrashlytics] 實例，未提供時使用
  ///   [FirebaseCrashlytics.instance]；測試時可注入 mock。
  CrashlyticsService({FirebaseCrashlytics? crashlytics})
    : _crashlytics = crashlytics ?? FirebaseCrashlytics.instance;

  /// 底層的 [FirebaseCrashlytics] 實例，負責實際的錯誤回報與日誌記錄。
  final FirebaseCrashlytics _crashlytics;

  /// 設定目前使用者的唯一識別碼，用於 Crashlytics Dashboard 追蹤。
  ///
  /// - [uid]：Firebase Auth 的使用者 UID。
  ///
  /// 設定失敗時僅輸出 debug 訊息，不會拋出例外。
  void setUserId(String uid) {
    try {
      _crashlytics.setUserIdentifier(uid);
    } catch (e) {
      debugPrint('[CrashlyticsService] setUserId 失敗：$e');
    }
  }

  /// 記錄非致命或致命錯誤至 Crashlytics。
  ///
  /// - [error]：錯誤物件。
  /// - [stackTrace]：錯誤發生時的堆疊追蹤。
  /// - [fatal]：是否為致命錯誤，預設為 `false`。
  ///
  /// 記錄失敗時僅輸出 debug 訊息，不會拋出例外。
  void recordError(dynamic error, StackTrace stackTrace, {bool fatal = false}) {
    try {
      _crashlytics.recordError(error, stackTrace, fatal: fatal);
    } catch (e) {
      debugPrint('[CrashlyticsService] recordError 失敗：$e');
    }
  }

  /// 記錄麵包屑日誌訊息，用於重現崩潰前的操作路徑。
  ///
  /// - [message]：要記錄的日誌文字。
  ///
  /// 記錄失敗時僅輸出 debug 訊息，不會拋出例外。
  void log(String message) {
    try {
      _crashlytics.log(message);
    } catch (e) {
      debugPrint('[CrashlyticsService] log 失敗：$e');
    }
  }
}
