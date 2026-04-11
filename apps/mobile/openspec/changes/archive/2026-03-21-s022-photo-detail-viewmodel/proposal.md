## Why

使用者在照片瀏覽頁面點選單張照片後，進入照片詳細頁面，需要載入該照片的完整解析度快取檔案並顯示。`PhotoDetailViewModel` 負責載入單張照片資訊，並取得完整解析度的快取檔案路徑，供 UI 層直接從本地磁碟載入顯示。

## What Changes

- 新增 `lib/ui/photo_detail/view_model/photo_detail_view_model.dart`，實作 `PhotoDetailViewModel` 類別
- `PhotoDetailViewModel` 提供以下核心功能：
  - `load(PhotoEntity photo, String blogId)` — 載入單張照片資訊與 Blog 識別碼
  - `cachedFilePath` getter — 取得完整解析度快取檔案路徑

## Capabilities

### New Capabilities

- `photo-detail-viewmodel`: 單張照片載入、完整解析度快取檔案路徑取得

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/ui/photo_detail/view_model/photo_detail_view_model.dart`
- 依賴：S006（PhotoEntity）、S014（CacheRepository.cachedFile）
- 此為照片詳細頁面的核心 ViewModel，UI 層的 PhotoDetailScreen 將依賴於此
