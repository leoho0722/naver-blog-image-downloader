## 1. ViewModel 錯誤訊息人性化

- [x] 1.1 `_humanReadableError()` 新增 AppError 判斷，依 AppErrorType 回傳人性化訊息（Human-readable error messages，ViewModel 依 AppErrorType 回傳人性化訊息）

## 2. View 錯誤顯示改為 Dialog

- [x] [P] 2.1 `_onViewModelChanged` 新增 errorMessage 偵測，彈出 AlertDialog（Error message displayed，錯誤以 AlertDialog 呈現）
- [x] [P] 2.2 移除 build 中的紅色 Text 錯誤顯示 widget

## 3. 驗證

- [x] 3.1 執行 `flutter analyze` + `dart format .`
- [x] 3.2 執行 `flutter test test/ui/` 確認所有測試通過
