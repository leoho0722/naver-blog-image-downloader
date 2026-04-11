## Problem

當 Lambda API 回傳 `status: "failed"` 錯誤時，原始 JSON 回應（含 unicode 轉義字元如 `\u7b49`）直接以紅色 Text 顯示在 BlogInputView 畫面上，使用者無法閱讀也無法理解錯誤內容。

## Root Cause

錯誤傳遞路徑中缺乏人性化處理：
1. `PhotoRepository.fetchPhotos()` 將 `errors` 陣列直接 `join('; ')` 組成 `AppError.message`
2. `BlogInputViewModel._humanReadableError()` 未處理 `AppError` 類型，fallback 到 `error.toString()` 輸出 `'AppError(serverError: 原始JSON)'`
3. `BlogInputView` 將 `errorMessage` 直接以紅色 `Text` widget 顯示在畫面上

## Proposed Solution

1. **ViewModel** — `_humanReadableError()` 新增 `AppError` 判斷，依 `AppErrorType` 回傳人性化中文訊息
2. **View** — 錯誤訊息從紅色 Text 改為 AlertDialog 呈現，在 listener 中偵測 errorMessage 變化並彈出 Dialog

## Success Criteria

- Lambda 回傳錯誤時，畫面不再顯示原始 JSON / unicode 轉義
- 改以 AlertDialog 顯示人性化中文錯誤訊息
- Dialog 關閉後回到正常輸入狀態

## Impact

- Affected specs: `blog-input-view`（錯誤顯示方式變更）、`blog-input-viewmodel`（錯誤訊息格式變更）
- Affected code:
  - `lib/ui/blog_input/view_model/blog_input_view_model.dart`
  - `lib/ui/blog_input/widgets/blog_input_view.dart`
