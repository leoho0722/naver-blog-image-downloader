## Context

PhotoDetailView 滑動切換照片時的閃爍問題，經過 14+ 種 Flutter 方案全部無效。根因在 Flutter 的渲染管線——PageView 切換頁面時，新頁面的 widget 無法保證首幀即顯示圖片。

改用雙平台原生照片瀏覽器（iOS: SwiftUI / Android: Jetpack Compose），透過 MethodChannel 整合，完全脫離 Flutter 渲染管線。

現有架構：`PhotoDetailView`（Flutter Widget）→ `PhotoDetailViewModel`（Riverpod Notifier）→ `PhotoRepository` → `PhotoService`（原 `GalleryService`）→ MethodChannel → 原生 `PhotoService`（原 `GallerySaver`）。

## Goals / Non-Goals

**Goals:**

- 以 iOS SwiftUI / Android Jetpack Compose 實作全螢幕圖片檢視器，從根本解決首次翻頁閃爍
- 保留 Flutter `PhotoDetailView` 作為薄殼（啟動原生 viewer），保留 `/detail/:photoId` 路由
- 原生 viewer 直接呼叫 `PhotoService` 儲存，不繞回 Flutter
- Flutter 傳遞 l10n 字串與 theme 色彩至原生端，保證視覺一致性
- iOS 與 Android 採用一致的 MVVM 目錄分層（Model / ViewModel / View）

**Non-Goals:**

- 不使用 Platform View 嵌入方式
- 不在原生端重新推導 Material 3 色彩
- 不使用原生平台 l10n 系統

## Decisions

### 架構：保留 PhotoDetailView 薄殼 + 原生 viewer 獨立畫面

```
Flutter (PhotoGalleryView)
  → context.push('/detail/...')
  → PhotoDetailView（薄殼，只負責啟動原生 viewer）
  → PhotoViewerService.openViewer(filePaths, initialIndex, blogId, ...)
  → MethodChannel → 原生 viewer 以獨立畫面開啟

原生 viewer 事件：
  ← onDismissed(lastIndex) → Flutter pop 路由
  儲存至相簿 → 原生 ViewModel 直接呼叫 PhotoService（不繞回 Flutter）
  操作 log → 儲存成功後透過 channel 通知 Flutter 記錄 log
  檔案資訊（大小、尺寸）→ 原生直接讀取，不需回呼 Flutter
```

**理由：** 保留 Flutter 路由棧與頁面生命週期管理，原生 viewer 覆蓋在上層，dismiss 時 Flutter 自動 pop。

### 三平台統一命名：GallerySaver / GalleryService → PhotoService

原生端 `GallerySaver` 與 Flutter 端 `GalleryService` 統一重新命名為 `PhotoService`，降低跨平台溝通的認知負擔。

- iOS: `Services/PhotoService.swift`
- Android: `services/PhotoService.kt`
- Flutter: `lib/data/services/photo_service.dart`

### MethodChannel 通訊協定

Channel 名稱：`com.leoho.naverBlogImageDownloader/photoViewer`

**Flutter → 原生（`openViewer` 方法）：**

```dart
{
  'filePaths': List<String>,
  'initialIndex': int,
  'blogId': String,
  'localizedStrings': {
    'fileInfo': String,
    'fileSize': String,
    'dimensions': String,
  },
  'isDarkMode': bool,
  'themeColors': {
    'surfaceContainerHigh': int,  // ARGB
    'onSurface': int,
    'onSurfaceVariant': int,
    'primary': int,
    'surface': int,
  },
}
```

**原生 → Flutter（回呼方法）：**

| 方法名 | 參數 | 說明 |
|--------|------|------|
| `onSaveCompleted` | `{"blogId": String}` | 儲存成功，Flutter 記錄操作 log |
| `onDismissed` | `{"lastIndex": int}` | 使用者關閉 viewer，Flutter pop 路由 |

### 色彩傳遞策略

不在原生端重新推導 Material 3 色彩（各平台實作差異大）。改由 Flutter 傳遞關鍵色彩的 ARGB 整數值，原生端將 ARGB 整數轉為 `SwiftUI.Color` / `Compose Color`。保證與 Flutter 完全一致。

### Flutter 端路由與 ViewModel 調整

- `/detail/:photoId` 路由保留，`PhotoDetailView` 作為薄殼
- `PhotoDetailViewModel` 簡化：保留 `photos`、`blogId`、`currentIndex`、`saveOperation`；新增 `cachedFiles`；移除 metadata 相關欄位
- `PhotoDetailView.build()` 只渲染空白 Scaffold；`didChangeDependencies` 組建參數後呼叫 `PhotoViewerService.openViewer()`
- `PhotoViewerService` 提供 `setCallbackHandler` / `removeCallbackHandler` 讓 View 註冊/移除回呼

### iOS SwiftUI 架構

MVVM 分層目錄，遵循 `/swiftui-pro` skills 規範。ViewModel 使用 `@Observable` + `@MainActor`。

```
ios/Runner/
├── Applications/
│   ├── AppDelegate.swift                    — 精簡本體（Properties + Lifecycle）
│   └── Channels/Features/
│       ├── GalleryChannel.swift             — AppDelegate extension（從本體拆出）
│       └── PhotoViewerChannel.swift         — AppDelegate extension（CATransition push/pop 動畫）
├── Features/PhotoViewer/
│   ├── Model/
│   │   ├── PhotoFileInfo.swift              — 檔案元資料 struct
│   │   └── ThemeColors.swift                — ARGB → UIColor 轉換 struct
│   ├── ViewModel/
│   │   └── PhotoViewerViewModel.swift       — @Observable + ViewState nested enum
│   └── View/
│       ├── PhotoViewerController.swift      — UIHostingController
│       ├── PhotoViewerView.swift            — 純 ZStack + TabView(.page)（不使用 NavigationStack）
│       ├── PhotoViewerNavigationBar.swift   — 自定義導航列（漸層背景 + 置中標題）
│       ├── ZoomableImageView.swift          — UIViewRepresentable 橋接
│       ├── ZoomableScrollView.swift         — UIScrollView 子類（layoutSubviews aspect fit）
│       ├── CapsuleBottomBar.swift           — 膠囊操作列
│       ├── FileInfoSheet.swift              — 檔案資訊 Sheet
│       └── AsyncButton.swift                — async → Button 橋接元件
└── Services/
    └── PhotoService.swift                   — PhotoKit 相簿存取（原 GallerySaver）
```

- **純 ZStack 架構**：不使用 NavigationStack（避免 safe area 影響圖片置中），TabView 以 `.ignoresSafeArea()` 填滿螢幕
- **自定義導航列**：`PhotoViewerNavigationBar` 以漸層背景 overlay 在頂部
- **CATransition push/pop 動畫**：present 時模擬從右到左的 push 效果（0.35s）
- **TabView + `.page`**：原生流暢分頁
- **UIScrollView 縮放**：`minimumZoomScale: 1.0`、`maximumZoomScale: 5.0`、雙擊切換 1x/2x
- **`save()` 為 `async` 方法**：搭配 `AsyncButton` 橋接，`viewState` 為 `private(set)`
- **`onPageChanged(_:)` 方法**：封裝頁面切換與 viewState 重設邏輯
- **Capsule bar**：傳入的 `surfaceContainerHigh` ARGB 色 + 0.85 opacity
- **Info sheet**：`.sheet` 呈現，從 `viewModel.fileInfo(at:)` 讀取（FileManager + CGImageSource）

### Android Jetpack Compose 架構

MVVM 分層目錄，與 iOS 一一對齊。

```
android/.../android/
├── applications/
│   ├── MainActivity.kt                      — 精簡本體（Lifecycle）
│   └── channels/features/
│   ├── GalleryChannel.kt                    — MainActivity extension（從本體拆出）
│   └── PhotoViewerChannel.kt                — MainActivity extension
├── features/photoviewer/
│   ├── model/
│   │   ├── PhotoFileInfo.kt                 — 檔案元資料 data class
│   │   └── ThemeColors.kt                   — ARGB → Compose Color data class
│   ├── viewmodel/
│   │   └── PhotoViewerViewModel.kt          — Compose State + ViewState nested enum
│   └── view/
│       ├── PhotoViewerActivity.kt           — ComponentActivity + MaterialTheme
│       ├── PhotoViewerScreen.kt             — 純 Box + 自定義導航列 + HorizontalPager
│       ├── ZoomableImage.kt                 — BitmapFactory + LRU 快取 + 手勢縮放
│       ├── CapsuleBottomBar.kt              — 膠囊操作列
│       └── FileInfoContent.kt              — 檔案資訊 Bottom Sheet
└── services/
    └── PhotoService.kt                      — MediaStore 相簿存取（原 GallerySaver）
```

- **純 Box 架構**：不使用 Scaffold（避免 TopAppBar padding 影響圖片置中），自定義導航列以漸層背景 overlay 在頂部
- **OnBackPressedCallback**：攔截系統返回手勢，統一走 `viewModel.dismiss()`
- **HorizontalPager**：Compose 原生流暢分頁
- **ZoomableImage**：`BitmapFactory.decodeFile` + LRU 快取（max 7, `removeEldestEntry`），`Image(bitmap.asImageBitmap())` 已 memoize
- **`viewState` 為 `private set`**，透過 `onPageChanged()` 封裝頁面切換邏輯
- **`CoroutineScope` 由 Activity 的 `lifecycleScope` 注入**
- **Info sheet**：`ModalBottomSheet`，從 `viewModel.fileInfo(index)` 讀取
- **沉浸模式動畫**：`AnimatedVisibility` + `tween(250, EaseInOut)`
- **`kotlin-compose` plugin**：`id("org.jetbrains.kotlin.plugin.compose")`

### 操作 Log 記錄

原生端儲存成功後，透過 `onSaveCompleted` 回傳 Flutter。`PhotoDetailViewModel.logSaveToGallery(blogId)` 以 fire-and-forget 方式呼叫 `LogRepository`。

## Risks / Trade-offs

- **[風險] Compose 依賴增加 APK 大小** → 約增加 2-3 MB，透過 R8 壓縮降低影響。
- **[風險] 雙平台維護成本** → 以明確的 MethodChannel 協定、一致的 MVVM 目錄結構與功能規格降低分歧。
- **[取捨] 失去 Flutter Hot Reload** → 原生 UI 需各自編譯，但檢視器功能穩定後變動頻率低。
- **[風險] 原生端記憶體管理** → iOS 使用 UIScrollView 內建機制，Android 使用 LRU 快取（max 7, removeEldestEntry）。
