## 1. FetchResult class defined（FetchResult 抓取結果模型）

- [x] 1.1 在 `lib/data/models/fetch_result.dart` 中實作 FetchResult class defined：定義 `FetchResult` 類別，所有欄位宣告為 `final`
- [x] 1.2 宣告必填欄位：`photos`（List\<PhotoEntity\>）、`blogId`（String）、`isFullyCached`（bool）

## 2. DownloadBatchResult class defined（DownloadBatchResult 批次下載結果模型）

- [x] 2.1 在 `lib/data/models/download_batch_result.dart` 中實作 DownloadBatchResult class defined：定義 `DownloadBatchResult` 類別，所有欄位宣告為 `final`
- [x] 2.2 宣告必填欄位：`successCount`（int）、`failedPhotos`（List\<PhotoEntity\>）
- [x] 2.3 實作 `isAllSuccessful` getter，當 `failedPhotos` 為空時回傳 `true`
