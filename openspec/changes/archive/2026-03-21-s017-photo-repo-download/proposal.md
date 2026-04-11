## Why

取得照片列表後，使用者需要將照片批次下載至本地快取。`PhotoRepository.downloadAllToCache` 提供並行下載能力，支援最多 4 條並行下載、跳過已快取檔案、進度回呼、以及單一失敗不中斷整批下載的容錯機制，確保下載體驗流暢且可靠。

## What Changes

- 擴充 `lib/data/repositories/photo_repository.dart`，在既有 `PhotoRepository` 類別上新增 `downloadAllToCache` 方法
- `PhotoRepository.downloadAllToCache` 功能：
  - 接受 `List<PhotoEntity>`、`String blogId`、以及進度回呼 `void Function(int completed, int total)`
  - 最多 4 條並行下載（使用信號量模式）
  - 每張照片下載前先檢查是否已快取，已快取則跳過
  - 透過 `FileDownloadService` 下載檔案，再透過 `CacheRepository.storeFile` 存入快取
  - 全部完成後更新 `BlogCacheMetadata`
  - 單一下載失敗不中斷其他下載
  - 回傳 `DownloadBatchResult`，包含成功數、失敗數、跳過數與錯誤列表

## Capabilities

### New Capabilities

- `photo-repo-download`: PhotoRepository.downloadAllToCache — 並行下載、快取跳過、進度回呼、容錯批次處理

### Modified Capabilities

（無）

## Impact

- 修改檔案：`lib/data/repositories/photo_repository.dart`
- 依賴 S011（FileDownloadService）、S014（CacheRepository）、S016（PhotoRepository 基礎）、S009（DownloadBatchResult）
- S018（saveToGalleryFromCache）依賴此方法先將照片下載至快取
