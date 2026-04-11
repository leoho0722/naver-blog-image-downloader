import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'crashlytics_service.dart';

part 'auth_service.g.dart';

/// AuthService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳以預設配置建立的 [AuthService] 實例。
@Riverpod(keepAlive: true)
AuthService authService(Ref ref) =>
    AuthService(crashlyticsService: ref.watch(crashlyticsServiceProvider));

/// Firebase 匿名登入服務，負責自動建立與維護使用者身份。
///
/// 使用 Firebase Auth 的匿名登入功能，App 首次啟動時自動建立匿名帳號，
/// Firebase 會自動將 session 持久化至 iOS Keychain / Android EncryptedSharedPreferences。
class AuthService {
  /// 建立 [AuthService]。
  ///
  /// - [auth]：可選的 [FirebaseAuth] 實例，未提供時使用
  ///   [FirebaseAuth.instance]；測試時可注入 mock。
  /// - [crashlyticsService]：用於設定使用者識別碼的 [CrashlyticsService]。
  AuthService({
    FirebaseAuth? auth,
    required CrashlyticsService crashlyticsService,
  }) : _auth = auth ?? FirebaseAuth.instance,
       _crashlyticsService = crashlyticsService;

  /// 底層的 [FirebaseAuth] 實例，負責實際的身份驗證操作。
  final FirebaseAuth _auth;

  /// Crashlytics 服務，用於在登入成功後設定使用者識別碼。
  final CrashlyticsService _crashlyticsService;

  /// 目前已登入使用者的 UID。
  ///
  /// 回傳 Firebase Auth 目前使用者的 UID；若未登入則回傳 `null`。
  String? get currentUserId => _auth.currentUser?.uid;

  /// 確保使用者已完成匿名登入。
  ///
  /// 優先檢查 [FirebaseAuth.currentUser]，若已存在則直接回傳其 UID；
  /// 若尚未登入，則呼叫 [FirebaseAuth.signInAnonymously] 建立匿名帳號。
  /// 登入成功後會透過 [CrashlyticsService.setUserId] 設定使用者識別碼。
  ///
  /// 回傳使用者的 UID 字串；登入失敗時回傳 `null`（靜默處理，僅輸出 debug 訊息）。
  Future<String?> ensureSignedIn() async {
    try {
      final currentUser = _auth.currentUser;
      if (currentUser != null) {
        _crashlyticsService.setUserId(currentUser.uid);
        return currentUser.uid;
      }

      final credential = await _auth.signInAnonymously();
      final uid = credential.user?.uid;
      if (uid != null) {
        _crashlyticsService.setUserId(uid);
      }
      return uid;
    } on Exception catch (e) {
      debugPrint('[AuthService] 匿名登入失敗：$e');
      return null;
    }
  }
}
