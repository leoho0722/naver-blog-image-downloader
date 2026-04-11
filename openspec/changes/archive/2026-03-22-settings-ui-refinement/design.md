## Context

設定頁面（`SettingsView`）目前以 Material `Column` + `ListView.builder` 呈現，包含快取大小文字、清除全部按鈕、Blog 列表（含個別刪除）。頁面以 modal bottom sheet 方式從首頁呈現。

本次需求是簡化介面：完全移除個別清除功能（含 View 與 ViewModel），將快取大小與清除按鈕整合至同一行，改用 `CupertinoListSection.insetGrouped` 風格，並在底部顯示版本號。

## Goals / Non-Goals

**Goals:**

- 設定頁面採用 `CupertinoListSection.insetGrouped` 風格，呈現 iOS 原生分組列表外觀
- 快取 Cell 標題為「快取大小」，右側顯示快取大小數值與帶掃把 icon 的「清除」按鈕
- 完全移除個別 Blog 快取清除功能（View 的 Blog 列表與刪除按鈕、ViewModel 的 `clearBlogCache` 方法）
- 底部以獨立 Section（header = 關於）顯示 App 版本號（透過 `package_info_plus` 讀取）
- 新增 `package_info_plus` 執行時依賴
- Cell 高度統一為 50，內容左右間距統一為 20

**Non-Goals:**

- 不調整快取清除邏輯或 Repository 層（`CacheRepository.clearBlog` 保留）
- 不修改 AppBar 結構（保留關閉按鈕在右側的現有行為）

## Decisions

### 使用 CupertinoListSection.insetGrouped 作為列表容器

採用 Flutter 內建的 `CupertinoListSection.insetGrouped`，搭配 `CupertinoListTile` 呈現設定項目。此元件原生提供 iOS insetGrouped 風格（圓角分組卡片），無需自行組合 `Card` + `ListTile` 模擬。

替代方案：使用 Material `Card` + `ListTile` 模擬 insetGrouped 外觀，但需手動處理圓角、分隔線等細節，不如直接使用 Cupertino 元件。

### 使用 package_info_plus 取得版本號

透過 `PackageInfo.fromPlatform()` 讀取平台原生版本資訊，自動與 `pubspec.yaml` 的 `version` 欄位同步，避免手動維護版本常數。

替代方案：
- 在 `constants.dart` 寫死版本號 → 每次改版需手動更新，易遺漏
- 透過 `--dart-define` 傳入 → 仍需手動同步，且增加建置指令複雜度

### 版本號在 View 層以 local state 管理

`PackageInfo.fromPlatform()` 是一次性讀取且與業務邏輯無關，因此在 `_SettingsViewState` 中以 `setState` 管理即可，不需要將版本號放入 ViewModel。

## Risks / Trade-offs

- [混用 Cupertino 與 Material 元件] → 頁面 Scaffold 與 AppBar 仍為 Material，列表區域為 Cupertino。Flutter 官方支援混用，視覺上可正常運作。若未來需統一風格，再整體遷移。
- [完全移除 clearBlogCache] → ViewModel 方法移除後，若未來需恢復個別清除功能需重新實作。但 `CacheRepository.clearBlog` 保留，重新加回成本低。
