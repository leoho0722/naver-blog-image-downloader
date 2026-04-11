## Why

下載流程需要一個視覺化的進度頁面，讓使用者了解目前下載狀態。此頁面顯示圓形進度指示器、完成數與總數文字、下載狀態訊息，並在下載完成後自動導航至照片瀏覽頁。若有下載失敗的照片，也需明確顯示失敗數量。

## What Changes

- 在 `lib/ui/download/widgets/download_view.dart` 中實作 `DownloadView` Widget
- 提供帶有 value 的 CircularProgressIndicator 顯示下載進度
- 顯示完成數/總數的文字計數
- 顯示下載狀態（下載中/下載完成）
- 下載完成後自動導航至照片瀏覽頁
- 當有下載失敗的照片時顯示失敗數量

## Capabilities

### New Capabilities

- `download-view`: Download 頁面 UI 元件，包含進度指示器、計數文字、狀態訊息、失敗數量與自動導航

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/ui/download/widgets/download_view.dart`
- 依賴：S020（DownloadViewModel）
- 此為下載流程的 UI 呈現，連接 BlogInput 頁面與 PhotoGallery 頁面
