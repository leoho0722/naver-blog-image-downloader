## 1. Repository 層：以 PhotoRepository 取代 GalleryService 注入

- [x] 1.1 在 `PhotoRepository` 新增 `saveOneToGallery(String filePath)` 方法（save single photo to gallery），回傳 `Result<void>`
- [x] 1.2 在 `photo_repository_test.dart` 新增 `saveOneToGallery` 單元測試（permission granted / denied / gallery error）

## 2. ViewModel 狀態重構：以 sealed class FetchState 重構 BlogInputViewModel

- [x] 2.1 在 `blog_input_view_model.dart` 定義 `FetchState` sealed class（FetchIdle、FetchLoading、FetchError、FetchSuccess），實作 URL input state management
- [x] 2.2 替換 `_isLoading`、`_errorMessage`、`_statusMessage`、`_fetchResult` 為單一 `_fetchState` 欄位，保留便利 getters
- [x] 2.3 更新 `fetchPhotos()` 方法使用 FetchState 狀態轉換（fetch photos with loading state and status message）
- [x] 2.4 更新 `reset()` 方法將狀態設為 `FetchIdle`（reset state）
- [x] [P] 2.5 更新 `blog_input_view_model_test.dart` 驗證 FetchState 狀態轉換

## 3. ViewModel 狀態重構：以 enum GalleryMode 重構 PhotoGalleryViewModel

- [x] 3.1 在 `photo_gallery_view_model.dart` 定義 `GalleryMode` enum（browsing、selecting、saving），重構 gallery state properties
- [x] 3.2 替換 `_isSelectMode` + `_isSaving` 為 `_mode` 欄位，保留便利 getters
- [x] 3.3 以 switch 處理 `saveSelectedToGallery` 的 `Result<void>`（save selected to gallery — 儲存結果錯誤處理）
- [x] 3.4 以 switch 處理 `saveAllToGallery` 的 `Result<void>`（save all to gallery — 儲存結果錯誤處理）
- [x] [P] 3.5 更新 `photo_gallery_view_model_test.dart` 新增 GalleryMode 與 Result error 測試

## 4. ViewModel 狀態重構：以 enum 重構 PhotoGalleryViewModel 和 DownloadViewModel

- [x] [P] 4.1 在 `download_view_model.dart` 定義 `DownloadState` enum（idle、downloading、completed），實作 download state properties
- [x] [P] 4.2 替換 `_isDownloading` 為 `_downloadState` 欄位，保留便利 getter
- [x] [P] 4.3 更新 `download_view_model_test.dart` 驗證 DownloadState 狀態轉換

## 5. PhotoDetailViewModel：以 PhotoRepository 取代 GalleryService

- [x] 5.1 修改 `PhotoDetailViewModel` 建構子，移除 `GalleryService`、注入 `PhotoRepository`（detail state properties）
- [x] 5.2 重寫 `saveToGallery()` 方法呼叫 `_photoRepository.saveOneToGallery()`，以 switch 處理 Result（save to gallery）
- [x] 5.3 更新 `photo_detail_view_model_test.dart`，Mock 從 `MockGalleryService` 改為 `MockPhotoRepository`

## 6. DI 佈線與整合驗證

- [x] 6.1 更新 `main.dart` 中 `PhotoDetailViewModel` 的 Provider 佈線（ViewModel providers registered）
- [x] 6.2 更新 `widget_test.dart` 中 `PhotoDetailViewModel` 的 DI 佈線
- [x] 6.3 執行 `flutter analyze` 確認零錯誤
- [x] 6.4 執行 `dart format . --set-exit-if-changed` 確認格式一致
- [x] 6.5 執行 `flutter test` 確認所有測試通過（1 個既有失敗不相關）
