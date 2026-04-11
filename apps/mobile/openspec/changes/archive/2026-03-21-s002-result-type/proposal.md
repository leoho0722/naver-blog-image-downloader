## Why

本專案採用 MVVM 架構，ViewModel 與 Repository 層之間需要一個統一的錯誤處理機制。透過 `Result<T>` sealed class 封裝成功與失敗狀態，可避免在整個 codebase 中散落的 try-catch 區塊，使錯誤處理更具可預測性與可組合性。同時定義 `AppError` 自訂例外類別，提供結構化的錯誤資訊（錯誤類型、訊息），便於 UI 層統一呈現錯誤狀態。

## What Changes

- 在 `lib/ui/core/result.dart` 中實作 `Result<T>` sealed class，包含 `Ok<T>` 與 `Error<T>` 兩個子類別
- 在 `lib/ui/core/app_error.dart` 中實作 `AppError` 自訂例外類別，包含錯誤類型列舉與錯誤訊息

## Capabilities

### New Capabilities

- `result-type`: Result<T> sealed class 與 AppError 自訂例外的定義與實作

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/ui/core/result.dart`、`lib/ui/core/app_error.dart`
- 依賴：S001（專案依賴與目錄骨架）
- 此為基礎型別定義，後續 Repository 層與 ViewModel 層均依賴於此
