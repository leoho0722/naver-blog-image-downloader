## 1. PhotoRepository construction（依賴注入設計）

- [x] 1.1 在 `lib/data/repositories/photo_repository.dart` 建立 `PhotoRepository` 類別，建構函式接受 `ApiService`、`FileDownloadService`、`GalleryService`、`CacheRepository` 四個必要參數並儲存為私有欄位（PhotoRepository construction）
- [x] 1.2 在 `test/data/repositories/photo_repository_test.dart` 建立測試檔案與 Mock 依賴

## 2. Job submission（非同步任務提交）

- [x] 2.1 實作 `fetchPhotos(String blogUrl, {void Function(JobStatus)? onStatusChanged})` 方法的開頭：呼叫 `CacheRepository.blogId(blogUrl)` 取得 blogId（BlogId derivation in fetchPhotos）
- [x] 2.2 呼叫 `ApiService.submitJob(blogUrl)` 提交下載任務並取得 `job_id`（Job submission via ApiService.submitJob）
- [x] 2.3 撰寫單元測試驗證任務提交成功與失敗情境

## 3. Async polling loop（非同步輪詢迴圈）

- [x] 3.1 實作 3 秒間隔輪詢迴圈：呼叫 `ApiService.checkJobStatus(jobId)`，根據 `JobStatus` 處理 processing/completed/failed 三種狀態（Async polling loop with 3-second interval）
- [x] 3.2 實作最大輪詢次數限制（200 次，10 分鐘上限），超時回傳 `Result.error`
- [x] 3.3 實作 `failed` 狀態處理：從 `result.errors` 提取錯誤訊息並回傳 `Result.error`
- [x] 3.4 撰寫單元測試驗證輪詢完成、失敗、與超時情境

## 4. onStatusChanged callback（狀態回報）

- [x] 4.1 在 submit 與 poll 過程中呼叫 `onStatusChanged` callback 傳入 `JobStatus` enum 值回報狀態（onStatusChanged callback）
- [x] 4.2 撰寫單元測試驗證 callback 被正確呼叫與未提供時不影響流程

## 5. DTO to Entity conversion and cache check（資料轉換與快取檢查）

- [x] 5.1 實作 completed result 到 Entity 的轉換：透過 `result.toEntities()` 將圖片 URL 列表轉換為 `PhotoEntity` 列表（DTO to Entity conversion after completed result）
- [x] 5.2 實作快取狀態檢查：從 `PhotoEntity` 列表中提取 filename，呼叫 `CacheRepository.isBlogFullyCached(blogId, filenames)` 判斷快取狀態（Cache status check in fetchPhotos）
- [x] 5.3 撰寫單元測試驗證空列表、完整快取與部分快取情境

## 6. Result wrapping and error handling（錯誤處理策略）

- [x] 6.1 將 fetchPhotos 完整流程以 try-catch 包裹，成功時回傳 `Result.ok(FetchResult(...))`，例外時回傳 `Result.error(e)`（Result wrapping）
- [x] 6.2 撰寫單元測試驗證 API 錯誤與快取檢查錯誤均正確回傳 `Result.error`
