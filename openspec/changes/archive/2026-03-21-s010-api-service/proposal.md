## Why

應用程式需要與後端 Lambda API 通訊，以非同步任務模式取得 Naver Blog 文章中的照片清單。API 採用 async job pattern：先提交任務（submit）取得 `job_id`，再輪詢狀態（poll）直到完成或失敗。需要一個使用 AWS Amplify SDK（`Amplify.API.post()`）發送 REST 請求的服務類別，負責呼叫 `/api/photos` 端點，分別實作 `submitJob` 與 `checkJobStatus` 方法，並在非預期回應時拋出 `ApiServiceException`。Amplify 從 `amplifyconfiguration.dart` 取得 base URL，無需手動拼接。

## What Changes

- 在 `lib/data/services/api_service.dart` 中實作 `ApiService` 類別（包含 `ApiServiceException`），使用 AWS Amplify SDK 封裝非同步任務提交與狀態輪詢邏輯
- 在 `lib/data/models/dtos/photo_download_request.dart` 中新增 `PhotoDownloadRequest` DTO（含 `action` 欄位）
- 在 `lib/data/models/dtos/job_status_response.dart` 中新增 `JobStatusResponse` DTO 與 `JobStatus` enum
- 在 `test/data/services/api_service_test.dart` 中撰寫 `ApiServiceException` 的單元測試

## Capabilities

### New Capabilities

- `api-service`: ApiService REST 服務，透過 AWS Amplify SDK 以 async job pattern 與 Lambda API 互動，提供 `submitJob` 與 `checkJobStatus` 兩個方法

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/services/api_service.dart`（含 `ApiServiceException`）、`lib/data/models/dtos/photo_download_request.dart`、`lib/data/models/dtos/job_status_response.dart`、`test/data/services/api_service_test.dart`
- 依賴：S001（專案依賴與目錄骨架）、AWS Amplify SDK（`amplifyconfiguration.dart` 提供 base URL）、S007（API DTOs 提供 PhotoDownloadResponse）
- 此為資料服務層，後續 Repository 層（S016）將依賴於此，由 Repository 負責 submit → poll 迴圈
