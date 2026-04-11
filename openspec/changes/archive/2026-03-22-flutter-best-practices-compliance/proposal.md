## Why

專案在 Flutter 官方規範合規審查中發現 3 個 runtime bug、2 個安全隱患、5 個最佳實踐違規。其中並行下載池信號量的 dead code 與 race condition 會影響下載效率，FutureBuilder 在 `build()` 中建立新 Future 會造成圖片閃爍，blogUrl metadata 錯誤會導致快取資訊不正確。需一次性修復以確保專案符合 Flutter 官方最佳實踐。

## What Changes

**Bug 修復：**
- 重寫 `PhotoRepository.downloadAllToCache` 的並行下載信號量邏輯，改用 counter-based 模式消除 race condition
- 修正 `BlogCacheMetadata.blogUrl` 誤存為 photo URL 的問題，`FetchResult` 新增 `blogUrl` 欄位並沿途傳遞
- 移除 `PhotoGalleryView` 中 `FutureBuilder` 反模式，改由 ViewModel 預先解析快取檔案

**安全修復：**
- `BlogInputView` 的 `dispose()` 改為使用預存的 ViewModel 引用，避免 `context.read` 在 widget 已卸載時拋出例外
- `SettingsView._showClearAllDialog` 在 `await showDialog` 後補上 `mounted` 檢查

**最佳實踐：**
- 所有 generic `Exception` 改用既有的 `AppError` 類型，擴充 `AppErrorType` 列舉
- 提取 magic numbers 為具名常數
- `main.dart` 的 `ChangeNotifierProxyProvider` 改為 `ChangeNotifierProvider`（`update` callback 為 no-op）
- 移除 `PhotoGalleryView`、`PhotoDetailView` 中不必要的 `addPostFrameCallback`
- `analysis_options.yaml` 啟用 `use_build_context_synchronously` 等更嚴格 lint 規則

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `photo-repo-download`: 並行下載信號量邏輯重寫為 counter-based 模式；`downloadAllToCache` 新增 `blogUrl` 參數以正確記錄 metadata
- `result-models`: `FetchResult` 新增 `blogUrl` 欄位
- `photo-gallery-viewmodel`: 新增 `cachedFiles` map，在 `load()` 時預先解析所有快取檔案
- `photo-gallery-view`: 移除 `FutureBuilder` 反模式，改用 ViewModel 同步存取快取檔案；移除不必要的 `addPostFrameCallback`
- `blog-input-view`: `dispose()` 改為使用預存 ViewModel 引用
- `settings-view`: `_showClearAllDialog` 補上 `mounted` 檢查
- `gallery-service`: `Exception` 改為 `AppError`
- `result-type`: `AppErrorType` 擴充新增 `timeout`、`gallery`、`serverError`
- `provider-di`: 五個 ViewModel 的 `ChangeNotifierProxyProvider` 改為 `ChangeNotifierProvider`
- `cache-repository`: 提取 `_estimatedPhotoSizeBytes` 常數
- `download-viewmodel`: `startDownload` 新增 `blogUrl` 參數
- `photo-detail-view`: 移除不必要的 `addPostFrameCallback`

## Impact

- 受影響檔案（12 個）：
  - `lib/data/repositories/photo_repository.dart`
  - `lib/data/repositories/cache_repository.dart`
  - `lib/data/models/fetch_result.dart`
  - `lib/data/services/gallery_service.dart`
  - `lib/ui/core/app_error.dart`
  - `lib/ui/core/result.dart`
  - `lib/ui/blog_input/widgets/blog_input_view.dart`
  - `lib/ui/photo_gallery/widgets/photo_gallery_view.dart`
  - `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`
  - `lib/ui/photo_detail/widgets/photo_detail_view.dart`
  - `lib/ui/settings/widgets/settings_view.dart`
  - `lib/ui/download/view_model/download_view_model.dart`
  - `lib/main.dart`
  - `analysis_options.yaml`
- 受影響測試：`photo_repository_test.dart`、`download_view_model_test.dart`
- 無 API 變更、無新增依賴
