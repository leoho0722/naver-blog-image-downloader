## 1. iOS Bundle ID

- [x] [P] 1.1 修改 `naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj` 中所有 Runner target 的 `PRODUCT_BUNDLE_IDENTIFIER`，從 `com.example.naverBlogImageDownloader` 改為 `com.leoho.naverBlogImageDownloader.ios`（Debug、Release、Profile 共 3 處）
- [x] [P] 1.2 修改 `naver_blog_image_downloader/ios/Runner.xcodeproj/project.pbxproj` 中所有 RunnerTests target 的 `PRODUCT_BUNDLE_IDENTIFIER`，從 `com.example.naverBlogImageDownloader.RunnerTests` 改為 `com.leoho.naverBlogImageDownloader.ios.tests`（Debug、Release、Profile 共 3 處）

## 2. Android Bundle ID

- [x] 2.1 修改 `naver_blog_image_downloader/android/app/build.gradle.kts`：將 `namespace` 改為 `"com.leoho.naverBlogImageDownloader.android"`、`applicationId` 改為 `"com.leoho.naverBlogImageDownloader.android"`，並新增 `testApplicationId = "com.leoho.naverBlogImageDownloader.android.tests"`
- [x] 2.2 搬遷 Kotlin 原始碼目錄：將 `android/app/src/main/kotlin/com/example/naver_blog_image_downloader/` 下的 `MainActivity.kt` 與 `GallerySaver.kt` 搬遷至 `android/app/src/main/kotlin/com/leoho/naverBlogImageDownloader/android/`，並刪除舊的 `com/example/` 目錄
- [x] 2.3 更新 `MainActivity.kt` 與 `GallerySaver.kt` 的 package 宣告，從 `com.example.naver_blog_image_downloader` 改為 `com.leoho.naverBlogImageDownloader.android`

## 3. MethodChannel 名稱統一（GalleryService saveToGallery method）

- [x] [P] 3.1 更新 GalleryService saveToGallery method 的 MethodChannel 名稱：修改 `naver_blog_image_downloader/lib/data/services/gallery_service.dart`，從 `com.example.naver_blog_image_downloader/gallery` 改為 `com.leoho.naverBlogImageDownloader/gallery`
- [x] [P] 3.2 修改 `naver_blog_image_downloader/ios/Runner/AppDelegate.swift` 中的 MethodChannel 名稱，從 `com.example.naver_blog_image_downloader/gallery` 改為 `com.leoho.naverBlogImageDownloader/gallery`
- [x] [P] 3.3 修改 `naver_blog_image_downloader/android/app/src/main/kotlin/.../MainActivity.kt` 中的 `GALLERY_CHANNEL_NAME` 常數，從 `com.example.naver_blog_image_downloader/gallery` 改為 `com.leoho.naverBlogImageDownloader/gallery`

## 4. 驗證

- [x] 4.1 於 `naver_blog_image_downloader/` 目錄下執行 `flutter analyze` 與 `dart format .` 確認無錯誤
- [x] 4.2 於 `naver_blog_image_downloader/` 目錄下執行 `flutter test` 確認所有測試通過
