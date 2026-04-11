## Context

S014 的 `CacheRepository` 提供了磁碟快取的基礎 CRUD 操作，但未限制快取大小。本變更擴充 `CacheRepository`，加入 300MB 軟性閥值的自動淘汰策略與手動清除功能，確保快取不會無限成長。

## Goals / Non-Goals

**Goals:**

- 設定 300MB 軟性快取閥值
- 實作自動淘汰策略，優先清除已儲存至相簿的最舊 Blog
- 提供手動清除功能（全部清除/單一 Blog 清除）
- 提供 `markAsSavedToGallery` 方法標記 Blog 照片已存入相簿

**Non-Goals:**

- 不實作硬性閥值限制（允許暫時超過 300MB）
- 不實作 LRU 或 LFU 等複雜淘汰算法
- 不負責相簿儲存操作本身（屬於 S018）

## Decisions

### 300MB 軟性閥值策略

設定 `_softLimit = 300 * 1024 * 1024`（300MB）為軟性閥值。`evictIfNeeded()` 在快取總大小超過此閥值時觸發淘汰，但不會阻擋正在進行的下載。淘汰僅在下載批次開始前呼叫，不會中斷進行中的操作。

### 淘汰優先序

淘汰策略按以下優先序清除快取：
1. 已標記 `isSavedToGallery` 的 Blog，依 `createdAt` 升序排列（最舊的先清除）
2. 若清除所有已儲存至相簿的 Blog 後仍超過閥值，不再進一步清除（保護尚未儲存的快取）

### 手動清除實作

`clearAll()` 刪除整個 `blogs/` 目錄並清空 `_metadataStore`，同時清除 `shared_preferences` 中的 metadata。`clearBlog(String blogId)` 僅刪除指定 Blog 的目錄與對應的 metadata 項目。

### 快取大小計算

`totalCacheSize()` 遞迴遍歷 `blogs/` 目錄下所有檔案，累加 `File.lengthSync()` 取得總大小。此方法開銷隨檔案數量增長，但在預期使用場景（數十個 Blog、每個數百張照片）下可接受。

## Risks / Trade-offs

- [取捨] 軟性閥值允許暫時超標 → 避免在下載過程中突然中斷，使用者體驗優先
- [風險] `totalCacheSize()` 的檔案系統遍歷可能在大量檔案時變慢 → 預期規模下可接受，未來可考慮快取大小計數器
- [取捨] 僅淘汰已存入相簿的 Blog → 保護使用者尚未儲存的下載成果，即使超過閥值也不清除
