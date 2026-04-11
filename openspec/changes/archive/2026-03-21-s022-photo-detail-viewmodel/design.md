## Context

照片詳細頁面在使用者點選單張照片後顯示完整解析度的圖片。`PhotoDetailViewModel` 繼承 `ChangeNotifier`，負責載入指定照片的資訊並透過 `CacheRepository.cachedFile` 取得本地快取檔案路徑，供 UI 層直接從磁碟載入顯示。此 ViewModel 邏輯相對簡單，主要職責是持有照片資料與快取路徑。

## Goals / Non-Goals

**Goals:**

- 實作單張照片資訊載入（接收 PhotoEntity 與 blogId）
- 透過 `CacheRepository.cachedFile` 取得完整解析度快取檔案路徑
- 曝露 `photo`、`cachedFilePath` 等唯讀屬性供 UI 使用

**Non-Goals:**

- 不實作照片編輯或裁切功能
- 不處理照片縮放的手勢邏輯（屬於 UI 層）
- 不實作照片分享功能

## Decisions

### 照片資料載入方式

`load(PhotoEntity photo, String blogId)` 方法接收照片物件與 Blog 識別碼，將 `_photo` 與 `_blogId` 儲存於內部狀態，並立即查詢快取檔案路徑。載入完成後呼叫 `notifyListeners()` 通知 UI 更新。

### 快取檔案路徑查詢

透過 `CacheRepository.cachedFile(photo.filename, blogId)` 取得 `File?`，將其路徑存入 `_cachedFilePath`。若快取檔案不存在則為 null，UI 層可據此顯示佔位圖或錯誤狀態。

## Risks / Trade-offs

- [風險] 快取檔案可能在瀏覽期間被淘汰策略清除 → 此情境發生機率極低，因使用者正在瀏覽代表最近才下載
- [取捨] 不實作照片重新下載機制 → 若快取遺失，使用者需返回重新下載，保持 ViewModel 簡潔
