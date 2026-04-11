## 1. Gallery state properties（選取模式狀態管理）

- [x] 1.1 建立 `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`，實作 `PhotoGalleryViewModel extends ChangeNotifier`，包含建構子接收 `PhotoRepository` 與 `CacheRepository`，以及 gallery state properties 的所有屬性（photos、blogId、selectedIds、isSelectMode、isSaving）

## 2. Load photos（選取模式狀態管理）

- [x] 2.1 實作 `load(List<PhotoEntity> photos, String blogId)` 方法，完成 load photos 功能，儲存照片清單與 blogId 並呼叫 `notifyListeners()`

## 3. Toggle select mode（選取模式狀態管理）

- [x] 3.1 實作 `toggleSelectMode()` 方法，完成 toggle select mode 功能，切換 `_isSelectMode` 旗標，離開選取模式時清空 `_selectedIds`

## 4. Toggle selection（選取狀態以 Set 管理）

- [x] 4.1 實作 `toggleSelection(String photoId)` 方法，完成 toggle selection 功能，使用 `Set.add/remove` 切換個別照片的選取狀態

## 5. Select all（選取狀態以 Set 管理）

- [x] 5.1 實作 `selectAll()` 方法，完成 select all 功能，根據目前是否全選決定全選或全部取消

## 6. Save selected to gallery（相簿儲存委託 PhotoRepository）

- [x] 6.1 實作 `saveSelectedToGallery()` 方法，完成 save selected to gallery 功能，篩選已選取照片後委託 `PhotoRepository.saveToGalleryFromCache` 執行儲存

## 7. Save all to gallery（相簿儲存委託 PhotoRepository）

- [x] 7.1 實作 `saveAllToGallery()` 方法，完成 save all to gallery 功能，將所有照片委託 `PhotoRepository.saveToGalleryFromCache` 執行儲存

## 8. Cached file access（快取檔案路徑委託 CacheRepository）

- [x] 8.1 實作 `cachedFile(PhotoEntity photo)` 方法，完成 cached file access 功能，委託 `CacheRepository.cachedFile` 取得快取檔案路徑
