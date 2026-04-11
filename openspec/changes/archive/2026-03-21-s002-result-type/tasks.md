## 1. Result sealed class defined（Result sealed class 設計）

- [x] 1.1 在 `lib/ui/core/result.dart` 中實作 Result sealed class defined：定義 `Result<T>` sealed class，包含 `const` 建構子、`Result.ok` 與 `Result.error` factory constructors
- [x] 1.2 實作 `Ok<T>` final subclass，持有 `T value` 屬性
- [x] 1.3 實作 `Error<T>` final subclass，持有 `Exception error` 屬性

## 2. AppError exception defined（AppError 例外定義）

- [x] 2.1 在 `lib/ui/core/app_error.dart` 中實作 AppError exception defined：定義 `AppErrorType` 列舉（包含 `network`、`parsing`、`unknown`）
- [x] 2.2 實作 `AppError` 類別，實作 `Exception` 介面，包含 `type`（AppErrorType）與 `message`（String）屬性
- [x] 2.3 覆寫 `toString()` 方法，回傳包含錯誤類型與訊息的字串
