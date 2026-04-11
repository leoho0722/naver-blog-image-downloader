## Problem

`PhotoGalleryView` 在執行「儲存全部」或「儲存已選取」時，`isSaving` 為 true 會將整個 `Scaffold.body` 替換為 `CircularProgressIndicator`，導致照片網格完全消失。使用者預期的行為是以 popup dialog 方式顯示儲存進度，保持照片網格可見。

## Root Cause

`photo_gallery_view.dart` 的 `build` 方法中，`isSaving` 直接作為 body 的三元運算判斷：

```dart
body: viewModel.isSaving
    ? const Center(child: CircularProgressIndicator())
    : photos.isEmpty ? ...
```

這使得整個 `GridView` 被 loading spinner 取代，而非以彈出式視窗疊加在網格之上。

## Proposed Solution

- 移除 body 中的 `isSaving` 三元判斷，讓 GridView 始終可見
- 加入 ViewModel listener 監聽 `isSaving` 狀態變化
- 當 `isSaving` 變為 true 時，以 `showDialog` 顯示不可關閉的 `AlertDialog`（含 `CircularProgressIndicator` 與「儲存中...」文字）
- 當 `isSaving` 變為 false 時，自動關閉 dialog

## Success Criteria

- 點擊「儲存全部」或「儲存已選取」後，照片網格保持可見
- 儲存過程中顯示 popup dialog（含轉圈動畫與文字提示）
- 儲存完成後 dialog 自動關閉
- 儲存期間 dialog 不可被使用者手動關閉

## Impact

- 受影響 spec：`photo-gallery-view`（新增 isSaving popup dialog 呈現需求）
- 受影響程式碼：`naver_blog_image_downloader/lib/ui/photo_gallery/widgets/photo_gallery_view.dart`
- 無新增外部依賴
- 無 API 變更

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `photo-gallery-view`: 新增儲存進度 popup dialog 呈現需求，取代現有的 body 替換行為
