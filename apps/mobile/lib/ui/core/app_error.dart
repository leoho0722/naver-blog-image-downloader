/// 錯誤類型列舉，區分錯誤的來源與性質。
enum AppErrorType {
  /// 網路相關錯誤（如連線逾時、無網路）。
  network,

  /// 資料解析錯誤（如 JSON 格式不符預期）。
  parsing,

  /// 操作逾時錯誤（如輪詢超過上限）。
  timeout,

  /// 相簿儲存錯誤（如儲存至相簿失敗）。
  gallery,

  /// 伺服器端處理錯誤（如任務處理失敗）。
  serverError,

  /// App 圖示切換錯誤（如原生平台切換圖示失敗）。
  appIcon,

  /// 無法歸類的未知錯誤。
  unknown,
}

/// 應用程式自訂例外，封裝錯誤類型與描述訊息。
///
/// 實作 [Exception] 介面，可與 [Result.error] 搭配使用。
class AppError implements Exception {
  /// 建立 [AppError]。
  ///
  /// - [type]：指定錯誤類型，用於判斷錯誤來源。
  /// - [message]：使用者可讀的錯誤描述，供 UI 顯示或日誌紀錄使用。
  const AppError({required this.type, required this.message});

  /// 錯誤類型，用於判斷錯誤來源。
  final AppErrorType type;

  /// 錯誤描述訊息，供 UI 顯示或日誌紀錄使用。
  final String message;

  /// 回傳此錯誤的字串表示，格式為 `AppError(<type>: <message>)`。
  @override
  String toString() => 'AppError(${type.name}: $message)';
}
