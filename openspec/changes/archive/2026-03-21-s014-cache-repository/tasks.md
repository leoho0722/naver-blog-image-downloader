## 1. SHA-256 blogId generation（SHA-256 blogId 產生策略）

- [x] 1.1 在 `lib/data/repositories/cache_repository.dart` 建立 `CacheRepository` 類別，實作 `blogId(String blogUrl)` 方法，使用 `crypto` 套件的 `sha256.convert()` 對 URL 進行 hash，回傳前 16 碼十六進制字串（SHA-256 blogId generation）
- [x] 1.2 在 `test/data/repositories/cache_repository_test.dart` 為 `blogId` 撰寫單元測試，驗證相同 URL 產生一致結果、不同 URL 產生不同結果

## 2. Lazy initialization（延遲初始化模式）

- [x] 2.1 實作 `_ensureInitialized()` 私有方法，使用 `path_provider` 取得應用程式快取目錄，並從 `shared_preferences` 載入已持久化的 metadata（Lazy initialization）
- [x] 2.2 加入 `_initialized` 旗標確保初始化僅執行一次
- [x] 2.3 撰寫單元測試驗證首次呼叫觸發初始化、後續呼叫跳過初始化

## 3. Cache directory management（檔案儲存結構）

- [x] 3.1 實作 `cacheDirectory(String blogId)` 方法，路徑為 `<appCacheDir>/blogs/<blogId>`，不存在時遞迴建立（Cache directory management）
- [x] 3.2 撰寫單元測試驗證目錄建立與重複存取

## 4. File storage and retrieval（檔案儲存結構）

- [x] 4.1 實作 `storeFile(File tempFile, String filename, String blogId)` 方法，使用 `File.copy()` 將臨時檔案複製到快取目錄（File storage）
- [x] 4.2 實作 `cachedFile(String filename, String blogId)` 方法，檢查檔案是否存在並回傳 `File?`（Cached file retrieval）
- [x] 4.3 撰寫單元測試驗證檔案儲存、覆寫、查詢存在與不存在的檔案

## 5. Blog fully cached check（檔案儲存結構）

- [x] 5.1 實作 `isBlogFullyCached(String blogId, List<String> expectedFilenames)` 方法，比對快取目錄中是否包含所有預期檔案（Blog fully cached check）
- [x] 5.2 撰寫單元測試驗證全部快取、部分快取、空列表三種情境

## 6. Metadata persistence and query（Metadata 持久化策略）

- [x] 6.1 實作 `updateMetadata(BlogCacheMetadata metadata)` 方法，更新 `_metadataStore` 並以 JSON 格式寫入 `shared_preferences`（Metadata persistence）
- [x] 6.2 實作 `metadata(String blogId)` 與 `allMetadata()` 查詢方法（Metadata query）
- [x] 6.3 撰寫單元測試驗證 metadata 儲存、持久化後重新載入、查詢存在/不存在的 metadata
