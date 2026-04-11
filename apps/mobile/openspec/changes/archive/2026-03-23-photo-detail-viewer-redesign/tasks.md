## 1. PhotoDetailViewModel（ViewModel 層）

- [x] 1.1 新增 SaveState enum 取代 boolean flags（idle / saving / saved），移除 isSaving / isSaved
- [x] 1.2 新增 photo list management：`_photos`、`_currentIndex`、`totalCount` 屬性，修改 detail state properties
- [x] 1.3 實作 metadata 快取策略：新增 _PhotoMetadata 類別與 Map<int, _PhotoMetadata> 快取
- [x] 1.4 將 `load()` 改為 `loadAll()`，實作 load photo detail（接收 List<PhotoEntity> + blogId + initialIndex）
- [x] 1.5 實作 set current index 方法（更新索引、重設 saveState、從快取或 I/O 載入 metadata）
- [x] 1.6 修改 save to gallery 方法，使用 SaveState 狀態流轉（idle → saving → saved），含 permission denied 處理

## 2. PhotoDetailCapsuleBar（capsule bottom bar 元件）

- [x] [P] 2.1 建立 `photo_detail_capsule_bar.dart`，實作膠囊形容器（BorderRadius.circular(28) + 半透明背景）
- [x] [P] 2.2 實作內部 Row 佈局：info 按鈕 + VerticalDivider + save 按鈕，save 依 SaveState 顯示不同圖示

## 3. PhotoDetailView（View 層重寫）

- [x] 3.1 實作 Stack-based layout with PageView（Stack + PageView 佈局取代 Column + Expanded），支援 horizontal swipe navigation
- [x] 3.2 以 TransformationController 解決 PageView 與 InteractiveViewer 手勢衝突，實作 InteractiveViewer gesture zoom（swipe blocked when zoomed、zoom reset on page change）
- [x] 3.3 實作 immersive mode toggle（AnimatedSlide + SystemChrome + 背景色切換），含 restore system UI on dispose
- [x] 3.4 實作 top overlay bar（漸層背景 + 返回按鈕 + page indicator）
- [x] 3.5 整合 capsule bottom bar，實作 navigation data format 解析（addPostFrameCallback 保留）
- [x] 3.6 保留 full-resolution image display（Center + Image.file + BoxFit.contain）與 info bottom sheet

## 4. PhotoGalleryView（導航參數更新）

- [x] [P] 4.1 修改 PhotoCard tap behavior：`_onPhotoTap` 傳遞完整照片列表 + blogId + initialIndex

## 5. 測試與驗證

- [x] 5.1 新增 PhotoDetailViewModel 單元測試（initial state、loadAll、set current index、save to gallery、metadata caching、formattedFileSize / formattedDimensions）
- [x] 5.2 執行 `flutter analyze` + `dart format .` 確保無 error / warning
- [x] 5.3 執行 `flutter test` 確保既有測試不被破壞
