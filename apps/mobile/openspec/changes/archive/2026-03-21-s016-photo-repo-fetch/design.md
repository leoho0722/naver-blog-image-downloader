## Context

`PhotoRepository` 是 MVVM 架構中 Data Layer 的核心 Repository，負責整合多個底層 Service 並向 ViewModel 提供統一的資料存取介面。`fetchPhotos` 作為照片資料流的起點，透過 async job pattern（submit → poll）與後端互動，完成任務提交、狀態輪詢、資料轉換與快取檢查，封裝為 `Result<FetchResult>` 回傳。

## Goals / Non-Goals

**Goals:**

- 建立 `PhotoRepository` 類別，透過建構函式注入四個依賴
- 實作 `fetchPhotos(String blogUrl, {void Function(JobStatus)? onStatusChanged})` 方法，完成 submit → poll → DTO → Entity → 快取檢查 → Result 的完整流程
- 支援 `onStatusChanged` callback，在輪詢過程中向上層回報狀態變化
- 將底層服務的錯誤封裝為 `Result.error`，避免例外洩漏至 ViewModel

**Non-Goals:**

- 不實作下載功能（屬於 S017）
- 不實作相簿儲存功能（屬於 S018）
- 不實作 DTO 本身的定義（屬於 S007）

## Decisions

### 依賴注入設計

`PhotoRepository` 透過建構函式注入所有依賴，不使用 Service Locator 模式。建構函式接受 `ApiService`、`FileDownloadService`、`GalleryService`、`CacheRepository` 四個參數，即使 `fetchPhotos` 僅使用 `ApiService` 與 `CacheRepository`，也一併注入以支援 S017、S018 的擴充，避免後續修改建構函式簽名。

### fetchPhotos 非同步輪詢流程設計

`fetchPhotos(String blogUrl, {void Function(JobStatus)? onStatusChanged})` 的執行流程：
1. 呼叫 `CacheRepository.blogId(blogUrl)` 產生 `blogId`
2. 呼叫 `ApiService.submitJob(blogUrl)` 提交下載任務，取得 `job_id`
3. 進入輪詢迴圈：
   - 每 3 秒呼叫一次 `ApiService.checkJobStatus(jobId)`
   - 最多輪詢 200 次（3s × 200 = 600s = 10 分鐘上限）
   - 收到 `processing` → 繼續等待
   - 收到 `completed` → 跳出迴圈，取得 result
   - 收到 `failed` → 使用 `result.errors` 中的錯誤訊息建立例外並回傳 `Result.error`
   - 超過最大輪詢次數 → 回傳 timeout 錯誤
4. 透過 `result.toEntities()` 將 URL 列表轉換為 `PhotoEntity` 列表
5. 從轉換後的 `PhotoEntity` 列表中提取所有 `filename` 作為預期檔案清單
6. 呼叫 `CacheRepository.isBlogFullyCached(blogId, filenames)` 檢查快取狀態
7. 建構 `FetchResult` 並回傳 `Result.ok(fetchResult)`

### onStatusChanged callback 設計

`fetchPhotos` 接受可選的 `onStatusChanged` callback，在以下時機呼叫：
- 提交任務後
- 輪詢過程中狀態變化時
- 任務完成時

此 callback 接收 `JobStatus` enum 值（如 `processing`、`completed`、`failed`），供 ViewModel 層更新 UI 狀態，不影響 fetchPhotos 的核心邏輯。

### 錯誤處理策略

使用 try-catch 包裹整個流程，任何 `Exception` 皆轉換為 `Result.error(e)`。針對 `failed` 狀態，從 `result.errors` 提取錯誤訊息建構例外。不區分 API 錯誤與快取錯誤類型，統一回傳失敗結果由 ViewModel 層決定呈現方式。

## Risks / Trade-offs

- [取捨] 預先注入所有四個依賴而非僅注入 fetchPhotos 所需 → 減少後續 S017/S018 的破壞性修改
- [取捨] 固定 3 秒輪詢間隔與 200 次上限 → 簡化實作，若需動態調整可後續擴充
- [風險] 輪詢期間網路中斷可能導致 `ApiServiceException` → 已被 try-catch 捕獲並封裝為 Result.error
- [風險] `toEntities()` 轉換可能因 URL 格式異常而拋出例外 → 已被 try-catch 捕獲並封裝為 Result.error
- [取捨] 不區分錯誤類型 → 簡化實作，但 ViewModel 無法針對特定錯誤做差異化處理
