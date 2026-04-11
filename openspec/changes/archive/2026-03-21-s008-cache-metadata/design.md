## Context

應用程式支援將 Naver Blog 照片下載到本地快取，需要追蹤每個部落格的快取狀態。`BlogCacheMetadata` 記錄部落格的基本資訊與快取狀態，支援 JSON 序列化以便寫入本地儲存，並提供 `copyWith` 方法用於更新特定欄位（如標記已儲存至相簿）。

## Goals / Non-Goals

**Goals:**

- 實作 `BlogCacheMetadata` 類別，包含完整的快取元資料欄位
- 實作 `toJson()` 與 `factory fromJson()` 方法，支援 JSON 序列化與反序列化
- 實作 `copyWith` 方法，支援部分欄位更新（特別是 `isSavedToGallery`）

**Non-Goals:**

- 不實作快取讀寫邏輯（由 Cache Repository 負責）
- 不實作快取淘汰策略
- 不實作快取目錄管理

## Decisions

### BlogCacheMetadata 欄位設計

定義 `BlogCacheMetadata` 類別，所有欄位宣告為 `final`，包含：
- `blogId`（String）：部落格唯一識別碼
- `blogUrl`（String）：部落格原始 URL
- `photoCount`（int）：照片數量
- `downloadedAt`（DateTime）：下載時間
- `isSavedToGallery`（bool）：是否已儲存至裝置相簿
- `filenames`（List\<String\>）：已下載的檔案名稱列表

### JSON 序列化設計

提供 `toJson()` 方法將物件轉為 `Map<String, dynamic>`，以及 `factory BlogCacheMetadata.fromJson(Map<String, dynamic> json)` 建構子從 JSON 還原物件。`DateTime` 使用 ISO 8601 字串格式序列化。

### copyWith 部分更新設計

提供 `copyWith({bool? isSavedToGallery})` 方法，回傳新的 `BlogCacheMetadata` 實例，僅更新指定的欄位，其餘保持原值。

## Risks / Trade-offs

- [取捨] `copyWith` 目前僅支援 `isSavedToGallery` 參數，未來需要更多可更新欄位時需擴充 → 目前僅此欄位有更新需求，保持簡單
- [取捨] 使用手動 JSON 序列化而非 code generation → 單一類別手動撰寫更簡潔
