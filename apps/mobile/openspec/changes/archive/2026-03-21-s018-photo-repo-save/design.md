## Context

照片下載至本地快取後，使用者需要將照片永久儲存至裝置相簿。`saveToGalleryFromCache` 是照片生命週期的最後一步，從快取讀取檔案、透過 `GalleryService` 存入系統相簿、最後標記 metadata，使快取淘汰策略能正確識別可清除的 Blog。

## Goals / Non-Goals

**Goals:**

- 實作 `saveToGalleryFromCache` 方法，接受 `List<PhotoEntity>` 與 `String blogId`
- 從 `CacheRepository` 讀取每張照片的快取檔案
- 逐一透過 `GalleryService.saveToGallery` 存入系統相簿
- 儲存完成後呼叫 `CacheRepository.markAsSavedToGallery(blogId)` 更新標記
- 回傳 `Result<void>`

**Non-Goals:**

- 不實作批次進度回呼（相簿儲存通常很快）
- 不實作選擇性儲存（僅支援整個 Blog 全部儲存）
- 不負責觸發快取淘汰（由呼叫端或 S015 自動處理）

## Decisions

### 快取檔案讀取策略

遍歷傳入的 `List<PhotoEntity>`，對每張照片呼叫 `CacheRepository.cachedFile(photo.filename, blogId)` 取得 `File?`。若回傳 `null`（檔案不存在），使用 `continue` 跳過該張照片，不視為錯誤。這確保即使部分快取遺失也不會中斷整個儲存流程。

### 循序儲存策略

相簿儲存操作透過平台 channel 與系統 API 互動，不適合高並行度。因此採用循序（逐一）儲存而非並行儲存，避免平台層競爭條件。每張照片依序呼叫 `GalleryService.saveToGallery(file.path)`。

### 錯誤處理策略

使用 try-catch 包裹整個儲存流程。成功時回傳 `Result.ok(null)`，任何 `Exception`（包括 `GalleryService` 拋出的權限錯誤或 I/O 錯誤）均被捕獲並包裝為 `Result.error(e)` 回傳。

### markAsSavedToGallery 呼叫時機

在所有照片的 for 迴圈完成後呼叫 `CacheRepository.markAsSavedToGallery(blogId)`，標記此 Blog 已儲存至相簿。此標記使 S015 的淘汰策略能優先清除已儲存的 Blog 快取。

## Risks / Trade-offs

- [取捨] 跳過快取中不存在的檔案而非報錯 → 提高容錯性，但使用者可能未察覺部分照片未存入相簿
- [風險] 相簿儲存依賴系統權限，首次呼叫可能觸發權限請求對話框 → 由 GalleryService 處理權限邏輯
- [取捨] 不提供進度回呼 → 簡化介面，但大量照片時 UI 無法顯示進度
