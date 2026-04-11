## Why

使用者下載照片後需要一個瀏覽頁面，以網格佈局展示所有已下載的照片。此頁面需提供照片縮圖瀏覽（GridView）、選取模式（Checkbox 多選），以及點擊照片進入全螢幕檢視的互動功能。`PhotoGalleryView` 負責整體網格佈局，`PhotoCard` 負責單張照片的縮圖與選取 UI。

## What Changes

- 在 `lib/ui/photo_gallery/widgets/photo_gallery_view.dart` 中實作 `PhotoGalleryView` Widget
- 在 `lib/ui/photo_gallery/widgets/photo_card.dart` 中實作 `PhotoCard` Widget
- PhotoGalleryView 使用 GridView 網格佈局展示照片卡片
- PhotoCard 使用 Image.file + cacheWidth:200 顯示縮圖
- PhotoCard 支援選取模式，透過 Checkbox 實現多選功能

## Capabilities

### New Capabilities

- `photo-gallery-view`: PhotoGallery 頁面 UI 元件，包含 GridView 網格佈局的 PhotoGalleryView 與縮圖+選取模式的 PhotoCard

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/ui/photo_gallery/widgets/photo_gallery_view.dart`、`lib/ui/photo_gallery/widgets/photo_card.dart`
- 依賴：S021（PhotoGalleryViewModel）
- 此為照片瀏覽的主要頁面，連接下載頁面與照片詳情頁面
