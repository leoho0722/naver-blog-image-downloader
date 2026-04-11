## 1. PhotoDownloadRequest DTO defined（PhotoDownloadRequest 請求 DTO）

- [x] 1.1 在 `lib/data/models/dtos/photo_download_request.dart` 中實作 PhotoDownloadRequest DTO defined：定義 `PhotoDownloadRequest` 類別
- [x] 1.2 實作 `toJson()` 方法，回傳 `Map<String, dynamic>` 包含 `blog_url`（snake_case）欄位

## 2. PhotoDownloadResponse DTO defined（PhotoDownloadResponse 回應 DTO）

- [x] 2.1 在 `lib/data/models/dtos/photo_download_response.dart` 中實作 PhotoDownloadResponse DTO defined：定義 `PhotoDownloadResponse` 類別，包含 `totalImages`（int）、`successfulDownloads`（int）、`failureDownloads`（int）、`imageUrls`（List\<String\>）、`errors`（List\<String\>）、`elapsedTime`（String）屬性
- [x] 2.2 實作 `factory PhotoDownloadResponse.fromJson(Map<String, dynamic> json)` 建構子，將 snake_case JSON 欄位映射至 camelCase 屬性

## 3. PhotoDownloadResponse toEntities conversion（toEntities 轉換）

- [x] 3.1 實作 `List<PhotoEntity> toEntities()` 方法，將 `imageUrls` 列表轉換為 `PhotoEntity` 列表，從 URL 中提取 `id`、`url`、`filename`
