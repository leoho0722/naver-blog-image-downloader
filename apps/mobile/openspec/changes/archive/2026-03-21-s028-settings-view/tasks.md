## 1. Cache size display（快取大小顯示）

- [x] 1.1 在 `lib/ui/settings/widgets/settings_view.dart` 建立 `SettingsView` StatelessWidget，使用 `context.watch<SettingsViewModel>()` 監聽 ViewModel
- [x] 1.2 在頁面頂部顯示快取總大小文字，完成 cache size display

## 2. Cached blog list（已快取 Blog 列表）

- [x] 2.1 使用 ListView 顯示已快取 Blog 項目，每個項目顯示 Blog 名稱或 URL，完成 cached blog list

## 3. Clear all button（清除全部按鈕）

- [x] 3.1 實作「清除全部」按鈕，按下後顯示確認對話框，確認後呼叫 ViewModel 的清除全部方法，完成 clear all button

## 4. Individual clear button（個別清除按鈕）

- [x] 4.1 在每個 Blog 項目右側加入 IconButton，按下後顯示確認對話框，確認後呼叫 ViewModel 的個別清除方法，完成 individual clear button

## 5. Confirmation dialog（確認對話框）

- [x] 5.1 實作 AlertDialog 確認對話框，包含標題、警告訊息、取消按鈕與確認按鈕，完成 confirmation dialog
- [x] 5.2 將確認對話框整合至清除全部與個別清除的操作流程中
