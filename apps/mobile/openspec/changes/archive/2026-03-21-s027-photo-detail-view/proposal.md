## Why

使用者在照片瀏覽頁點擊單張照片後，需要一個全螢幕檢視頁面以原始解析度顯示照片，並支援手勢縮放（pinch-to-zoom）功能，方便使用者檢視照片細節。

## What Changes

- 在 `lib/ui/photo_detail/widgets/photo_detail_view.dart` 中實作 `PhotoDetailView` Widget
- 使用 `Image.file` 以原始解析度顯示照片（不設定 cacheWidth）
- 使用 `InteractiveViewer` 包裹圖片，提供手勢縮放功能

## Capabilities

### New Capabilities

- `photo-detail-view`: PhotoDetail 頁面 UI 元件，包含全螢幕原始解析度圖片顯示與 InteractiveViewer 手勢縮放

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/ui/photo_detail/widgets/photo_detail_view.dart`
- 依賴：S022（PhotoDetailViewModel）
- 此為照片詳細檢視頁面，由 PhotoGallery 頁面導航進入
