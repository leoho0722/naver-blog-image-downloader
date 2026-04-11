## Context

PhotoGallery 頁面是照片下載完成後的主要瀏覽介面。頁面由兩個 Widget 組成：`PhotoGalleryView` 負責整體 GridView 網格佈局與 ViewModel 連接，`PhotoCard` 負責單張照片的縮圖顯示與選取互動。透過 `context.watch<PhotoGalleryViewModel>()` 監聽狀態變化。

## Goals / Non-Goals

**Goals:**

- 實作 PhotoGalleryView，使用 GridView 網格佈局展示照片卡片
- 實作 PhotoCard，使用 Image.file 顯示縮圖並設定 cacheWidth:200
- 支援選取模式，PhotoCard 在選取模式下顯示 Checkbox
- 點擊照片可進入全螢幕檢視（非選取模式）或切換選取狀態（選取模式）

**Non-Goals:**

- 不實作 ViewModel 邏輯（由 S021 負責）
- 不實作批次操作功能的 UI（如批次刪除、分享等）
- 不實作照片排序或篩選功能

## Decisions

### GridView 網格佈局

PhotoGalleryView 使用 `GridView` 以網格方式排列 PhotoCard 元件，每列顯示固定數量的照片卡片，提供一覽式的照片瀏覽體驗。

### PhotoCard 縮圖顯示

PhotoCard 使用 `Image.file(cachedFile!, fit: BoxFit.cover, cacheWidth: 200)` 載入本機快取的照片檔案。設定 `cacheWidth: 200` 可降低記憶體使用量，避免載入原始解析度圖片至網格中。使用 `BoxFit.cover` 確保照片填滿卡片區域。

### PhotoCard 選取模式

PhotoCard 接收 `isSelectMode` 和 `isSelected` 屬性。在選取模式下：
- 右上角顯示 `Checkbox`，反映選取狀態
- 點擊卡片觸發 `onSelect` 回呼（切換選取狀態）

非選取模式下：
- 不顯示 Checkbox
- 點擊卡片觸發 `onTap` 回呼（進入全螢幕檢視）

### GestureDetector 點擊處理

PhotoCard 使用 `GestureDetector` 包裹整張卡片，根據 `isSelectMode` 決定 `onTap` 觸發的是 `onSelect` 還是 `onTap` 回呼。

## Risks / Trade-offs

- [取捨] cacheWidth: 200 為固定值，未依裝置解析度動態調整 → 在大多數裝置上為合理的縮圖品質
- [風險] 大量照片時 GridView 效能問題 → 使用 GridView.builder 搭配懶載入可緩解
- [取捨] Stack + Positioned 疊加 Checkbox，增加 Widget 層級但實現簡潔
