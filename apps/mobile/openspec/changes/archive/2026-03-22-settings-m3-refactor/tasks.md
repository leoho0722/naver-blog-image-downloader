## 1. 移除 Cupertino 依賴

- [x] 1.1 移除 `import 'package:flutter/cupertino.dart'` 並移除 Scaffold 的 `backgroundColor`（Inset grouped list layout — 改用 theme surface）

## 2. 替換 Section 容器與 Header

- [x] [P] 2.1 實作快取 Section：Card.filled 作為 Section 容器 + 外部 section header 置於 Card 外部，使用 `textTheme.titleSmall` + `colorScheme.onSurfaceVariant`（Cache size display）
- [x] [P] 2.2 實作關於 Section：Card.filled + section header + ListTile 顯示 Version number display

## 3. 替換 ListTile 與互動元件

- [x] 3.1 快取 ListTile：移除硬編碼 TextStyle，trailing 文字使用 `textTheme.bodyLarge` + `colorScheme.onSurfaceVariant`（移除硬編碼 TextStyle）
- [x] 3.2 Clear all button — IconButton 替換 GestureDetector，使用 `colorScheme.error` + `tooltip`
- [x] 3.3 版本 ListTile：trailing 文字使用 `textTheme.bodyLarge` + `colorScheme.onSurfaceVariant`

## 4. 驗證

- [x] 4.1 執行 `flutter analyze` 確認零錯誤
- [x] 4.2 執行 `dart format .` 確認格式一致
- [x] 4.3 確認 `lib/` 內無任何 `cupertino` import
