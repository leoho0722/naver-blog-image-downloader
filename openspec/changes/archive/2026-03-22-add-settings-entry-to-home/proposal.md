## Problem

`SettingsView` 與 `/settings` 路由皆已實作完成，但 `BlogInputView`（首頁）的 AppBar 沒有任何按鈕可以導航至設定頁面，導致使用者無法存取設定功能。

## Root Cause

`BlogInputView.build()` 中的 `AppBar` 只設定了 `title`，未設定 `actions` 屬性，因此沒有任何導航入口指向設定頁面。

## Proposed Solution

在 `BlogInputView` 的 `AppBar.actions` 加入一個 `IconButton`（圖示為 `Icons.settings`），點擊時透過 `showModalBottomSheet` 以 sheet 形式呈現 `SettingsView`。Sheet 帶有圓角與導航列，`SettingsView` 的 AppBar 左側不顯示按鈕、右側顯示 close 按鈕。

## Success Criteria

- 首頁 AppBar 右上角出現齒輪圖示
- 點擊齒輪圖示後以 sheet 形式呈現設定頁面
- 設定頁面 AppBar 右側有 close 按鈕可關閉 sheet
- 可下滑關閉 sheet 回到首頁

## Capabilities

### Modified Capabilities

- `blog-input-view`：AppBar 新增設定按鈕，以 modal bottom sheet 呈現設定頁面
- `settings-view`：AppBar 隱藏左側返回按鈕，新增右側 close 按鈕

## Impact

- 受影響的程式碼：
  - `naver_blog_image_downloader/lib/ui/blog_input/widgets/blog_input_view.dart`
  - `naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart`
