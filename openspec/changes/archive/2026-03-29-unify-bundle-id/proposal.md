## Summary

統一雙平台 Bundle ID，從預設的 `com.example.*` 改為正式的 `com.leoho.naverBlogImageDownloader.*` 命名。

## Motivation

目前 iOS 使用 `com.example.naverBlogImageDownloader`、Android 使用 `com.example.naver_blog_image_downloader`，兩者風格不一致且都是 `com.example` 開頭的預設值，無法上架至 App Store / Google Play。需統一為正式的 Bundle ID 格式。

## Proposed Solution

依照使用者指定的命名規則，將所有 Target 的 Bundle ID / Application ID 統一修改為：

| Target | 新 Bundle ID |
|--------|-------------|
| iOS App | `com.leoho.naverBlogImageDownloader.ios` |
| iOS Unit Test | `com.leoho.naverBlogImageDownloader.ios.tests` |
| Android App | `com.leoho.naverBlogImageDownloader.android` |
| Android Unit Test | `com.leoho.naverBlogImageDownloader.android.tests` |

同時更新所有關聯項目：
- MethodChannel 名稱統一改為 `com.leoho.naverBlogImageDownloader/gallery`（Dart、Swift、Kotlin 三處）
- Android Kotlin 檔案的 package 宣告與目錄結構搬遷至 `com/leoho/naverBlogImageDownloader/android/`
- Android `build.gradle.kts` 的 `namespace` 與 `applicationId`
- iOS `project.pbxproj` 中所有 build configuration 的 `PRODUCT_BUNDLE_IDENTIFIER`

## Non-Goals

- 不變更 Amplify SDK 的 API 名稱或設定
- 不變更 App 顯示名稱（Display Name）
- 不處理簽章（code signing）設定

## Impact

- 受影響的 spec：`gallery-service`（MethodChannel 名稱變更）
- 受影響的程式碼：
  - `naver_blog_image_downloader/android/app/build.gradle.kts`（namespace + applicationId + testApplicationId）
  - `naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/MainActivity.kt` → 搬遷至新目錄
  - `naver_blog_image_downloader/android/app/src/main/kotlin/com/example/naver_blog_image_downloader/GallerySaver.kt` → 搬遷至新目錄
  - `naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj`（6 處 PRODUCT_BUNDLE_IDENTIFIER）
  - `naver_blog_image_downloader/ios/Runner/AppDelegate.swift`（MethodChannel 名稱）
  - `naver_blog_image_downloader/lib/data/services/gallery_service.dart`（MethodChannel 名稱）
