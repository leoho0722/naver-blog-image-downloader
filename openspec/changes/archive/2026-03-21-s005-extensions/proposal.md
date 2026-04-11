## Why

專案中多處需要重複的字串處理與格式化邏輯（如 URL 驗證、檔名清理、日期格式化等）。透過 Dart 擴充方法（extension methods）將這些共用邏輯掛載到既有型別上，可提升程式碼可讀性與重用性，避免建立冗餘的工具類別。

## What Changes

- 在 `lib/utils/extensions.dart` 中實作 Dart 擴充方法，涵蓋字串處理、格式化等常用功能

## Capabilities

### New Capabilities

- `extensions`: Dart 擴充方法（字串處理、格式化等）

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/utils/extensions.dart`
- 依賴：S001（專案依賴與目錄骨架）
- 此為共用工具層，後續各層級程式碼可依需求使用這些擴充方法
