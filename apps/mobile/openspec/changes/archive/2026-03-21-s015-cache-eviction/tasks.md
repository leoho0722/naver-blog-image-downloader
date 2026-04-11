## 1. Gallery save marking（300MB 軟性閥值策略）

- [x] 1.1 在 `CacheRepository` 新增 `markAsSavedToGallery(String blogId)` 方法，更新對應 `BlogCacheMetadata` 的 `isSavedToGallery` 為 `true` 並持久化（Gallery save marking）
- [x] 1.2 撰寫單元測試驗證標記成功與標記不存在 blogId 的情境

## 2. Total cache size calculation（快取大小計算）

- [x] 2.1 實作 `totalCacheSize()` 方法，遞迴遍歷 `blogs/` 目錄下所有檔案並累加大小（Total cache size calculation）
- [x] 2.2 撰寫單元測試驗證有檔案與空快取兩種情境

## 3. Automatic eviction（淘汰優先序）

- [x] 3.1 在 `CacheRepository` 定義 `_softLimit = 300 * 1024 * 1024` 常數（300MB 軟性閥值策略）
- [x] 3.2 實作 `evictIfNeeded()` 方法，當快取超過 `_softLimit` 時，依 `createdAt` 升序清除 `isSavedToGallery == true` 的 Blog 直到低於閥值（Automatic eviction）
- [x] 3.3 撰寫單元測試驗證低於閥值不淘汰、優先清除已儲存最舊 Blog、無已儲存 Blog 時不淘汰

## 4. Clear all cache（手動清除實作）

- [x] 4.1 實作 `clearAll()` 方法，刪除 `blogs/` 目錄、清空 `_metadataStore`、移除 `shared_preferences` 中的 metadata（Clear all cache）
- [x] 4.2 撰寫單元測試驗證清除成功與空快取時不報錯

## 5. Clear single blog cache（手動清除實作）

- [x] 5.1 實作 `clearBlog(String blogId)` 方法，刪除指定 Blog 目錄與對應 metadata（Clear single blog cache）
- [x] 5.2 撰寫單元測試驗證清除存在的 Blog 與不存在的 blogId
