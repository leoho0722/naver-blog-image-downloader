import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'log_service.g.dart';

/// LogService 的 Riverpod provider（App 級單例）。
///
/// [ref] 為 Riverpod 的依賴參照。
/// 回傳以預設 [FirebaseFirestore] 實例建立的 [LogService]。
@Riverpod(keepAlive: true)
LogService logService(Ref ref) => LogService();

/// Firestore 操作 log 寫入服務，負責將結構化日誌文件寫入使用者的 Firestore 子集合。
///
/// 所有寫入操作皆以 try-catch 包覆，確保 Firestore 的異常不會影響 App 正常運作。
class LogService {
  /// 建立 [LogService]。
  ///
  /// - [firestore]：可選的 [FirebaseFirestore] 實例，未提供時使用
  ///   [FirebaseFirestore.instance]；測試時可注入 mock。
  LogService({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  /// 底層的 [FirebaseFirestore] 實例，負責實際的文件寫入操作。
  final FirebaseFirestore _firestore;

  /// 將一筆結構化日誌寫入 Firestore 的 `users/{userId}/logs/{auto-id}` 路徑。
  ///
  /// 文件結構為：
  /// ```json
  /// {
  ///   "type": "<type>",
  ///   "timestamp": FieldValue.serverTimestamp(),
  ///   "data": { ... },
  ///   "deviceInfo": { ... }   // 選填
  /// }
  /// ```
  ///
  /// - [userId]：Firebase Auth 的使用者 UID，作為 Firestore 文件路徑的一部分。
  /// - [type]：日誌類型字串（如 `fetch_photos`、`download`、`error` 等）。
  /// - [data]：日誌的附加資料，以 key-value 形式傳入。
  /// - [deviceInfo]：裝置資訊（選填），包含平台、OS 版本與機型。
  ///
  /// 所有例外皆靜默處理，僅輸出 debug 訊息，不會拋出例外。
  Future<void> writeLog({
    required String userId,
    required String type,
    required Map<String, dynamic> data,
    Map<String, dynamic>? deviceInfo,
  }) async {
    try {
      final doc = <String, dynamic>{
        'type': type,
        'timestamp': FieldValue.serverTimestamp(),
        'data': data,
        'deviceInfo': ?deviceInfo,
      };
      await _firestore
          .collection('users')
          .doc(userId)
          .collection('logs')
          .add(doc);
    } on Exception catch (e) {
      debugPrint('[LogService] writeLog 失敗：$e');
    }
  }
}
