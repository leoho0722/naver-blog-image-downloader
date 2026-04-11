## Why

使用者在取得照片清單後，需要觸發批次下載流程。`DownloadViewModel` 負責管理批次下載的執行、追蹤下載進度（completed/total/progress），以及呈現下載結果狀態。此 ViewModel 串接下載頁面 UI 與 `PhotoRepository.downloadAllToCache` 方法。

## What Changes

- 新增 `lib/ui/download/view_model/download_view_model.dart`，實作 `DownloadViewModel` 類別
- 新增 `test/ui/download/download_view_model_test.dart`，涵蓋所有公開方法的單元測試
- `DownloadViewModel` 提供以下核心功能：
  - `startDownload({required List<PhotoEntity> photos, required String blogId})` — 觸發批次下載、追蹤進度、儲存結果
  - `progress` getter — 計算下載進度百分比（completed / total）
  - 曝露 `completed`、`total`、`isDownloading`、`result` 等唯讀屬性

## Capabilities

### New Capabilities

- `download-viewmodel`: 觸發批次下載、追蹤下載進度（completed/total/progress）、下載結果狀態管理

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/ui/download/view_model/download_view_model.dart`、`test/ui/download/download_view_model_test.dart`
- 依賴：S009（DownloadBatchResult）、S017（PhotoRepository.downloadAllToCache）
- 此為下載頁面的核心 ViewModel，UI 層的 DownloadScreen 將依賴於此
