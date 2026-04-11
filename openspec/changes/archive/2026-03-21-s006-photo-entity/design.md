## Context

在 MVVM 架構中，domain model 是資料層的核心。`PhotoEntity` 代表一張從 Naver Blog 下載的照片，需在 DTO 轉換、快取存取、ViewModel 狀態管理等多個層級中使用。採用不可變設計可確保資料在傳遞過程中的一致性與安全性。

## Goals / Non-Goals

**Goals:**

- 實作不可變的 `PhotoEntity` 類別，使用 `const` 建構子與 `final` 欄位
- 定義照片的完整屬性：`id`、`url`、`filename`，以及可選的 `width` 與 `height`
- 確保資料不可被修改

**Non-Goals:**

- 不實作 JSON 序列化／反序列化（由 DTO 層負責）
- 不實作資料驗證邏輯
- 不實作 copyWith 方法（此模型僅作為不可變資料容器）

## Decisions

### PhotoEntity 不可變類別設計

使用一般 class 定義 `PhotoEntity`，所有欄位宣告為 `final`，並提供 `const` 建構子：
- `id`（String）：照片唯一識別碼，必填
- `url`（String）：照片原始 URL，必填
- `filename`（String）：照片檔案名稱，必填
- `width`（int?）：照片寬度（像素），選填
- `height`（int?）：照片高度（像素），選填

選擇使用 named parameters 搭配 `required` 關鍵字（必填欄位），提升可讀性與使用安全性。

## Risks / Trade-offs

- [取捨] 不實作 `==` operator 與 `hashCode` 覆寫，保持簡單 → 若未來需集合操作可透過 equatable 套件擴充
- [取捨] `width` 與 `height` 為選填，因部分照片可能無法取得尺寸資訊 → 使用端需處理 null 情況
