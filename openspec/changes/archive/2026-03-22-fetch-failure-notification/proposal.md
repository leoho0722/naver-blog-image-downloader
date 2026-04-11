## Why

Lambda API 在 `status=completed` 時可能回傳 `failure_downloads > 0`，代表部分照片擷取失敗。目前 `PhotoRepository.fetchPhotos` 完全忽略 `failureDownloads` 和 `errors` 欄位，使用者無從得知有照片遺漏，導致預期與實際下載數量不符。

## What Changes

- `FetchResult` 新增 `fetchErrors` 欄位，攜帶 Lambda 回傳的錯誤訊息清單
- `PhotoRepository.fetchPhotos` 在 `completed` 分支中，將 `response.errors` 帶入 `FetchResult`
- `BlogInputView` 在導航至下載/瀏覽頁面之前，若 `fetchErrors` 非空則彈出警告對話框，顯示失敗數量與錯誤摘要，使用者可選擇繼續或取消

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `result-models`: `FetchResult` 新增 `fetchErrors` 欄位
- `photo-repo-fetch`: `fetchPhotos` 在 completed 狀態下傳遞 `response.errors` 至 `FetchResult`
- `blog-input-view`: 導航前檢查 `fetchErrors`，非空時顯示警告對話框

## Impact

- 受影響檔案：
  - `lib/data/models/fetch_result.dart`
  - `lib/data/repositories/photo_repository.dart`
  - `lib/ui/blog_input/widgets/blog_input_view.dart`
- 受影響測試：`photo_repository_test.dart`、`blog_input_view_model_test.dart`
- 無 API 變更、無新增依賴
