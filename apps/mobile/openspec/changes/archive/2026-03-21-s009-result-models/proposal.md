## Why

應用程式的照片下載流程分為兩個階段：抓取照片資訊與批次下載照片檔案。每個階段需要對應的結果模型來封裝操作結果。`FetchResult` 封裝照片資訊抓取結果（照片列表、部落格 ID、是否完全快取），`DownloadBatchResult` 封裝批次下載結果（成功數、失敗照片列表、是否全部成功）。這兩個模型讓 ViewModel 層能清楚掌握操作結果並更新 UI 狀態。

## What Changes

- 在 `lib/data/models/fetch_result.dart` 中實作 `FetchResult` 類別
- 在 `lib/data/models/download_batch_result.dart` 中實作 `DownloadBatchResult` 類別

## Capabilities

### New Capabilities

- `result-models`: FetchResult 與 DownloadBatchResult 結果模型的定義

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/models/fetch_result.dart`、`lib/data/models/download_batch_result.dart`
- 依賴：S001（專案依賴與目錄骨架）、S006（PhotoEntity domain model）
- 此為 Repository 層與 ViewModel 層之間的結果傳遞模型，後續 Photo Repository（S016–S018）與 ViewModel（S020–S021）均依賴於此
