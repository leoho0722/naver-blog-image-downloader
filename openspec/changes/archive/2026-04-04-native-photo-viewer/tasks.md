## 1. Flutter 端（Phase 1）

- [x] 1.1 新增 `lib/data/services/photo_viewer_service.dart` — 遵循 `GalleryService` 模式，`@Riverpod(keepAlive: true)` 單例。Channel 名稱 `com.leoho.naverBlogImageDownloader/photoViewer`。實作 `openViewer()` 方法（傳送 `filePaths`、`initialIndex`、`blogId`、`localizedStrings`、`isDarkMode`、`themeColors` ARGB）。實作 `setCallbackHandler(onSaveCompleted, onDismissed)` / `removeCallbackHandler()`，透過 `setMethodCallHandler` 分派原生回呼（對應 spec: PhotoViewerService singleton provider、openViewer method、Callback handler registration；design: MethodChannel 通訊協定、色彩傳遞策略）
- [x] 1.2 簡化 `lib/ui/photo_detail/view_model/photo_detail_view_model.dart` — 保留 `photos`、`blogId`、`currentIndex`、`saveOperation`；新增 `cachedFiles`（`Map<String, File?>`）；移除 Metadata caching（`cachedFile`、`fileSizeBytes`、`imageWidth`、`imageHeight`、`_metadataCache`、`_loadMetadataForIndex`、`formattedFileSize`、`formattedDimensions`）以及 Save to gallery（`saveToGallery()` 方法）與 Operation logging in saveToGallery。`loadAll(photos, blogId, initialIndex, cachedFiles)` 同步設定 state。`setCurrentIndex(index)` 同步更新。新增 `logSaveToGallery(String blogId)` — fire-and-forget 呼叫 LogRepository（對應 spec: PhotoDetailState immutable class、Load photo detail、Set current index、Log save to gallery；design: Flutter 端路由與 ViewModel 調整）
- [x] 1.3 重寫 `lib/ui/photo_detail/widgets/photo_detail_view.dart` 為薄殼（架構：保留 PhotoDetailView 薄殼 + 原生 viewer 獨立畫面）— 移除 InteractiveViewer gesture zoom、Stack-based layout with PageView、Immersive mode toggle、Horizontal swipe navigation、Top overlay bar、Localized UI text 等 Flutter UI 實作。改為 View initialization without unnecessary postFrameCallback：`didChangeDependencies` 解構 route extra（Navigation data format）→ `viewModel.loadAll(...)` → 組建 filePaths（從 cachedFiles 取得路徑）→ 收集 l10n 字串與 theme 色彩 → 呼叫 `PhotoViewerService.openViewer(...)`。註冊回呼：`onSaveCompleted` → `viewModel.logSaveToGallery(blogId)`（操作 Log 記錄）、`onDismissed` → `context.pop()`。`dispose` → `removeCallbackHandler`。`build` → 只回傳空白 Scaffold（Full-resolution image display 改為原生渲染）
- [x] 1.4 刪除 `lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart`（對應 spec: Capsule bottom bar REMOVED）
- [x] 1.5 修改 `lib/ui/photo_gallery/widgets/photo_gallery_view.dart` — route extra 加入 `cachedFiles: state.cachedFiles`（對應 design: Flutter 端路由與 ViewModel 調整）
- [x] 1.6 更新 `test/ui/photo_detail/photo_detail_view_model_test.dart` — 移除 metadata/precache 相關測試，配合簡化後的 ViewModel 調整測試案例（loadAll 含 cachedFiles、setCurrentIndex 不載入 metadata、logSaveToGallery）

## 2. iOS 原生端（Phase 2 — SwiftUI）

- [x] 2.1 建立 `ios/Runner/Features/PhotoViewer/` 目錄，新增 `PhotoViewerChannel.swift` — `AppDelegate` extension，遵循 `setupGalleryChannel` 模式。註冊 channel `com.leoho.naverBlogImageDownloader/photoViewer`、處理 `openViewer` 方法、建立 `PhotoViewerViewModel` + `PhotoViewerController` 並 present `.fullScreen`。保存 channel 參照供原生→Flutter 回呼使用（對應 spec: PhotoViewerChannel registration；design: iOS SwiftUI 架構）
- [x] 2.2 修改 `ios/Runner/AppDelegate.swift` — 新增 `photoViewerChannel` property，在 `didInitializeImplicitFlutterEngine` 中呼叫 `setupPhotoViewerChannel(messenger:)`（對應 spec: PhotoViewerChannel registration）
- [x] 2.3 新增 `ios/Runner/Features/PhotoViewer/PhotoViewerViewModel.swift` — `@Observable` class，管理 `currentIndex`、`isImmersive`（Bool）、`saveState`（`.idle`/`.saving`/`.saved`）、`filePaths`、`blogId`、`localizedStrings`、`themeColors`（ThemeColors struct，ARGB → SwiftUI.Color 轉換）。持有 `FlutterMethodChannel` 參照。實作 ViewModel save method `save()`（直接呼叫 `GallerySaver.saveToGallery` → 成功後 channel 回呼 `onSaveCompleted`）、ViewModel dismiss method `dismiss()`（channel 回呼 `onDismissed`）、ViewModel fileInfo method `fileInfo(at:)`（FileManager + CGImageSource 讀取大小/尺寸）（對應 spec: PhotoViewerViewModel observable state、ViewModel save/dismiss/fileInfo methods）
- [x] 2.4 新增 `ios/Runner/Features/PhotoViewer/PhotoViewerController.swift` — `UIHostingController<PhotoViewerView>`，接收 `PhotoViewerViewModel`，override `prefersStatusBarHidden` 綁定 `viewModel.isImmersive`（對應 spec: PhotoViewerController hosting）
- [x] 2.5 新增 `ios/Runner/Features/PhotoViewer/PhotoViewerView.swift` — `NavigationStack` 包含 `TabView(.page(indexDisplayMode: .never))`。toolbar：leading 返回按鈕、principal 頁碼指示器 `"N / M"`。`toolbarBackground(.hidden)`、`.toolbar(viewModel.isImmersive ? .hidden : .visible)`。bottom overlay 為 Capsule bar（`surfaceContainerHigh` ARGB + 0.85 opacity）。點擊照片切換 `isImmersive`，動畫 `.easeInOut(duration: 0.25)`。Info 按鈕開啟 `.sheet`（使用 `localizedStrings` 顯示檔案資訊）。Save 按鈕呼叫 `viewModel.save()`（對應 spec: PhotoViewerView with NavigationStack、Capsule bottom bar with theme colors、File info sheet；design: iOS SwiftUI 架構）
- [x] 2.6 新增 `ios/Runner/Features/PhotoViewer/ZoomableImageView.swift` — `UIViewRepresentable` 包裝 `UIScrollView` + `UIImageView`。`UIImage(contentsOfFile:)` 載入。`minimumZoomScale: 1.0`、`maximumZoomScale: 5.0`。雙擊 `UITapGestureRecognizer` 切換 1x/2x。`onDisappear` 重設縮放（對應 spec: ZoomableImageView with UIScrollView）

## 3. Android 原生端（Phase 3 — Jetpack Compose）

- [x] 3.1 修改 `android/app/build.gradle.kts` — plugins 加入 `id("org.jetbrains.kotlin.plugin.compose")`，android 加入 `buildFeatures { compose = true }`，dependencies 加入 Compose BOM (`2025.04.00`) + material3 + foundation + activity-compose (`1.10.1`)（對應 spec: Jetpack Compose dependencies）
- [x] 3.2 新增 `android/.../PhotoViewerChannel.kt` — `MainActivity` extension，遵循 `setupGalleryChannel` 模式。存 channel 參照至 file-level `private var`。處理 `openViewer` 方法 → 啟動 `PhotoViewerActivity`（Intent extras）（對應 spec: PhotoViewerChannel registration；design: Android Jetpack Compose 架構）
- [x] 3.3 修改 `android/.../MainActivity.kt` — `configureFlutterEngine` 中新增 `setupPhotoViewerChannel(flutterEngine)`（對應 spec: PhotoViewerChannel registration）
- [x] 3.4 新增 `android/.../PhotoViewerViewModel.kt` — Compose State 管理：`currentIndex`（`mutableIntStateOf`）、`isImmersive`（`mutableStateOf(false)`）、`saveState`（`SaveState` enum: `Idle`/`Saving`/`Saved`）、`filePaths`、`blogId`、`localizedStrings`、`themeColors`（ThemeColors data class，ARGB → Compose Color 轉換）。實作 ViewModel save method `save()`（`Dispatchers.IO` 呼叫 `GallerySaver.saveToGallery` → channel 回呼 `onSaveCompleted`）、ViewModel dismiss method `dismiss()`（channel 回呼 `onDismissed` + `activity.finish()`）、ViewModel fileInfo method `fileInfo(index)`（`File.length()` + `BitmapFactory.Options.inJustDecodeBounds`）（對應 spec: PhotoViewerViewModel compose state、ViewModel save/dismiss/fileInfo methods）
- [x] 3.5 新增 `android/.../PhotoViewerActivity.kt` — `ComponentActivity` + `enableEdgeToEdge()` + `setContent { MaterialTheme(colorScheme from themeColors) { PhotoViewerScreen(viewModel) } }`。從 Intent extras 讀取參數建立 ViewModel（對應 spec: PhotoViewerActivity with Compose）
- [x] 3.6 新增 `android/.../PhotoViewerScreen.kt` — PhotoViewerScreen with Scaffold and HorizontalPager：`Scaffold` + `TopAppBar`（返回按鈕 + 頁碼 `"N / M"`）+ `HorizontalPager`。Capsule bottom bar with theme colors overlay（`surfaceContainerHigh` ARGB + `RoundedCornerShape(28.dp)`）。`AnimatedVisibility` + `tween(250, EaseInOut)` 控制沉浸模式動畫。`WindowInsetsControllerCompat.hide/show(systemBars)` 控制系統列。`ModalBottomSheet` File info bottom sheet（使用 `localizedStrings`）。ZoomableImage with bitmap caching：`BitmapFactory.decodeFile` + LRU 快取（±3）、`detectTransformGestures`（1x–5x）、`detectTapGestures(onDoubleTap)` 1x/3x 切換（design: Android Jetpack Compose 架構）
- [x] 3.7 修改 `android/app/src/main/AndroidManifest.xml` — 註冊 `PhotoViewerActivity`，`android:exported="false"`（對應 spec: AndroidManifest registration）

## 4. 三平台統一命名：GallerySaver / GalleryService → PhotoService

- [x] 4.1 iOS: `GallerySaver.swift` 搬移至 `Services/PhotoService.swift`，class 重新命名為 `PhotoService`，更新 AppDelegate 與 PhotoViewerViewModel 引用
- [x] 4.2 Android: `GallerySaver.kt` 搬移至 `services/PhotoService.kt`，class 重新命名為 `PhotoService`，更新 MainActivity 與 PhotoViewerViewModel 引用
- [x] 4.3 Flutter: `gallery_service.dart` 重新命名為 `photo_service.dart`，class `GalleryService` → `PhotoService`，provider `galleryServiceProvider` → `photoServiceProvider`，更新 `photo_repository.dart`、`photo_viewer_service.dart` 與測試引用
- [x] 4.4 執行 `dart run build_runner build --delete-conflicting-outputs` + `flutter analyze` + `flutter test` 驗證

## 5. 目錄結構重整與 code review 修正

- [x] 5.1 iOS: Gallery Channel 從 AppDelegate 拆至 `Applications/Channels/Features/GalleryChannel.swift`
- [x] 5.2 iOS: View 拆分 — `CapsuleBottomBar.swift`、`FileInfoSheet.swift` 從 PhotoViewerView 抽為獨立 struct
- [x] 5.3 iOS: ViewModel `SaveState` → `ViewState` nested enum，`save()` 改為 `async`，新增 `AsyncButton` 元件與 `onPageChanged(_:)` 方法
- [x] 5.4 Android: Gallery Channel 從 MainActivity 拆至 `applications/channels/features/GalleryChannel.kt`
- [x] 5.5 Android: View 拆分 — `ZoomableImage.kt`、`CapsuleBottomBar.kt`、`FileInfoContent.kt` 從 PhotoViewerScreen 抽為獨立檔案
- [x] 5.6 Android: ViewModel `SaveState` → `ViewState` nested enum，新增 `onPageChanged()` 方法，`CoroutineScope` 改由 `lifecycleScope` 注入
- [x] 5.7 Android: Model 拆分 — `SaveState`、`PhotoFileInfo`、`ThemeColors` 從 ViewModel 抽至 `features/photoviewer/model/` 獨立檔案
- [x] 5.8 swiftui-pro 規範修正 — `@MainActor`、`.topBarLeading`、VoiceOver label、`private(set) viewState`
- [x] 5.9 code review 修正 — Android `onBackPressed` 委派 ViewModel、LRU cache `removeEldestEntry`、`asImageBitmap()` memoize

## 6. 整合驗證

- [x] 6.1 執行 `dart run build_runner build --delete-conflicting-outputs` 重新產生 Riverpod provider 定義
- [x] 6.2 執行 `flutter analyze` + `dart format .` 確認無靜態分析錯誤與格式問題
- [x] 6.3 執行 `flutter test` 確認所有測試通過
