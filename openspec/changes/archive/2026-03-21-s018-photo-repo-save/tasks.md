## 1. Read cached files for gallery save（快取檔案讀取策略）

- [x] 1.1 在 `PhotoRepository` 實作 `saveToGalleryFromCache({required List<PhotoEntity> photos, required String blogId})` 方法，遍歷 `List<PhotoEntity>` 並呼叫 `CacheRepository.cachedFile(photo.filename, blogId)` 取得快取檔案（Read cached files for gallery save）
- [x] 1.2 若 `cachedFile` 回傳 `null` 則使用 `continue` 跳過該張照片
- [x] 1.3 撰寫單元測試驗證所有檔案存在與部分檔案遺失兩種情境

## 2. Sequential gallery save（循序儲存策略）

- [x] 2.1 對每個取得的快取檔案逐一呼叫 `GalleryService.saveToGallery(file.path)` 存入系統相簿（Sequential gallery save）
- [x] 2.2 撰寫單元測試驗證 `saveToGallery` 被依序呼叫正確次數

## 3. Mark as saved to gallery after success（markAsSavedToGallery 呼叫時機）

- [x] 3.1 在 for 迴圈完成後呼叫 `CacheRepository.markAsSavedToGallery(blogId)` 標記 Blog 已儲存至相簿（Mark as saved to gallery after success）
- [x] 3.2 撰寫單元測試驗證標記在所有儲存完成後被呼叫

## 4. Error handling with Result wrapping（錯誤處理策略）

- [x] 4.1 以 try-catch 包裹整個儲存流程，成功回傳 `Result.ok(null)`，例外回傳 `Result.error(e)`（Error handling with Result wrapping）
- [x] 4.2 撰寫單元測試驗證成功回傳 `Result.ok`、GalleryService 例外回傳 `Result.error`、markAsSavedToGallery 例外回傳 `Result.error`
