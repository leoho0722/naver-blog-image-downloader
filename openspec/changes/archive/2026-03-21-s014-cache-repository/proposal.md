## Why

目前專案尚未建立磁碟快取層。照片下載後需要暫存在本地磁碟，以支援斷點續傳、離線瀏覽、以及批次存入相簿等功能。`CacheRepository` 是快取子系統的基礎，負責 CRUD 操作、metadata 持久化、以 SHA-256 產生 blogId、以及判斷 Blog 是否已完整快取。

## What Changes

- 新增 `lib/data/repositories/cache_repository.dart`，實作 `CacheRepository` 類別
- 新增 `test/data/repositories/cache_repository_test.dart`，涵蓋所有公開方法的單元測試
- `CacheRepository` 提供以下核心功能：
  - `blogId(String blogUrl)` — 以 SHA-256 前 16 碼為 Blog URL 產生唯一識別碼
  - `cacheDirectory(String blogId)` — 取得或建立指定 Blog 的快取目錄
  - `storeFile(File tempFile, String filename, String blogId)` — 將臨時檔案搬入快取
  - `cachedFile(String filename, String blogId)` — 查詢已快取檔案
  - `isBlogFullyCached(String blogId, List<String> expectedFilenames)` — 判斷 Blog 是否已完整快取
  - `updateMetadata(BlogCacheMetadata metadata)` — 更新 metadata 並持久化
  - `metadata(String blogId)` / `allMetadata()` — 讀取 metadata

## Capabilities

### New Capabilities

- `cache-repository`: 磁碟快取 CRUD 操作、metadata 持久化、SHA-256 blogId 產生、Blog 完整快取檢查

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/data/repositories/cache_repository.dart`、`test/data/repositories/cache_repository_test.dart`
- 依賴 S008（BlogCacheMetadata 模型）
- 此為快取子系統基礎，S015（快取清除策略）與 S016-S018（PhotoRepository）均依賴於此
