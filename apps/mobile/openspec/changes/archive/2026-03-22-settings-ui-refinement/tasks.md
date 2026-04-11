## 1. 依賴設定

- [x] 1.1 [P] 新增 `package_info_plus` 至 pubspec.yaml runtime dependencies declared，執行 `flutter pub get`

## 2. ViewModel 調整

- [x] 2.1 [P] 移除 `SettingsViewModel` 的 `clearBlogCache` 方法（clear blog cache）

## 3. View 介面重構

- [x] 3.1 使用 CupertinoListSection.insetGrouped 作為列表容器，改寫 `SettingsView` body 為 inset grouped list layout
- [x] 3.2 將 cache size display 與 clear all button 整合至同一 `CupertinoListTile`（title + additionalInfo），含 confirmation dialog 確認流程
- [x] 3.3 移除 cached blog list 與 individual clear button 相關 UI 程式碼
- [x] 3.4 使用 package_info_plus 取得版本號，以版本號在 View 層以 local state 管理方式實作 version number display

## 4. UI 細節調整

- [x] 4.1 [P] 快取 Cell 標題改為「快取大小」，trailing 區域改為快取大小數值 + 帶掃把 icon 的「清除」按鈕（cache size display、clear all button）
- [x] 4.2 [P] 版本號改用 CupertinoListTile 呈現，放在獨立 Section（header = 關於），title 為「版本」（version number display）
- [x] 4.3 所有 CupertinoListTile 高度固定為 50，左右間距設為 20（inset grouped list layout）

## 5. UI 修正

- [x] 5.1 修正 Cell 內容 Y 軸對齊，確保 title 與 trailing 垂直置中（inset grouped list layout）
- [x] 5.2 快取大小數值字體大小改為與 Cell 左側標題相同（inset grouped list layout、cache size display）
- [x] 5.3 List 改為占滿整個畫面寬度（inset grouped list layout）

## 6. 驗證

- [x] 6.1 執行 `flutter analyze` 與 `dart format .` 確認程式碼品質
