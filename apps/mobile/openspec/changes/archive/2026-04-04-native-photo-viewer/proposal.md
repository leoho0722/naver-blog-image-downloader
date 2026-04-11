## Why

PhotoDetailView 滑動切換照片時存在無法在 Flutter 層解決的閃爍問題：**首次滑動至新照片時，即便檔案已預先快取，Flutter `Image.file` 仍需在 Dart/Skia 層解碼，導致 `PageView` 切換頁面時新頁面的 widget 無法保證首幀即顯示圖片，前一張照片殘影短暫可見**。經過 14+ 種 Flutter 方案（`precacheImage`、`extended_image`、`RawImage` + `ui.Image` 等）全部無效，根因在 Flutter 的渲染管線。

改用雙平台原生照片瀏覽器（iOS: SwiftUI / Android: Jetpack Compose），透過 MethodChannel 整合，完全脫離 Flutter 渲染管線，從根本解決首次翻頁閃爍問題。

## What Changes

- **重新命名** `GallerySaver`（iOS/Android）→ `PhotoService`，`GalleryService`（Flutter）→ `PhotoService` — 三平台統一命名
- **新增** `PhotoViewerService`（Flutter MethodChannel 服務），負責將照片路徑、初始索引、l10n 字串與 theme 色彩值傳送給原生端，並接收原生回呼（`onSaveCompleted`、`onDismissed`）
- **簡化** `PhotoDetailViewModel` — 保留 `photos`、`blogId`、`currentIndex`、`saveOperation`；新增 `cachedFiles`（由 Gallery 傳遞）；移除 metadata 相關欄位與 `_metadataCache`（改由原生端讀取）；新增 `logSaveToGallery()` 方法
- **重寫** `PhotoDetailView` 為薄殼 — `didChangeDependencies` 解構 route extra → `viewModel.loadAll()` → 組建 filePaths → 呼叫 `PhotoViewerService.openViewer()`；註冊回呼處理 `onSaveCompleted`（記錄 log）與 `onDismissed`（`context.pop()`）；`build` 只渲染空白 Scaffold
- **刪除** `PhotoDetailCapsuleBar` — UI 移至原生端
- **新增** iOS SwiftUI 全螢幕圖片檢視器（MVVM 分層目錄），包含 Channel、ViewModel（`@Observable` + `@MainActor` + `ViewState` nested enum）、Controller（`UIHostingController`）、View（`NavigationStack` + `TabView`）、`ZoomableImageView`（`UIViewRepresentable` + `UIScrollView`）、`CapsuleBottomBar`、`FileInfoSheet`、`AsyncButton`
- **新增** Android Jetpack Compose 全螢幕圖片檢視器（MVVM 分層目錄，與 iOS 對齊），包含 Channel、ViewModel（`ViewState` nested enum）、Activity（`ComponentActivity`）、Screen（`Scaffold` + `HorizontalPager`）、`ZoomableImage`、`CapsuleBottomBar`、`FileInfoContent`
- **拆分** Gallery Channel — iOS: 從 `AppDelegate` 拆至 `Applications/Channels/Features/GalleryChannel.swift`；Android: 從 `MainActivity` 拆至 `applications/channels/features/GalleryChannel.kt`
- **修改** `PhotoGalleryView` — route extra 加入 `cachedFiles: state.cachedFiles`
- **複用** 現有 `PhotoService`（原 `GallerySaver`）— 原生 viewer 直接呼叫，不繞回 Flutter

## Non-Goals

- 不使用 Platform View 嵌入方式（手勢衝突與效能問題）
- 不在原生端重新推導 Material 3 色彩 — 由 Flutter 傳遞關鍵色彩的 ARGB 整數值
- 不使用原生平台 l10n 系統 — 由 Flutter 傳遞已翻譯的字串
- 不變更 `app_router.dart` 路由定義 — `/detail/:photoId` 路由保留，PhotoDetailView 作為薄殼
- 不變更快取策略或目錄結構

## Capabilities

### New Capabilities

- `photo-viewer-service`: Flutter MethodChannel 橋接服務，傳送照片路徑、l10n 字串、theme 色彩至原生端，接收 `onSaveCompleted` 與 `onDismissed` 回呼
- `native-photo-viewer-ios`: iOS SwiftUI 全螢幕圖片檢視器（NavigationStack + TabView + UIScrollView 縮放 + 沉浸模式 + 儲存 + 檔案資訊）
- `native-photo-viewer-android`: Android Jetpack Compose 全螢幕圖片檢視器（Scaffold + HorizontalPager + 手勢縮放 + 沉浸模式 + 儲存 + 檔案資訊）

### Modified Capabilities

- `photo-detail-view`: 重寫為薄殼，僅負責啟動原生 viewer 與處理回呼
- `photo-detail-viewmodel`: 簡化為原生 viewer 的狀態管理薄殼，移除 metadata 相關欄位

## Impact

- 受影響 specs: `photo-detail-view`、`photo-detail-viewmodel`
- 新增 specs: `photo-viewer-service`、`native-photo-viewer-ios`、`native-photo-viewer-android`
- 受影響程式碼:
  - **Flutter**
    - `lib/data/services/photo_service.dart` — 重新命名（原 `gallery_service.dart`）
    - `lib/data/services/photo_viewer_service.dart` — 新增
    - `lib/ui/photo_detail/view_model/photo_detail_view_model.dart` — 簡化
    - `lib/ui/photo_detail/widgets/photo_detail_view.dart` — 重寫為薄殼
    - `lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart` — 刪除
    - `lib/ui/photo_gallery/widgets/photo_gallery_view.dart` — route extra 加 cachedFiles
    - `lib/data/repositories/photo_repository.dart` — import 更新（`PhotoService`）
    - `test/ui/photo_detail/photo_detail_view_model_test.dart` — 更新
    - `test/data/repositories/photo_repository_test.dart` — import 更新（`PhotoService`）
  - **iOS**（`ios/Runner/`）
    - `Applications/AppDelegate.swift` — 精簡本體 + 註冊 channels
    - `Services/PhotoService.swift` — 重新命名（原 `GallerySaver.swift`）+ 搬移
    - `Applications/Channels/Features/GalleryChannel.swift` — 從 AppDelegate 拆出
    - `Applications/Channels/Features/PhotoViewerChannel.swift` — 新增
    - `Features/PhotoViewer/Model/PhotoFileInfo.swift` — 新增
    - `Features/PhotoViewer/Model/ThemeColors.swift` — 新增
    - `Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift` — 新增（含 `ViewState` nested enum）
    - `Features/PhotoViewer/View/PhotoViewerController.swift` — 新增
    - `Features/PhotoViewer/View/PhotoViewerView.swift` — 新增
    - `Features/PhotoViewer/View/ZoomableImageView.swift` — 新增（UIViewRepresentable 橋接）
    - `Features/PhotoViewer/View/ZoomableScrollView.swift` — 新增（UIScrollView 子類，layoutSubviews 時計算 aspect fit）
    - `Features/PhotoViewer/View/CapsuleBottomBar.swift` — 新增
    - `Features/PhotoViewer/View/FileInfoSheet.swift` — 新增
    - `Features/PhotoViewer/View/PhotoViewerNavigationBar.swift` — 新增（自定義導航列，漸層背景 + 置中標題）
    - `Features/PhotoViewer/View/AsyncButton.swift` — 新增
  - **Android**（`android/.../android/`）
    - `applications/MainActivity.kt` — 精簡本體 + import channels
    - `services/PhotoService.kt` — 重新命名（原 `GallerySaver.kt`）+ 搬移
    - `applications/channels/features/GalleryChannel.kt` — 從 MainActivity 拆出
    - `applications/channels/features/PhotoViewerChannel.kt` — 新增
    - `features/photoviewer/model/PhotoFileInfo.kt` — 新增
    - `features/photoviewer/model/ThemeColors.kt` — 新增
    - `features/photoviewer/viewmodel/PhotoViewerViewModel.kt` — 新增（含 `ViewState` nested enum）
    - `features/photoviewer/view/PhotoViewerActivity.kt` — 新增
    - `features/photoviewer/view/PhotoViewerScreen.kt` — 新增
    - `features/photoviewer/view/ZoomableImage.kt` — 新增
    - `features/photoviewer/view/CapsuleBottomBar.kt` — 新增
    - `features/photoviewer/view/FileInfoContent.kt` — 新增
    - `android/app/build.gradle.kts` — 新增 Compose 依賴 + kotlin-compose plugin
    - `android/app/src/main/AndroidManifest.xml` — 註冊 PhotoViewerActivity
- 依賴變更: Android 需新增 Compose BOM + Material3 + Foundation + activity-compose；Kotlin Compose plugin
