## Context

設定頁面讓使用者查看並管理快取儲存空間。`SettingsViewModel` 繼承 `ChangeNotifier`，透過 `CacheRepository` 取得快取資訊（總大小、各 Blog metadata），並提供手動清除功能。快取大小以人類可讀格式（如 "150.3 MB"）呈現。

## Goals / Non-Goals

**Goals:**

- 實作快取資訊載入，包含 `totalCacheSize` 與 `allMetadata`
- 實作 `formattedCacheSize` getter，將 bytes 轉換為人類可讀字串
- 實作全部快取清除（`clearAllCache`）
- 實作指定 Blog 快取清除（`clearBlogCache`）

**Non-Goals:**

- 不實作快取大小限制設定的 UI 調整
- 不處理應用程式版本資訊顯示
- 不實作主題切換功能

## Decisions

### 快取資訊載入策略

`loadCacheInfo()` 方法同時呼叫 `CacheRepository.totalCacheSize()` 與 `CacheRepository.allMetadata()`，將結果分別存入 `_totalCacheSize`（int, bytes）與 `_allMetadata`（List）。載入過程使用 `_isLoading` 旗標防止重複呼叫。

### 快取大小格式化

`formattedCacheSize` getter 根據 `_totalCacheSize` 的大小自動選擇適當的單位（B、KB、MB、GB），保留一位小數。例如：0 bytes 顯示 "0 B"，1536 bytes 顯示 "1.5 KB"，157286400 bytes 顯示 "150.0 MB"。

### 清除後自動重新載入

`clearAllCache()` 與 `clearBlogCache()` 在清除操作完成後，自動呼叫 `loadCacheInfo()` 重新載入快取資訊，確保 UI 即時反映最新狀態。

## Risks / Trade-offs

- [風險] `totalCacheSize()` 需遍歷所有快取檔案計算大小，在大量檔案時可能稍慢 → 預期規模下可接受
- [取捨] 清除後自動重新載入增加一次 I/O 操作 → 確保 UI 一致性，使用者體驗優先
