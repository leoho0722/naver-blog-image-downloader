## Why

使用者下載完成後進入照片瀏覽頁面，需要載入已快取的照片清單、支援選取模式（單選/全選）、以及將選取的照片存入裝置相簿。`PhotoGalleryViewModel` 負責管理照片清單載入、選取狀態切換、以及呼叫 `PhotoRepository` 與 `CacheRepository` 的相簿儲存與快取存取邏輯。此 ViewModel 是照片瀏覽與管理功能的核心。

## What Changes

- 新增 `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`，實作 `PhotoGalleryViewModel` 類別
- `PhotoGalleryViewModel` 提供以下核心功能：
  - `load(List<PhotoEntity> photos, String blogId)` — 載入照片清單與 Blog 識別碼
  - `toggleSelectMode()` — 切換選取模式
  - `toggleSelection(String photoId)` — 切換指定照片的選取狀態
  - `selectAll()` — 全選/取消全選
  - `saveSelectedToGallery()` — 將選取的照片存入相簿
  - `saveAllToGallery()` — 將所有照片存入相簿
  - `cachedFile(PhotoEntity photo)` — 取得照片的快取檔案路徑

## Capabilities

### New Capabilities

- `photo-gallery-viewmodel`: 照片清單載入、選取模式管理（toggleSelectMode/toggleSelection/selectAll）、相簿儲存（saveSelectedToGallery/saveAllToGallery）、快取檔案存取

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`
- 依賴：S006（PhotoEntity）、S014（CacheRepository.cachedFile）、S018（PhotoRepository.saveToGalleryFromCache）
- 此為照片瀏覽頁面的核心 ViewModel，UI 層的 PhotoGalleryScreen 將依賴於此
