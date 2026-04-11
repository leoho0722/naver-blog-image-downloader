## Why

PhotoDetailView 目前存在四個顯示問題：(1) 圖片使用 Column + Expanded 佈局導致圖片延伸到 navigation bar 後方未置中；(2) 缺乏照片瀏覽器常見的點擊切換瀏覽/沈浸模式；(3) 僅支援單張照片顯示，無法手勢滑動切換上下張；(4) 底部 info 與下載按鈕為兩個獨立 FloatingActionButton，缺乏一體感。需將 PhotoDetailView 從單張照片檢視器升級為完整的照片瀏覽器體驗。

## What Changes

- 將 PhotoDetailView 佈局從 Column + Expanded 改為 Stack + PageView，修正圖片置中問題
- 新增沈浸模式：點擊圖片切換瀏覽模式（顯示頂部列與底部膠囊）與沈浸模式（全黑背景、隱藏 UI 覆蓋層）
- 新增 PageView 水平滑動切換照片，搭配 TransformationController 解決與 InteractiveViewer 的手勢衝突
- 將底部兩個 FAB 替換為膠囊形自定義元件 PhotoDetailCapsuleBar
- PhotoDetailViewModel 從管理單張照片改為管理照片列表 + 當前索引 + metadata 快取
- 以 `SaveState` enum（idle / saving / saved）取代 `isSaving` / `isSaved` 兩個 boolean flags
- PhotoGalleryView 導航參數從單張照片改為傳遞完整照片列表 + 初始索引

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `photo-detail-view`：佈局改為 Stack + PageView，新增沈浸模式切換、水平滑動、膠囊底部操作列
- `photo-detail-viewmodel`：從單張照片管理改為列表管理 + 當前索引，`isSaving`/`isSaved` 改為 `SaveState` enum
- `photo-gallery-view`：`_onPhotoTap` 導航參數從 `(photo, blogId)` 改為 `(photos, blogId, initialIndex)`

## Impact

- 涵蓋檔案：
  - `lib/ui/photo_detail/view_model/photo_detail_view_model.dart`（修改）
  - `lib/ui/photo_detail/widgets/photo_detail_view.dart`（重寫）
  - `lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart`（新增）
  - `lib/ui/photo_gallery/widgets/photo_gallery_view.dart`（修改）
  - `test/ui/photo_detail/photo_detail_view_model_test.dart`（新增）
- 依賴：無新增依賴，仍使用既有 Provider + GoRouter + InteractiveViewer
