## Why

設定頁面（`settings_view.dart`）是專案中唯一使用 Cupertino 元件（`CupertinoListSection.insetGrouped`、`CupertinoListTile`、`CupertinoColors`）的檔案。專案已採用 Material 3 主題系統（`ColorScheme.fromSeed`），其餘所有頁面皆使用 Material 元件。此不一致導致視覺風格混用，且 Cupertino 元件無法自動受益於 M3 主題 token。統一改為 Material 3 Card + ListTile 呈現，消除平台風格混用問題。

## What Changes

- 移除 `package:flutter/cupertino.dart` import，設定頁面完全改用 Material 3 元件
- `CupertinoListSection.insetGrouped` → `Card.filled` + 外部 section header
- `CupertinoListTile` → `ListTile`
- `CupertinoColors.systemGroupedBackground` → 由 M3 theme `colorScheme.surface` 自動處理
- `CupertinoColors.systemRed` → `colorScheme.error`
- `GestureDetector` + bare `Icon` → `IconButton`（提供 M3 ripple feedback、tooltip、48x48 touch target）
- 硬編碼 `TextStyle(fontSize: 18)` → `Theme.of(context).textTheme` token

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `settings-view`: 列表佈局從 `CupertinoListSection.insetGrouped` + `CupertinoListTile` 改為 Material 3 `Card.filled` + `ListTile`，section header 改用 `textTheme.titleSmall`

## Impact

- Affected specs: `settings-view`（佈局需求變更）
- Affected code: `naver_blog_image_downloader/lib/ui/settings/widgets/settings_view.dart`
