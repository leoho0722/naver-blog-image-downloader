## Context

照片下載流程分為「抓取照片資訊」與「批次下載照片檔案」兩個階段，每個階段需要專屬的結果模型。Repository 層執行完操作後，透過這些結果模型將操作結果傳遞給 ViewModel，讓 UI 能精確反映當前狀態。

## Goals / Non-Goals

**Goals:**

- 實作 `FetchResult` 類別，封裝照片資訊抓取結果
- 實作 `DownloadBatchResult` 類別，封裝批次下載結果
- 提供 `isAllSuccessful` computed getter，便於快速判斷下載是否全部成功

**Non-Goals:**

- 不實作進度追蹤（由 ViewModel 自行管理）
- 不實作錯誤詳情（錯誤由 Result 型別在上層處理）
- 不實作重試邏輯

## Decisions

### FetchResult 抓取結果模型

定義 `FetchResult` 類別，所有欄位宣告為 `final`，包含：
- `photos`（List\<PhotoEntity\>）：抓取到的照片列表
- `blogId`（String）：部落格識別碼
- `isFullyCached`（bool）：是否所有照片均來自本地快取

### DownloadBatchResult 批次下載結果模型

定義 `DownloadBatchResult` 類別，所有欄位宣告為 `final`，包含：
- `successCount`（int）：成功下載的照片數量
- `failedPhotos`（List\<PhotoEntity\>）：下載失敗的照片列表
- `isAllSuccessful`（bool getter）：computed property，當 `failedPhotos` 為空時回傳 `true`

## Risks / Trade-offs

- [取捨] `FetchResult` 的 `isFullyCached` 為簡單 bool 旗標，不記錄哪些照片來自快取 → 目前 UI 只需知道是否全部來自快取即可
- [取捨] `DownloadBatchResult` 不包含下載進度百分比 → 進度追蹤由 ViewModel 透過 stream 另外處理
