## Why

應用程式需要在本地快取已下載的部落格照片資訊，以避免重複下載並支援離線瀏覽。`BlogCacheMetadata` 儲存每個部落格的快取元資料，包括部落格識別碼、URL、照片數量、下載時間、是否已儲存至相簿，以及檔案名稱列表。同時提供 JSON 序列化能力以便持久化儲存，以及 `copyWith` 方法用於部分更新。

## What Changes

- 在 `lib/data/models/blog_cache_metadata.dart` 中實作 `BlogCacheMetadata` 類別，包含 JSON 序列化（toJson/fromJson）與 `copyWith` 方法

## Capabilities

### New Capabilities

- `cache-metadata`: BlogCacheMetadata 快取元資料的定義、JSON 序列化與部分更新

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/models/blog_cache_metadata.dart`
- 依賴：S001（專案依賴與目錄骨架）
- 此為快取機制的資料模型，後續 Cache Repository（S014）與 Cache Eviction（S015）均依賴於此
