## Why

以 Flutter 官方 skills 為基準完成合規性檢查後，發現 1 項 Critical 架構違規與 4 項 Major 狀態管理問題：

1. **C-1**：`PhotoDetailViewModel` 直接注入 `GalleryService`，違反「ViewModel 不得直接存取 Service，必須透過 Repository」的 MVVM 分層規則
2. **M-1 ~ M-3**：`BlogInputViewModel`、`PhotoGalleryViewModel`、`DownloadViewModel` 使用多個 boolean / nullable 欄位管理互斥狀態，違反「互斥 boolean 須以 enum 表達」的規範
3. **M-4**：`PhotoGalleryViewModel.saveSelectedToGallery` / `saveAllToGallery` 未以 switch 處理 `Result<void>` 回傳值，忽略錯誤

## What Changes

- `PhotoDetailViewModel` 移除 `GalleryService` 依賴，改為注入 `PhotoRepository`
- `PhotoRepository` 新增 `saveOneToGallery(String filePath)` 方法，回傳 `Result<void>`
- `BlogInputViewModel` 以 `sealed class FetchState` 取代 `_isLoading` / `_errorMessage` / `_statusMessage` / `_fetchResult` 四個獨立欄位
- `PhotoGalleryViewModel` 以 `enum GalleryMode { browsing, selecting, saving }` 取代 `_isSelectMode` + `_isSaving`
- `DownloadViewModel` 以 `enum DownloadState { idle, downloading, completed }` 取代 `_isDownloading`
- `PhotoGalleryViewModel` 的儲存方法以 switch 處理 `Result<void>` 的 Ok / Error 分支
- `main.dart` DI 佈線配合 `PhotoDetailViewModel` 建構子變更

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `photo-detail-viewmodel`：建構子從注入 `GalleryService` 改為 `PhotoRepository`；儲存邏輯委派至 Repository
- `blog-input-viewmodel`：狀態管理從多個 boolean / nullable 改為 `FetchState` sealed class
- `photo-gallery-viewmodel`：狀態管理從 boolean 改為 `GalleryMode` enum；儲存方法新增 `Result` 錯誤處理
- `download-viewmodel`：狀態管理從 boolean 改為 `DownloadState` enum
- `photo-repo-save`：新增 `saveOneToGallery` 單張照片儲存方法
- `provider-di`：`PhotoDetailViewModel` 的 DI 佈線更新

## Impact

- 受影響的程式碼：
  - `lib/ui/photo_detail/view_model/photo_detail_view_model.dart`
  - `lib/ui/blog_input/view_model/blog_input_view_model.dart`
  - `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`
  - `lib/ui/download/view_model/download_view_model.dart`
  - `lib/data/repositories/photo_repository.dart`
  - `lib/main.dart`
  - `test/ui/photo_detail/photo_detail_view_model_test.dart`
  - `test/ui/blog_input/blog_input_view_model_test.dart`
  - `test/ui/download/download_view_model_test.dart`
  - `test/ui/photo_gallery/photo_gallery_view_model_test.dart`
  - `test/data/repositories/photo_repository_test.dart`
  - `test/widget_test.dart`
- 不影響 API 介面、原生程式碼或外部依賴
- View 層透過保留便利 getters 維持向後相容，無 **BREAKING** 變更
