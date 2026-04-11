## Why

S014 建立了快取基礎 CRUD，但缺少容量管理機制。若使用者持續下載不同 Blog 的照片，快取將無限成長，佔用過多裝置儲存空間。需要自動淘汰策略控制快取大小，以及手動清除功能讓使用者主動管理快取。

## What Changes

- 擴充 `lib/data/repositories/cache_repository.dart`，在 `CacheRepository` 中新增以下方法：
  - `markAsSavedToGallery(String blogId)` — 標記指定 Blog 的照片已儲存至相簿
  - `totalCacheSize()` — 計算目前快取總大小（bytes）
  - `evictIfNeeded()` — 當快取超過 300MB 軟性閥值時，優先清除已儲存至相簿的最舊 Blog
  - `clearAll()` — 清除所有快取檔案與 metadata
  - `clearBlog(String blogId)` — 清除指定 Blog 的快取檔案與 metadata
- 定義 `_softLimit` 常數為 300MB

## Capabilities

### New Capabilities

- `cache-eviction`: 快取容量管理，包含 300MB 軟性閥值自動淘汰策略、手動清除功能、相簿儲存標記

### Modified Capabilities

（無）

## Impact

- 擴充檔案：`lib/data/repositories/cache_repository.dart`
- 依賴 S014（CacheRepository 基礎）
- S017（downloadAllToCache）在下載前呼叫 `evictIfNeeded()` 確保磁碟空間充足
