## Why

目前設定頁面的介面較為粗糙：快取大小與清除按鈕分開顯示、提供了不常用的個別 Blog 快取清除功能，且缺少版本號資訊。需要重新調整設定頁面的 UI 佈局，使其更簡潔、符合 iOS 原生風格，並提供基本的版本資訊。

## What Changes

- 將「清除全部快取」與快取大小整合至同一行，使用 `CupertinoListSection.insetGrouped` 風格呈現
- 完全移除個別 Blog 快取清除功能（View 移除 Blog 列表與單筆刪除按鈕；ViewModel 移除 `clearBlogCache` 方法）
- 整體介面改為 `CupertinoListSection.insetGrouped` 風格的 List 佈局
- 頁面底部新增版本號顯示（透過 `package_info_plus` 讀取平台原生版本資訊，自動與 pubspec.yaml 同步）
- 新增 `package_info_plus` 執行時依賴
- Cell 高度固定為 50
- 版本號改用 `CupertinoListTile` 呈現，放在獨立 Section（header = 關於）
- 快取 Cell 標題改為「快取大小」，右側顯示快取大小數值與帶掃把 icon 的「清除」按鈕
- Cell 內容左右間距統一為 20

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `settings-view`：移除個別清除快取功能與 Blog 列表；將快取大小與清除按鈕整合至同一行；介面改為 CupertinoListSection.insetGrouped 風格；新增版本號顯示；調整 Cell 高度、間距、標題文字與清除按鈕樣式
- `settings-viewmodel`：移除 `clearBlogCache` 方法
- `project-dependencies`：新增 `package_info_plus` 執行時依賴

## Impact

- 受影響的 spec：`settings-view`、`settings-viewmodel`、`project-dependencies`
- 受影響的程式碼：
  - `naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart`
  - `naver_blog_image_downloader/lib/ui/settings/view_model/settings_view_model.dart`
  - `naver_blog_image_downloader/pubspec.yaml`
