## Context

應用程式需要呼叫後端 Lambda API 的 `/api/photos` 端點，採用非同步任務模式（async job pattern）：先提交下載任務取得 `job_id`，再輪詢任務狀態直到完成或失敗。此服務類別負責使用 AWS Amplify SDK（`Amplify.API.post()`）封裝兩個 REST POST 請求（submit 與 status poll）、解析 JSON 回應、以及處理錯誤狀態碼。Amplify 從 `amplifyconfiguration.dart` 取得 base URL，服務僅需傳入路徑。建構子接受可選的 `apiName`（預設 `'naverBlogApi'`）與 `timeout`（預設 30 秒）參數。

## Goals / Non-Goals

**Goals:**

- 實作 `ApiService` 類別，使用 AWS Amplify SDK 提供 `submitJob` 與 `checkJobStatus` 兩個方法
- 在同一檔案中定義 `ApiServiceException`，以 `statusCode`（`int?`，nullable）與 computed getter `isRetryable` 提供錯誤資訊
- 新增 `PhotoDownloadRequest` DTO 封裝含 `action` 欄位的請求格式（download 操作使用 `blog_url` 欄位）
- 新增 `JobStatusResponse` DTO 與 `JobStatus` enum 封裝輪詢回應
- 撰寫 `ApiServiceException` 的單元測試（Amplify.API 無法輕易 mock，故不直接測試 ApiService 方法）

**Non-Goals:**

- 不實作認證或 token 管理
- 不實作輪詢迴圈邏輯（輪詢迴圈由 Repository 層處理）
- 不處理網路連線狀態檢查

## Decisions

### Async Job Pattern API 設計

API 採用 submit → poll → result 的非同步任務模式：

1. **Submit（提交任務）**：`submitJob(blogUrl)` 透過 `Amplify.API.post()` 向 `/api/photos` 發送 POST 請求，body 包含 `{"blog_url": blogUrl, "action": "download"}`，預期回傳 2xx 與含有 `job_id` 的 JSON，回傳 `job_id`。
2. **Poll（輪詢狀態）**：`checkJobStatus(jobId)` 透過 `Amplify.API.post()` 向 `/api/photos` 發送 POST 請求，body 包含 `{"job_id": jobId, "action": "status"}`，接受 HTTP 200 與 500，回傳 `JobStatusResponse`。

### JobStatusResponse 與 JobStatus enum

`JobStatusResponse` 封裝輪詢回應，包含 `status`（JobStatus enum）與可選的 `result` 欄位。`JobStatus` enum 定義三種狀態：`processing`、`completed`、`failed`。

- `processing`：HTTP 200，任務仍在處理中
- `completed`：HTTP 200，任務完成，`result` 包含照片資料
- `failed`：HTTP 500，任務失敗，`result` 結構與 completed 相同但 `result.errors` 包含錯誤訊息

### ApiServiceException 設計

`ApiServiceException` 定義在 `api_service.dart` 中（非獨立檔案），包含 `message`（String）與 `statusCode`（`int?`，nullable）屬性。`isRetryable` 為 computed getter，在 `statusCode` 為 502、503 或 504 時回傳 `true`，其餘（含 `null`）回傳 `false`。`toString()` 直接回傳 `message`。

### checkJobStatus 的 HTTP 狀態碼處理

`checkJobStatus` 接受 HTTP 200 與 HTTP 500 兩種狀態碼作為有效回應（因 failed 是合法的業務狀態），僅在其他狀態碼時拋出 `ApiServiceException`。

### 單元測試策略

因 `Amplify.API` 為靜態呼叫，無法輕易注入 mock，故單元測試僅涵蓋 `ApiServiceException` 的行為：
- `isRetryable` 在 502/503/504 時為 `true`
- `isRetryable` 在 500、400 等非重試狀態碼時為 `false`
- `isRetryable` 在 `statusCode` 為 `null` 時為 `false`
- `toString()` 回傳 `message`

## Risks / Trade-offs

- [取捨] 使用 AWS Amplify SDK 進行 API 呼叫，base URL 由 `amplifyconfiguration.dart` 統一管理 → 與 Amplify 生態系整合，簡化配置
- [取捨] 不在服務層處理輪詢迴圈邏輯，由上層 Repository 決定輪詢策略 → 職責分離
- [取捨] checkJobStatus 接受 HTTP 500 作為有效回應 → 因為 failed 是合法的業務狀態，並非異常錯誤
- [取捨] `_post` helper 方法處理 Lambda proxy integration，自動解析回應中的 `body` 欄位 → 上層呼叫者無需關心代理整合細節
- [風險] `ApiServiceException` 訊息可能暴露後端錯誤細節 → Repository 層轉換為 `AppError` 時會過濾敏感資訊
