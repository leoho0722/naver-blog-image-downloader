## Why

使用者需要一個設定頁面來管理應用程式的快取資料。此頁面顯示快取大小、已快取的 Blog 列表，並提供清除全部快取與個別清除的功能。清除操作前需顯示確認對話框（AlertDialog），防止使用者誤觸。

## What Changes

- 在 `lib/ui/settings/widgets/settings_view.dart` 中實作 `SettingsView` Widget
- 顯示快取總大小
- 顯示已快取 Blog 列表
- 提供「清除全部」按鈕
- 每個 Blog 項目提供個別清除按鈕
- 清除操作前顯示 AlertDialog 確認對話框

## Capabilities

### New Capabilities

- `settings-view`: Settings 頁面 UI 元件，包含快取大小顯示、Blog 列表、清除全部按鈕、個別清除按鈕與確認對話框

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/ui/settings/widgets/settings_view.dart`
- 依賴：S023（SettingsViewModel）
- 此為應用程式設定頁面，提供快取管理功能
