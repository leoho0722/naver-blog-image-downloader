## Context

PhotoDetailView 目前使用 `Column` + `Expanded` 佈局搭配透明 `AppBar` + `extendBodyBehindAppBar: true`，導致圖片延伸到 navigation bar 後方。底部為兩個獨立 `FloatingActionButton`（info 與 save）。ViewModel 僅管理單張照片，導航時僅傳遞一張照片的資料。整體缺乏照片瀏覽器應有的沈浸體驗與滑動切換功能。

## Goals / Non-Goals

**Goals:**

- 修正圖片顯示置中問題，改用 Stack 佈局讓圖片填滿全螢幕
- 實作點擊切換瀏覽/沈浸模式，含動畫過渡
- 實作 PageView 水平滑動切換照片
- 以膠囊形自定義元件取代兩個獨立 FAB
- ViewModel 升級為管理照片列表 + 當前索引 + metadata 快取
- 以 `SaveState` enum 取代 `isSaving` / `isSaved` boolean flags
- 新增 PhotoDetailViewModel 單元測試

**Non-Goals:**

- 不實作照片縮放邊緣拖曳觸發換頁（edge-panning-to-page-change）
- 不修改 GoRouter 路由結構（`/detail/:photoId` 保持不變）
- 不修改 DI 註冊（`main.dart` 不變）
- 不處理照片預載入（preload adjacent images）

## Decisions

### Stack + PageView 佈局取代 Column + Expanded

將 Scaffold body 從 `Column` 改為 `Stack`，底層為 `PageView.builder`（全螢幕），上層疊加可動畫隱藏的頂部覆蓋列與底部膠囊操作列。這解決了圖片置中問題（`Center` + `BoxFit.contain`），同時讓沈浸模式可以透過 `AnimatedSlide` 控制覆蓋層的顯示/隱藏。

**替代方案**：使用 `CustomScrollView` + `SliverAppBar`，但 SliverAppBar 的收合行為不符合點擊切換的需求。

### TransformationController 解決 PageView 與 InteractiveViewer 手勢衝突

監聽 `TransformationController` 的 scale 值，當 scale > 1.01 時設定 `_isZoomed = true`，將 PageView 的 physics 切換為 `NeverScrollableScrollPhysics()`，讓 InteractiveViewer 處理所有拖曳手勢。換頁時重設 `TransformationController.value = Matrix4.identity()`。

**替代方案**：自定義 `GestureRecognizer` 分發手勢，但實作複雜度遠高於 physics 切換方案。

### SaveState enum 取代 boolean flags

定義 `enum SaveState { idle, saving, saved }` 取代 `_isSaving` + `_isSaved`，從型別層面避免非法狀態組合（如 `isSaving=true && isSaved=true`）。照片載入狀態仍由 `cachedFile == null` 判斷，因為載入與儲存是正交操作。

### Metadata 快取策略

使用 `Map<int, _PhotoMetadata>` 按照片索引快取已解析的 metadata（cachedFile、fileSizeBytes、imageWidth、imageHeight），避免換頁回到已查看過的照片時重複執行 I/O 和圖片解碼。

### addPostFrameCallback 保留

`didChangeDependencies` 中透過 `addPostFrameCallback` 呼叫 `viewModel.loadAll()`，因為 `loadAll()` 內含同步 `notifyListeners()` 呼叫，若直接在 build phase 呼叫會觸發 "setState called during build" 錯誤。

## Risks / Trade-offs

- [風險] PageView 與 InteractiveViewer 手勢衝突在快速縮放切換時可能產生微小延遲 → 使用 1.01 epsilon 閾值避免浮點數精度問題
- [風險] 換頁時瞬間重設 TransformationController 可能讓縮放中的使用者感到突兀 → 初始版本接受瞬間重設，後續可加入動畫過渡
- [取捨] 膠囊元件使用半透明背景而非完全不透明 → 提升視覺層次感但在淺色照片上可能降低對比度
- [取捨] 沈浸模式使用 `SystemUiMode.immersiveSticky` → 使用者可從邊緣輕掃暫時顯示系統 UI
