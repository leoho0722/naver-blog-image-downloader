## 1. Full-resolution image display（全螢幕圖片顯示）

- [x] 1.1 在 `lib/ui/photo_detail/widgets/photo_detail_view.dart` 建立 `PhotoDetailView` StatelessWidget，使用 `context.watch<PhotoDetailViewModel>()` 監聽 ViewModel
- [x] 1.2 實作 Image.file 以原始解析度顯示照片（不設定 cacheWidth），完成 full-resolution image display

## 2. InteractiveViewer gesture zoom（InteractiveViewer 手勢縮放）

- [x] 2.1 使用 InteractiveViewer 包裹 Image.file 元件，啟用手勢縮放（pinch-to-zoom）與平移拖曳功能，完成 InteractiveViewer gesture zoom
