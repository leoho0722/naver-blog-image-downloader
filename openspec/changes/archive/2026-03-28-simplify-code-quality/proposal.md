## Why

全專案程式碼品質審查後發現 4 項可改善之處：死碼殘留、DTO 層混入日誌、Android 原生端 CoroutineScope 使用不當、CI 管線缺少測試步驟。這些問題雖不影響功能正確性，但會降低可維護性與開發信心。

## What Changes

- **移除 `extensions.dart` 中未使用的 URL 驗證方法**：`isValidUrl` 與 `isNaverBlogUrl` 在整個 `lib/` 中完全未被引用（實際使用的是 `NaverUrlValidator`），屬於死碼，應移除。
- **移除 `PhotoDownloadResponse.toEntities()` 中的 `debugPrint`**：DTO 轉換屬於 Model 層，不應包含日誌輸出，違反分層職責。
- **Android `MainActivity.kt` 改用 `lifecycleScope`**：目前每次 MethodChannel 呼叫都建立新的 `CoroutineScope(Dispatchers.Main)`，應改用 Activity 內建的 `lifecycleScope`，避免建立多餘的 scope。
- **CI workflow 新增 `flutter test` 步驟**：目前 `.github/workflows/ci.yml` 僅執行 `flutter analyze` 與 `dart format`，未執行任何測試，導致 PR 可在測試失敗的情況下合併。

## Non-Goals

- 不修改 MethodChannel 通道名稱的定義方式（跨語言無法共享常數）
- 不修改 `CacheRepository` 中 SHA-256 hash 長度（16 碼已足夠）
- 不處理 Android `GallerySaver` 的 generic Exception 改為 IOException（本次暫不處理）
- 不新增缺失的測試檔案（如 SettingsViewModel 測試）

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `extensions`：移除 `isValidUrl` 與 `isNaverBlogUrl` 兩個未使用的擴充方法，僅保留 `sanitizeFileName()` 與 `toFileSizeString()`

## Impact

- 受影響的程式碼：
  - `naver_blog_image_downloader/lib/utils/extensions.dart`
  - `naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart`
  - `naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/MainActivity.kt`
  - `.github/workflows/ci.yml`
- 受影響的 spec：`extensions`
- 不涉及 API 變更或依賴升級
