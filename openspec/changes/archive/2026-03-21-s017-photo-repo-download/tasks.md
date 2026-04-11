## 1. Cache eviction before download（下載前快取淘汰）

- [x] 1.1 在 `PhotoRepository` 的 `downloadAllToCache` 方法開頭呼叫 `_cacheRepository.evictIfNeeded()` 確保磁碟空間充足（Cache eviction before download）
- [x] 1.2 撰寫單元測試驗證 `evictIfNeeded` 在下載前被呼叫

## 2. Parallel download with concurrency limit（並行下載信號量模式）

- [x] 2.1 實作 `downloadAllToCache` 方法的並行下載框架，使用信號量模式限制最多 4 條並行下載（Parallel download with concurrency limit）
- [x] 2.2 撰寫單元測試驗證並行度不超過 4，以及少於 4 張照片時全部並行

## 3. Cache skip logic（快取跳過邏輯）

- [x] 3.1 在每張照片下載前呼叫 `CacheRepository.cachedFile(filename, blogId)` 檢查是否已快取，已存在則跳過並累加 skippedCount（Cache skip logic）
- [x] 3.2 撰寫單元測試驗證已快取檔案被跳過、未快取檔案進行下載

## 4. Download and store flow（快取跳過邏輯）

- [x] 4.1 對未快取的照片呼叫 `FileDownloadService.download(url)` 取得臨時檔案，再呼叫 `CacheRepository.storeFile(tempFile, filename, blogId)` 存入快取（Download and store flow）
- [x] 4.2 撰寫單元測試驗證下載與儲存流程

## 5. Progress callback（進度回呼設計）

- [x] 5.1 在每張照片處理完成後（成功、失敗或跳過）觸發 `onProgress(completed, total)` 回呼（Progress callback）
- [x] 5.2 撰寫單元測試驗證回呼次數與參數正確、以及未提供回呼時不報錯

## 6. Single failure does not abort batch（容錯與結果聚合）

- [x] 6.1 使用 try-catch 捕獲單張照片的下載/儲存錯誤，記錄錯誤訊息並繼續處理其餘照片（Single failure does not abort batch）
- [x] 6.2 撰寫單元測試驗證單一失敗不影響其他照片的下載

## 7. Metadata update after completion（Metadata 更新時機）

- [x] 7.1 所有照片處理完成後呼叫 `CacheRepository.updateMetadata` 更新 `BlogCacheMetadata`，記錄下載時間與成功快取的檔案列表（Metadata update after completion）
- [x] 7.2 撰寫單元測試驗證即使部分失敗也會更新 metadata

## 8. DownloadBatchResult return value（容錯與結果聚合）

- [x] 8.1 聚合 `successCount`、`failureCount`、`skippedCount`、`errors` 建構 `DownloadBatchResult` 並回傳（DownloadBatchResult return value）
- [x] 8.2 撰寫單元測試驗證全部成功與混合結果兩種情境
