## Why

應用程式需要與後端 Lambda API 進行 HTTP 通訊，需定義請求與回應的 DTO（Data Transfer Object）來處理 JSON 序列化與反序列化。`PhotoDownloadRequest` 負責將請求參數轉為 JSON，`PhotoDownloadResponse` 負責將 API 回傳的 JSON 解析為結構化物件，並提供 `toEntities` 方法將圖片 URL 列表轉換為 domain model `PhotoEntity` 列表。

## What Changes

- 在 `lib/data/models/dtos/photo_download_request.dart` 中實作 `PhotoDownloadRequest` DTO，提供 `toJson` 方法
- 在 `lib/data/models/dtos/photo_download_response.dart` 中實作 `PhotoDownloadResponse` DTO，提供 `fromJson` 方法與 `toEntities` 轉換

## Capabilities

### New Capabilities

- `api-dtos`: API 請求與回應 DTO 的定義，包含 JSON 序列化與 domain model 轉換

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/models/dtos/photo_download_request.dart`、`lib/data/models/dtos/photo_download_response.dart`
- 依賴：S001（專案依賴與目錄骨架）、S006（PhotoEntity domain model）
- 此為 API 通訊的資料轉換層，後續 API Service（S010）與 Repository 層均依賴於此
