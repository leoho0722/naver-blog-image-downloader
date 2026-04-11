## Context

應用程式需要將下載的照片儲存至裝置的系統相簿。iOS 與 Android 平台的相簿存取方式不同，`image_gallery_saver` 套件提供了跨平台的統一介面。透過 `GalleryService` 封裝 `image_gallery_saver` 套件的呼叫，可隔離平台相依邏輯，便於測試與維護。

## Goals / Non-Goals

**Goals:**

- 實作 `GalleryService` 類別，提供儲存圖片與請求權限的方法
- 封裝 `ImageGallerySaver.saveImage` 為 `saveToGallery` 方法
- `requestPermission` 方法固定回傳 `true`（`image_gallery_saver` 於儲存時自動請求權限）

**Non-Goals:**

- 不實作圖片格式轉換或壓縮
- 不實作批次儲存的進度追蹤
- 不處理權限被拒絕後的 UI 引導

## Decisions

### GalleryService 類別設計

`GalleryService` 類別提供兩個核心方法：
- `saveToGallery(String filePath)`：讀取檔案為 bytes 後呼叫 `ImageGallerySaver.saveImage(bytes, quality: 100)` 將圖片儲存至系統相簿，iOS/Android 會自動產生系統檔名（如 IMG_xxxx）
- `requestPermission()`：固定回傳 `true`（`image_gallery_saver` 於儲存時自動請求權限，無需事先授權）

### 薄封裝策略

`GalleryService` 採用薄封裝（thin wrapper）設計，僅負責將呼叫委派給 `image_gallery_saver` 套件。此設計的目的是提供可測試的介面，使上層程式碼不直接依賴 `image_gallery_saver` 套件的靜態方法。

## Risks / Trade-offs

- [取捨] 薄封裝增加一層間接呼叫，但提升可測試性 → 對效能無顯著影響，測試性優先
- [風險] `image_gallery_saver` 套件的 API 可能在未來版本變更 → 封裝層可將變更影響限縮於此類別
- [風險] 部分 Android 裝置相簿存取行為不一致 → 此為 `image_gallery_saver` 套件層級的問題，非本服務層責任
