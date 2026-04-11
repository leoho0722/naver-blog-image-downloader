## Why

應用程式需要將下載的照片儲存至裝置相簿，並在存取前請求使用者授權。透過封裝 `image_gallery_saver` 套件的功能至 `GalleryService` 類別，可將平台相依的相簿操作抽象化，便於測試與維護。

## What Changes

- 在 `lib/data/services/gallery_service.dart` 中實作 `GalleryService` 類別，封裝 image_gallery_saver 套件的相簿操作

## Capabilities

### New Capabilities

- `gallery-service`: GalleryService 相簿存取服務，負責儲存圖片與請求權限

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/services/gallery_service.dart`
- 依賴：S001（專案依賴，提供 image_gallery_saver 套件）
- 此為資料服務層，後續 Repository 層（S018）將依賴於此
