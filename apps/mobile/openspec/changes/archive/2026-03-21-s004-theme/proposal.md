## Why

應用程式需要統一的 Material 3 主題配置，包含色彩方案（ColorScheme）與文字樣式（TextTheme），供 `MaterialApp` 使用。集中管理主題可確保 UI 一致性，並便於日後調整視覺風格。

## What Changes

- 在 `lib/config/theme.dart` 中實作 Material 3 主題配置，包含亮色與暗色主題、色彩方案定義、文字樣式定義

## Capabilities

### New Capabilities

- `app-theme`: Material 3 主題配置（色彩方案、文字樣式）

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/config/theme.dart`
- 依賴：S001（專案依賴與目錄骨架）
- 此為 UI 視覺基礎，所有 Widget 頁面均依賴於此主題配置
