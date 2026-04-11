## 1. Repository 層 Bug 修復

- [x] [P] 1.1 重寫 `photo_repository.dart` 的並行下載改用 counter-based 信號量（parallel download concurrency control），提取 `_maxConcurrency` 常數
- [x] [P] 1.2 AppErrorType 擴充：`app_error.dart` 新增 `timeout`、`gallery`、`serverError`（AppErrorType enum values）
- [x] [P] 1.3 `gallery_service.dart` 的 GalleryService saveToGallery method 改拋 `AppError(type: AppErrorType.gallery)` 取代 generic `Exception`
- [x] 1.4 `photo_repository.dart` 的 `fetchPhotos` 改用 `AppError` 包裝逾時與伺服器錯誤（timeout / serverError）
- [x] [P] 1.5 FetchResult 新增 blogUrl 欄位（FetchResult class defined）
- [x] 1.6 `photo_repository.dart` 的 `fetchPhotos` 在建立 `FetchResult` 時填入原始 `blogUrl`
- [x] 1.7 `photo_repository.dart` 的 `downloadAllToCache` 新增 `blogUrl` 參數，BlogCacheMetadata stores original blog URL
- [x] [P] 1.8 `cache_repository.dart` 提取 `_estimatedPhotoSizeBytes` 常數（cache eviction uses named constant for size estimation）

## 2. ViewModel 層修復

- [x] 2.1 `download_viewmodel.dart` 的 `startDownload` 新增 `blogUrl` 參數（start download with progress tracking）
- [x] [P] 2.2 PhotoGalleryViewModel 預先解析快取檔案：新增 `cachedFiles` property，`load()` 改為 async 解析（cachedFiles property / load photos）

## 3. View 層安全與最佳實踐

- [x] [P] 3.1 BlogInputView 預存 ViewModel 引用：`blog_input_view.dart` 以 `late final` 儲存引用（navigation on fetch result），修正 dispose 安全問題
- [x] [P] 3.2 `photo_gallery_view.dart` 移除 `FutureBuilder` 反模式（GridView gallery layout），改用 `viewModel.cachedFiles` 同步存取
- [x] [P] 3.3 `photo_gallery_view.dart` 移除不必要的 `addPostFrameCallback`（view initialization without unnecessary postFrameCallback）
- [x] [P] 3.4 `photo_detail_view.dart` 移除不必要的 `addPostFrameCallback`（view initialization without unnecessary postFrameCallback）
- [x] [P] 3.5 `settings_view.dart` 在 `_showClearAllDialog` 的 `await showDialog` 後補上 `mounted` 檢查（clear all button / clear confirmed with mounted check）
- [x] 3.6 `download_view.dart` 更新 `showDownloadDialog` 呼叫端，傳遞 `blogUrl`

## 4. DI 與配置

- [x] 4.1 ChangeNotifierProxyProvider 改為 ChangeNotifierProvider：`main.dart` 五個 ViewModel provider 簡化（ViewModel providers registered）
- [x] 4.2 強化 lint 規則：`analysis_options.yaml` 啟用 `use_build_context_synchronously`、`unawaited_futures`、`prefer_const_constructors`、`prefer_const_literals_to_create_immutables`
- [x] 4.3 執行 `flutter analyze` + `dart format .` 修正所有新增 lint warning

## 5. 測試更新

- [x] [P] 5.1 更新 `photo_repository_test.dart`：調整 `downloadAllToCache` 新增 `blogUrl` 參數、驗證 metadata blogUrl 正確、驗證 `AppError` 型別
- [x] [P] 5.2 更新 `download_view_model_test.dart`：調整 `startDownload` 新增 `blogUrl` 參數
- [x] [P] 5.3 新增 `photo_gallery_view_model_test.dart`：驗證 `cachedFiles` 在 `load()` 後正確填充
- [x] 5.4 執行 `flutter test` 確認所有測試通過
