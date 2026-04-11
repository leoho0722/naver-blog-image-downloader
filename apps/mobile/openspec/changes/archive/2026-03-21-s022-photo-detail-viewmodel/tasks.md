## 1. Detail state properties（照片資料載入方式）

- [x] 1.1 建立 `lib/ui/photo_detail/view_model/photo_detail_view_model.dart`，實作 `PhotoDetailViewModel extends ChangeNotifier`，包含建構子接收 `CacheRepository`，以及 detail state properties 的所有屬性（photo、blogId）

## 2. Load photo detail（照片資料載入方式）

- [x] 2.1 實作 `load(PhotoEntity photo, String blogId)` 方法，完成 load photo detail 功能，儲存 PhotoEntity 與 blogId 並呼叫 `notifyListeners()`

## 3. Cached file retrieval（快取檔案路徑查詢）

- [x] 3.1 實作 `cachedFile()` 方法，完成 cached file retrieval 功能，委託 `CacheRepository.cachedFile` 取得全解析度快取檔案路徑
