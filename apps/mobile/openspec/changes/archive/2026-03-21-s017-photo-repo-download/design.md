## Context

使用者透過 `fetchPhotos` 取得照片列表後，需要批次下載至本地快取。`downloadAllToCache` 擴充 `PhotoRepository`，提供並行下載、進度追蹤、已快取跳過、以及容錯機制，確保下載流程高效且穩定。

## Goals / Non-Goals

**Goals:**

- 實作 `downloadAllToCache` 方法，支援最多 4 條並行下載
- 下載前檢查快取，已存在的檔案自動跳過
- 提供進度回呼 `void Function(int completed, int total)` 讓 ViewModel 更新 UI
- 單一檔案下載失敗不中斷整批下載
- 下載完成後更新 `BlogCacheMetadata`
- 回傳 `DownloadBatchResult` 包含成功、失敗、跳過統計

**Non-Goals:**

- 不實作斷點續傳（單檔層級的續傳由 FileDownloadService 處理）
- 不實作下載優先序排列
- 不實作下載取消功能（屬於未來擴充）

## Decisions

### 下載前快取淘汰

`downloadAllToCache` 在開始任何下載之前，先呼叫 `CacheRepository.evictIfNeeded()` 確保磁碟空間充足。此呼叫放在方法最開頭，早於快取檢查與下載操作，避免在磁碟空間不足時進行無謂的下載嘗試。

### 並行下載信號量模式

使用 Dart 的信號量模式限制並行數為 4。具體做法：維護一個長度為 4 的 `List<Future>` 池，每當有 Future 完成就填入新的下載任務。實作上使用 `Stream.fromIterable` 搭配 `asyncMap` 或手動管理 `Future` 池來控制並行度。選擇 4 條並行是平衡下載速度與系統資源的折衷方案。

### 快取跳過邏輯

每張照片在下載前先呼叫 `CacheRepository.cachedFile(filename, blogId)` 檢查是否已存在於快取。若已存在，直接計入跳過數並觸發進度回呼，不進行實際下載。此邏輯支援斷點續傳場景——前次下載中斷後重新呼叫時，已下載的檔案不會重複下載。

### 進度回呼設計

進度回呼 `onProgress(int completed, int total)` 在每張照片完成（無論成功、失敗或跳過）時觸發。`completed` 為已處理數量（包含成功、失敗、跳過），`total` 為照片總數。回呼在主 Isolate 執行，ViewModel 可直接更新 UI。

### 容錯與結果聚合

單一檔案下載失敗時，捕獲例外並記錄錯誤訊息，不中斷其他下載。所有照片處理完成後，聚合統計數據建構 `DownloadBatchResult(successCount, failureCount, skippedCount, errors)`。

### Metadata 更新時機

全部照片處理完成後（無論是否全部成功），呼叫 `CacheRepository.updateMetadata` 更新 `BlogCacheMetadata`，記錄下載時間與檔案列表。即使部分失敗也更新 metadata，以便後續呼叫能正確識別已快取的檔案。

## Risks / Trade-offs

- [取捨] 固定 4 條並行而非動態調整 → 實作簡單，多數場景下表現良好
- [風險] 大量照片（>500 張）時進度回呼頻率高 → 預期 Naver Blog 單篇照片數量有限，可接受
- [取捨] 部分失敗仍更新 metadata → 確保已成功下載的檔案被記錄，但 metadata 中的檔案列表可能不完整
- [風險] 並行下載可能造成記憶體壓力 → 4 條並行的記憶體佔用在移動裝置上可接受
