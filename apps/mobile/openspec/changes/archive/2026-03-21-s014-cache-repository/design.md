## Context

`CacheRepository` 是快取子系統的唯一存取介面（Single Source of Truth），負責管理本地磁碟上的照片檔案快取與對應的 `BlogCacheMetadata`。其設計採用延遲初始化模式，首次操作時才取得應用程式快取目錄並載入已持久化的 metadata。

## Goals / Non-Goals

**Goals:**

- 實作磁碟快取的完整 CRUD 生命週期
- 使用 SHA-256 前 16 碼作為 blogId，確保 URL 到目錄名稱的映射無碰撞風險
- 將 metadata 以 JSON 格式持久化至 `shared_preferences`
- 提供 `isBlogFullyCached` 方法以支援斷點續傳判斷

**Non-Goals:**

- 不實作快取容量限制或淘汰策略（屬於 S015）
- 不處理相簿儲存邏輯（屬於 S018）
- 不處理檔案下載（屬於 S011/S017）

## Decisions

### SHA-256 blogId 產生策略

使用 `crypto` 套件的 `sha256.convert()` 對 Blog URL 進行 hash，取前 16 碼十六進制字串作為 `blogId`。16 碼 hex 提供 64-bit 空間，對此應用場景碰撞率極低且目錄名稱簡潔。

### 延遲初始化模式

`CacheRepository` 使用 `_initialized` 旗標與 `_ensureInitialized()` 方法實現延遲初始化。所有公開方法在操作前先呼叫 `_ensureInitialized()`。初始化時取得 `path_provider` 的應用程式快取目錄，並從 `shared_preferences` 載入已儲存的 metadata。

### Metadata 持久化策略

`BlogCacheMetadata` 的 `Map<String, BlogCacheMetadata>` 序列化為 JSON 字串，儲存至 `shared_preferences` 的固定 key `cache_metadata`。每次 `updateMetadata` 呼叫時同步寫入，確保即使 App 意外終止也不會遺失最新狀態。

### 檔案儲存結構

快取目錄結構為 `<appCacheDir>/blogs/<blogId>/<filename>`。`storeFile` 使用 `File.copy()` 將臨時檔案複製到快取目錄，而非 `rename()`，以避免跨分區搬移問題。

## Risks / Trade-offs

- [風險] `shared_preferences` 的 JSON 字串長度隨快取數量增長 → 此應用預期同時快取的 Blog 數量有限（<50），JSON 大小可控
- [取捨] 使用 `copy` 而非 `rename` 有額外 I/O 成本 → 確保跨目錄/跨分區操作的相容性
- [風險] 並行呼叫 `_ensureInitialized` 可能重複初始化 → 使用 `Completer` 或 flag guard 防止重入
