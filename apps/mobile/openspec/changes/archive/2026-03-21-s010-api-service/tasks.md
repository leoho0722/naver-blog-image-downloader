## 1. ApiService class using AWS Amplify SDK（ApiService 類別設計）

- [x] 1.1 在 `lib/data/services/api_service.dart` 中實作 ApiService class：定義 `ApiService` 類別，建構子接受可選的 `apiName`（預設 `'naverBlogApi'`）與 `timeout`（預設 30 秒）參數
- [x] 1.2 定義靜態常數 `_path = '/api/photos'`，Amplify 從 `amplifyconfiguration.dart` 取得 base URL

## 2. PhotoDownloadRequest DTO（請求格式封裝）

- [x] 2.1 在 `lib/data/models/dtos/photo_download_request.dart` 中實作 `PhotoDownloadRequest` 類別，包含 `blogUrl`（可選）、`jobId`（可選）、`action`（必要）欄位，以及 `download` 與 `status` 命名建構子
- [x] 2.2 實作 `toJson()` 方法，download 操作序列化為 `{"blog_url": ..., "action": "download"}`，status 操作序列化為 `{"job_id": ..., "action": "status"}`

## 3. JobStatusResponse DTO 與 JobStatus enum（回應格式封裝）

- [x] 3.1 在 `lib/data/models/dtos/job_status_response.dart` 中實作 `JobStatus` enum（processing、completed、failed）
- [x] 3.2 實作 `JobStatusResponse` 類別，包含 `status`（JobStatus）與可選的 `result` 欄位
- [x] 3.3 實作 `fromJson` factory 建構子，解析 JSON 回應為 `JobStatusResponse`

## 4. ApiServiceException（例外類別，定義在 api_service.dart 中）

- [x] 4.1 在 `lib/data/services/api_service.dart` 中定義 `ApiServiceException`（非獨立檔案），包含 `message`（String）與 `statusCode`（`int?`，nullable）欄位
- [x] 4.2 實作 computed getter `isRetryable`，在 statusCode 為 502/503/504 時回傳 `true`，其餘（含 `null`）回傳 `false`
- [x] 4.3 覆寫 `toString()` 回傳 `message`

## 5. submitJob 透過 Amplify.API.post 提交下載任務

- [x] 5.1 實作 `Future<String> submitJob(String blogUrl)` 方法
- [x] 5.2 使用 `PhotoDownloadRequest.download(blogUrl: blogUrl).toJson()` 產生請求 body，透過 `_post` helper 發送請求
- [x] 5.3 成功時解析 JSON 回應，回傳 `job_id`；`job_id` 為 null 時拋出 `ApiServiceException`
- [x] 5.4 非 2xx 狀態碼時拋出 `ApiServiceException`

## 6. _post helper 方法（Lambda proxy integration 處理）

- [x] 6.1 實作 `_post` private 方法，使用 `Amplify.API.post()` 發送 POST 請求
- [x] 6.2 支援可選的 `acceptStatusCodes` 參數，未指定時接受 2xx 範圍
- [x] 6.3 處理 Lambda proxy integration：若回應 JSON 包含 String 型態的 `body` 欄位，解析內層 JSON 並回傳
- [x] 6.4 非可接受狀態碼時拋出含 statusCode 的 `ApiServiceException`；TimeoutException 重新拋出；ApiException 包裝為 `ApiServiceException`

## 7. checkJobStatus 透過 Amplify.API.post 輪詢任務狀態

- [x] 7.1 實作 `Future<JobStatusResponse> checkJobStatus(String jobId)` 方法
- [x] 7.2 呼叫 `_post(payload, acceptStatusCodes: {200, 500})`，接受 HTTP 200 與 500 為有效回應
- [x] 7.3 將回應 JSON 透過 `JobStatusResponse.fromJson()` 解析後回傳

## 8. ApiServiceException 單元測試

- [x] 8.1 在 `test/data/services/api_service_test.dart` 中測試 `isRetryable` 在 502/503/504 時為 `true`
- [x] 8.2 測試 `isRetryable` 在 500、400 時為 `false`
- [x] 8.3 測試 `isRetryable` 在無 `statusCode` 時為 `false`
- [x] 8.4 測試 `toString()` 回傳 `message`
