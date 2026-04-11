## Why

照片下載至本地快取後，使用者需要將照片儲存至裝置相簿以便永久保存。`PhotoRepository.saveToGalleryFromCache` 負責從快取讀取檔案、透過 `GalleryService` 存入系統相簿、並在 metadata 中標記為已儲存，確保後續快取淘汰策略能正確識別可清除的 Blog。

## What Changes

- 擴充 `lib/data/repositories/photo_repository.dart`，在既有 `PhotoRepository` 類別上新增 `saveToGalleryFromCache` 方法
- `PhotoRepository.saveToGalleryFromCache(String blogId)` 功能：
  - 從 `CacheRepository` 讀取指定 Blog 的所有快取檔案
  - 逐一透過 `GalleryService` 存入系統相簿
  - 完成後呼叫 `CacheRepository.markAsSavedToGallery(blogId)` 更新 metadata
  - 回傳 `Result<void>`，失敗時包含錯誤訊息

## Capabilities

### New Capabilities

- `photo-repo-save`: PhotoRepository.saveToGalleryFromCache — 快取讀取、相簿儲存、metadata 標記

### Modified Capabilities

（無）

## Impact

- 修改檔案：`lib/data/repositories/photo_repository.dart`
- 依賴 S012（GalleryService）、S014（CacheRepository）、S015（markAsSavedToGallery）、S016（PhotoRepository 基礎）
- ViewModel 層（S020-S021）將呼叫此方法完成照片儲存流程
