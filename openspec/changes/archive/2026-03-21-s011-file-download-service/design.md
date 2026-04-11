## Context

應用程式需要將遠端照片檔案下載至本機暫存目錄。下載大量圖片時，網路連線可能不穩定，因此需要指數退避重試策略與接收超時設定。使用 Dio 的串流下載功能，可有效處理大檔案下載並監控進度。

## Goals / Non-Goals

**Goals:**

- 實作 `FileDownloadService` 類別，使用 Dio 進行串流下載
- 實作指數退避重試機制（最多 3 次，間隔 1s→2s→4s）
- 設定 30 秒接收超時
- 下載檔案至暫存目錄

**Non-Goals:**

- 不實作下載進度回報（由上層 Repository 處理 UI 通知）
- 不實作斷點續傳
- 不管理暫存檔案的清理（由快取層處理）

## Decisions

### FileDownloadService 類別設計

`FileDownloadService` 類別透過建構子接收 `Dio` 實例，提供 `downloadFile` 方法：
- 接受 `String url`（下載來源）與 `String savePath`（儲存路徑）參數
- 使用 `dio.download()` 進行串流下載
- 設定 `receiveTimeout` 為 30 秒
- 回傳下載後的檔案路徑

### 指數退避重試策略

重試邏輯內建於 `downloadFile` 方法中：
- 最多重試 3 次（含首次嘗試共 4 次）
- 第 1 次重試等待 1 秒、第 2 次等待 2 秒、第 3 次等待 4 秒
- 僅在 `DioException` 時觸發重試
- 所有重試皆失敗後，拋出最後一次的 `DioException`

## Risks / Trade-offs

- [取捨] 重試邏輯直接內建於服務中，而非使用外部重試套件 → 需求簡單，避免額外依賴
- [取捨] 固定 30 秒超時，不根據檔案大小動態調整 → 簡化實作，對於照片下載場景已足夠
- [風險] 指數退避最長等待 4 秒，若網路持續不穩定仍會失敗 → 上層 Repository 可向使用者提示錯誤
