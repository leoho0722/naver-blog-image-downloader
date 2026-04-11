## Context

本專案採用 MVVM + Provider 架構，ViewModel 透過 Repository 存取資料，Service 為無狀態封裝層。合規性檢查發現 `PhotoDetailViewModel` 直接注入 `GalleryService` 違反分層規則，且四個 ViewModel 以多個 boolean / nullable 管理互斥狀態，違反 enum 規範。

目前狀態：
- `PhotoDetailViewModel` 建構子接受 `CacheRepository` + `GalleryService`
- `BlogInputViewModel` 使用 `_isLoading` (bool) + `_errorMessage` (String?) + `_statusMessage` (String?) + `_fetchResult` (FetchResult?) 四欄位
- `PhotoGalleryViewModel` 使用 `_isSelectMode` (bool) + `_isSaving` (bool)
- `DownloadViewModel` 使用 `_isDownloading` (bool)

## Goals / Non-Goals

**Goals:**

- 消除 ViewModel 直接存取 Service 的架構違規
- 以 enum / sealed class 取代所有互斥 boolean 狀態
- 為 `saveToGalleryFromCache` 的 `Result<void>` 補上錯誤處理
- 維持 View 層向後相容（保留便利 getters）
- 更新所有受影響的單元測試

**Non-Goals:**

- 不變更 View 層 Widget 結構（屬 Change 2 範疇）
- 不新增 Widget test 或 Integration test（屬 Change 4 範疇）
- 不變更原生程式碼（Swift / Kotlin）

## Decisions

### 以 PhotoRepository 取代 GalleryService 注入

`PhotoDetailViewModel.saveToGallery()` 目前直接呼叫 `GalleryService.requestPermission()` 和 `GalleryService.saveToGallery()`。將此邏輯搬至 `PhotoRepository.saveOneToGallery(String filePath)` 方法：

- 回傳 `Result<void>`，內部處理權限請求與例外包裝
- ViewModel 以 switch 處理 Ok / Error
- DI 佈線從 `galleryService: context.read<GalleryService>()` 改為 `photoRepository: context.read<PhotoRepository>()`

**替代方案**：建立獨立的 `GalleryRepository` — 因目前 `PhotoRepository` 已含 `saveToGalleryFromCache`（批次），新增單張方法自然歸屬此 Repository，不必額外增加類別。

### 以 sealed class FetchState 重構 BlogInputViewModel

選擇 sealed class 而非 simple enum，因為每種狀態攜帶不同資料（loading 需要 statusMessage、error 需要 message、success 需要 FetchResult）。

```
sealed class FetchState
├── FetchIdle
├── FetchLoading(statusMessage: String)
├── FetchError(message: String)
└── FetchSuccess(result: FetchResult)
```

保留 `isLoading`、`errorMessage`、`statusMessage`、`fetchResult` 便利 getters 以避免 View 大幅修改。

### 以 enum 重構 PhotoGalleryViewModel 和 DownloadViewModel

`GalleryMode { browsing, selecting, saving }` 和 `DownloadState { idle, downloading, completed }` 使用 simple enum 即可，因為狀態不攜帶額外資料。保留 `isSelectMode`、`isSaving`、`isDownloading` 便利 getters。

### 儲存結果錯誤處理

`PhotoGalleryViewModel` 的 `saveSelectedToGallery` 與 `saveAllToGallery` 需以 switch 處理 `Result<void>`，新增 `_errorMessage` 欄位供 View 層顯示。

## Risks / Trade-offs

- **[風險] 便利 getters 增加維護成本** → 以文件註解標記 `@Deprecated` 可在未來 View 重構時移除
- **[風險] 測試修改範圍較大** → `PhotoDetailViewModel` 測試需從 mock `GalleryService` 改為 mock `PhotoRepository`，需同步更新 `widget_test.dart` DI
- **[取捨] 保留向後相容 getters** → 增加程式碼量但避免 View 層連鎖修改，符合漸進式重構策略
