## Why

目前專案缺少一個統一的照片資料存取層。使用者輸入 Naver Blog URL 後，App 需要透過 async job pattern 提交下載任務、輪詢任務狀態直到完成或失敗、將 DTO 轉換為 Entity、並檢查快取狀態，最終回傳一個統一的 `FetchResult`。`PhotoRepository` 的 `fetchPhotos` 方法整合了 `ApiService`（submit + poll）與 `CacheRepository`，作為照片資料流的 Single Source of Truth。

## What Changes

- 新增 `lib/data/repositories/photo_repository.dart`，建立 `PhotoRepository` 類別
- 新增 `test/data/repositories/photo_repository_test.dart`，涵蓋 `fetchPhotos` 的完整測試
- `PhotoRepository` 透過建構函式注入 `ApiService`、`FileDownloadService`、`GalleryService`、`CacheRepository` 四個依賴
- 實作 `fetchPhotos(String blogUrl, {void Function(JobStatus)? onStatusChanged})` 方法：
  1. 使用 `CacheRepository.blogId()` 產生 blogId
  2. 呼叫 `ApiService.submitJob(blogUrl)` 提交任務，取得 `job_id`
  3. 以 3 秒間隔輪詢 `ApiService.checkJobStatus(jobId)`，最多 200 次（10 分鐘上限）
  4. 完成時透過 `response.result.toEntities()` 將 URL 列表轉換為 `PhotoEntity` 列表
  5. 呼叫 `CacheRepository.isBlogFullyCached()` 檢查快取狀態
  6. 回傳 `Result<FetchResult>`

## Capabilities

### New Capabilities

- `photo-repo-fetch`: 照片列表取得功能，整合 async job pattern（submit → poll）、DTO 轉 Entity、快取檢查，回傳 `Result<FetchResult>`

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/data/repositories/photo_repository.dart`、`test/data/repositories/photo_repository_test.dart`
- 依賴 S002（Result）、S009（FetchResult）、S010（ApiService，含 submitJob 與 checkJobStatus）、S014（CacheRepository）
- S017（downloadAllToCache）與 S018（saveToGalleryFromCache）將擴充此類別
