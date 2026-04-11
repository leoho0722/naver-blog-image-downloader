## Context

PhotoDetail 頁面提供單張照片的全螢幕檢視體驗。使用者從 PhotoGallery 頁面點擊照片後進入此頁面，可以原始解析度檢視照片並透過手勢縮放查看細節。透過 `context.watch<PhotoDetailViewModel>()` 取得當前照片資料。

## Goals / Non-Goals

**Goals:**

- 實作 PhotoDetailView StatelessWidget，提供全螢幕照片檢視
- 使用 Image.file 以原始解析度載入照片
- 使用 InteractiveViewer 提供手勢縮放（pinch-to-zoom）功能

**Non-Goals:**

- 不實作 ViewModel 邏輯（由 S022 負責）
- 不實作照片左右滑動切換功能
- 不實作照片編輯功能
- 不實作分享功能

## Decisions

### 全螢幕圖片顯示

使用 `Image.file` 載入本機快取的照片檔案，不設定 `cacheWidth` 以確保顯示原始解析度。在全螢幕檢視下，使用者需要看到最高品質的照片。

### InteractiveViewer 手勢縮放

使用 Flutter 內建的 `InteractiveViewer` Widget 包裹圖片，提供開箱即用的手勢縮放功能，包括：
- 雙指捏合縮放（pinch-to-zoom）
- 平移拖曳
- 雙擊縮放（預設行為）

InteractiveViewer 自動處理邊界限制與動畫過渡，無需額外實作。

## Risks / Trade-offs

- [風險] 原始解析度圖片可能佔用大量記憶體 → 單張顯示時記憶體壓力可控，離開頁面後自動釋放
- [取捨] 未實作照片切換手勢，使用者需返回 Gallery 再點選其他照片 → 簡化初版實作
