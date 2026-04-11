## 1. 移除死碼（String URL validation extensions）

- [x] [P] 1.1 移除 String URL validation extensions：刪除 `naver_blog_image_downloader/lib/utils/extensions.dart` 中 `StringExtension` 的 `isValidUrl` 與 `isNaverBlogUrl` 方法，僅保留 `sanitizeFileName()`；同步移除檔案頂部不再需要的 library doc 中 URL 驗證相關描述

## 2. 移除 DTO 層 debugPrint

- [x] [P] 2.1 移除 `naver_blog_image_downloader/lib/data/models/dtos/photo_download_response.dart` 中 `toEntities()` 方法內的兩處 `debugPrint()` 呼叫（第 67-72 行的重複 baseName 警告、第 79-82 行的統計摘要），並移除未使用的 `package:flutter/foundation.dart` import

## 3. Android CoroutineScope 改用 lifecycleScope

- [x] [P] 3.1 修改 `naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/MainActivity.kt`，將 `handleGalleryMethodCall` 中的 `CoroutineScope(Dispatchers.Main).launch` 改為 `lifecycleScope.launch`，並新增 `import androidx.lifecycle.lifecycleScope`、移除未使用的 `import kotlinx.coroutines.CoroutineScope` 與 `import kotlinx.coroutines.Dispatchers`

## 4. CI 新增 flutter test 步驟

- [x] [P] 4.1 修改 `.github/workflows/ci.yml`，在 Analyze 步驟之前新增 `flutter test` 步驟，並將 working-directory 設為 `naver_blog_image_downloader`（因 Flutter 專案在子目錄中）

## 5. 驗證

- [x] 5.1 於 `naver_blog_image_downloader/` 目錄下執行 `flutter analyze` 與 `dart format --set-exit-if-changed .` 確認無錯誤
- [x] 5.2 於 `naver_blog_image_downloader/` 目錄下執行 `flutter test` 確認所有測試通過
