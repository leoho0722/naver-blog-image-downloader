## Why

目前 `BlogInputView` 透過 `showModalBottomSheet` 呈現 `SettingsView`，使用 Flutter 預設動畫時長（enter 250ms / exit 200ms）。此預設動畫在 iOS 與 Android 雙平台上缺乏原生感，且未針對各平台的動效規範做最佳化。需要引入平台特定的動畫時長，讓 iOS 模擬 UIKit sheet spring 減速效果、Android 對齊 Material 3 Emphasized Easing 標準，以提供更流暢的使用者體驗。

## What Changes

- 新增 `BottomSheetAnimation` 配置類別，提供平台特定的 `AnimationController` 工廠方法
- 修改 `BlogInputView` 加入 `SingleTickerProviderStateMixin`，建立並管理自定義的 `AnimationController`
- 將 `showModalBottomSheet` 呼叫加入 `transitionAnimationController` 參數，傳入平台特定的動畫 controller
- 平台動畫時長：iOS（enter 500ms / exit 350ms）、Android（enter 400ms / exit 250ms）

## Capabilities

### New Capabilities

- `bottom-sheet-animation`: 平台特定的 modal bottom sheet 動畫配置，提供 `AnimationController` 工廠方法以自定義 present/dismiss 動畫時長

### Modified Capabilities

- `blog-input-view`: 「Settings navigation button in AppBar」需求加入 `transitionAnimationController` 的使用描述，定義平台特定的動畫行為

## Impact

- 受影響程式碼：
  - 新增 `naver_blog_image_downloader/lib/config/bottom_sheet_animation.dart`
  - 修改 `naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart`
- 無新增外部依賴
- 無 API 變更
- 無 breaking change
