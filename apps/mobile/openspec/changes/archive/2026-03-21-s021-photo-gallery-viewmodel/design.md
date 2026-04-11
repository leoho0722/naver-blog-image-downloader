## Context

照片瀏覽頁面是使用者下載完成後的主要互動介面。`PhotoGalleryViewModel` 繼承 `ChangeNotifier`，管理照片清單的呈現與選取操作。它依賴 `PhotoRepository` 進行相簿儲存，依賴 `CacheRepository` 取得快取檔案路徑。選取模式允許使用者批次選擇照片後一次存入相簿。

## Goals / Non-Goals

**Goals:**

- 實作照片清單載入與 Blog 識別碼儲存
- 實作選取模式切換（toggleSelectMode、toggleSelection、selectAll）
- 實作批次儲存至相簿（saveSelectedToGallery、saveAllToGallery）
- 提供快取檔案路徑查詢（cachedFile）

**Non-Goals:**

- 不實作照片縮圖產生邏輯
- 不處理照片排序或篩選
- 不實作 UI Widget

## Decisions

### 選取模式狀態管理

使用 `_isSelectMode` 旗標控制選取模式的開關。進入選取模式時，使用者可點選個別照片或全選。離開選取模式時，清空 `_selectedIds` 集合。

### 選取狀態以 Set 管理

使用 `Set<String>` 儲存已選取的 photoId。`toggleSelection` 使用 `add/remove` 操作切換個別照片的選取狀態。`selectAll` 根據目前是否全選來決定全選或全部取消。

### 相簿儲存委託 PhotoRepository

`saveSelectedToGallery` 與 `saveAllToGallery` 均委託 `PhotoRepository.saveToGalleryFromCache` 執行實際的相簿寫入操作，ViewModel 僅負責管理 `_isSaving` 狀態與選取清單的篩選。

### 快取檔案路徑委託 CacheRepository

`cachedFile` 方法委託 `CacheRepository.cachedFile` 查詢指定照片的本地快取檔案，回傳 `Future<File?>`。

## Risks / Trade-offs

- [風險] 大量照片全選後儲存可能耗時較長 → `_isSaving` 旗標防止重複操作，UI 層應顯示進度指示
- [取捨] 選取狀態以 photoId 管理而非索引 → 更穩定，不受清單排序變動影響
