## Context

設定頁面目前使用 `CupertinoListSection.insetGrouped` + `CupertinoListTile` 呈現列表，是專案中唯一引入 `package:flutter/cupertino.dart` 的檔案。專案主題系統已全面採用 Material 3（`ColorScheme.fromSeed`），其餘頁面均使用 Material 元件。

設定頁面以 `showModalBottomSheet` 方式呈現，包含兩個 section：快取管理、關於（版本號）。

## Goals / Non-Goals

**Goals:**

- 將設定頁面所有 Cupertino 元件替換為 Material 3 等效元件
- 採用 Card.filled + ListTile 的卡片式多 Section 呈現
- 所有色彩與文字樣式統一使用 M3 theme token
- 清除按鈕改用 IconButton 提供標準 ripple 回饋與無障礙支援

**Non-Goals:**

- 不修改 SettingsViewModel 或 CacheRepository 邏輯
- 不修改 AppTheme 主題配置
- 不新增設定項目或功能
- 不修改確認對話框（已是 Material AlertDialog）

## Decisions

### Card.filled 作為 Section 容器

選擇 `Card.filled` 而非 `Card`（elevated）或 `Card.outlined`。

- `Card.filled` 使用 `surfaceContainerHighest`，在 bottom sheet（`surfaceContainerLow`）內形成自然層次
- `Card`（elevated）帶有陰影，在 bottom sheet 內視覺過重
- `Card.outlined` 帶有明顯邊框線，風格偏向表單而非設定頁面

### Section header 置於 Card 外部

header 文字（「快取」、「關於」）放在 Card 上方，而非 Card 內部。

- 對齊 Android 系統設定與 Google 官方 App 的 M3 設定頁面慣例
- 使用 `textTheme.titleSmall` + `colorScheme.onSurfaceVariant` 作為 label 樣式

### IconButton 替換 GestureDetector

清除快取按鈕從 `GestureDetector` + bare `Icon` 改為 `IconButton`。

- 提供 Material 3 標準 ripple/splash feedback
- 自動滿足 48x48 最小 touch target（M3 無障礙規範）
- 支援 `tooltip` 屬性供螢幕閱讀器使用

### 移除硬編碼 TextStyle

所有 `TextStyle(fontSize: 18)` 改為使用 `Theme.of(context).textTheme` token。

- `ListTile.title` 預設使用 `bodyLarge`，無需額外指定
- trailing 文字明確使用 `textTheme.bodyLarge` + `colorScheme.onSurfaceVariant`

## Risks / Trade-offs

- [視覺差異] Card.filled 的圓角與間距與 CupertinoListSection.insetGrouped 不同 → 預期中的設計變更，非風險
- [iOS 使用者體感] iOS 使用者習慣的 grouped list 風格消失 → 統一 M3 風格是明確的設計決策，且 App 其餘頁面已是 Material 風格
