## Context

應用程式透過 HTTP 與後端 Lambda API 通訊，需要將 Dart 物件與 JSON 之間進行轉換。DTO 層負責隔離 API 資料格式與 domain model，確保 API 回應格式變更時只需修改 DTO 層，不影響核心業務邏輯。

## Goals / Non-Goals

**Goals:**

- 實作 `PhotoDownloadRequest` DTO，將請求參數序列化為 JSON
- 實作 `PhotoDownloadResponse` DTO，從 JSON 反序列化 API 回應，包含下載統計資訊與圖片 URL 列表
- 提供 `toEntities()` 方法將 URL 列表轉換為 `PhotoEntity` 列表

**Non-Goals:**

- 不實作 HTTP 請求發送邏輯（由 API Service 負責）
- 不實作錯誤回應的 DTO
- 不實作 code generation（手動撰寫序列化邏輯）

## Decisions

### PhotoDownloadRequest 請求 DTO

定義 `PhotoDownloadRequest` 類別，包含發送 API 請求所需的參數，並提供 `toJson()` 方法回傳 `Map<String, dynamic>`。請求使用 `blog_url`（snake_case）作為 JSON 欄位名稱。

### PhotoDownloadResponse 回應 DTO

定義 `PhotoDownloadResponse` 類別，包含：
- `totalImages`（int）：圖片總數（JSON 欄位：`total_images`）
- `successfulDownloads`（int）：成功下載數（JSON 欄位：`successful_downloads`）
- `failureDownloads`（int）：失敗下載數（JSON 欄位：`failure_downloads`）
- `imageUrls`（List\<String\>）：圖片 URL 列表（JSON 欄位：`image_urls`）
- `errors`（List\<String\>）：錯誤訊息列表（JSON 欄位：`errors`）
- `elapsedTime`（String）：執行耗時（JSON 欄位：`elapsed_time`）

提供 `factory PhotoDownloadResponse.fromJson(Map<String, dynamic> json)` 建構子。

### toEntities 轉換

`PhotoDownloadResponse` 提供 `List<PhotoEntity> toEntities()` 方法，將 `imageUrls` 列表轉換為 `PhotoEntity` 列表，從 URL 中提取 filename 與 id。

## Risks / Trade-offs

- [取捨] 使用手動 JSON 序列化而非 json_serializable code generation，減少建構複雜度但增加手動維護成本 → 對於少量 DTO 類別，手動撰寫更直覺
- [風險] API 回應格式變更可能導致 fromJson 解析失敗 → 透過 Result 型別在上層處理解析錯誤
