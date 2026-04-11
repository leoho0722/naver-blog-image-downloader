## 1. GridView gallery layout（GridView 網格佈局）

- [x] 1.1 在 `lib/ui/photo_gallery/widgets/photo_gallery_view.dart` 建立 `PhotoGalleryView` StatelessWidget，使用 `context.watch<PhotoGalleryViewModel>()` 監聯 ViewModel
- [x] 1.2 實作 GridView.builder 網格佈局，將照片列表渲染為 PhotoCard 元件，完成 GridView gallery layout

## 2. PhotoCard thumbnail display（PhotoCard 縮圖顯示）

- [x] 2.1 在 `lib/ui/photo_gallery/widgets/photo_card.dart` 建立 `PhotoCard` StatelessWidget，接收 photo、cachedFile、isSelected、isSelectMode、onTap、onSelect 參數
- [x] 2.2 實作 Image.file 縮圖渲染，設定 `fit: BoxFit.cover` 與 `cacheWidth: 200`，完成 PhotoCard thumbnail display

## 3. PhotoCard select mode checkbox（PhotoCard 選取模式）

- [x] 3.1 使用 Stack + Positioned 在右上角疊加 Checkbox，當 `isSelectMode` 為 true 時顯示，完成 PhotoCard select mode checkbox

## 4. PhotoCard tap behavior（GestureDetector 點擊處理）

- [x] 4.1 使用 GestureDetector 包裹 PhotoCard，根據 `isSelectMode` 決定觸發 `onSelect` 或 `onTap` 回呼，完成 PhotoCard tap behavior
