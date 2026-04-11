## Why

應用程式需要集中管理 API base URL 等環境配置，以及共用常數（如應用程式名稱、版本資訊、預設設定值等）。將配置與常數集中定義可避免硬編碼散落各處，便於維護與環境切換。

## What Changes

- 在 `lib/config/app_config.dart` 中實作 `ApiStage` 列舉與 `AppConfig` 類別，透過 `--dart-define=API_STAGE` 支援多環境部署階段切換
- 在 `lib/utils/constants.dart` 中定義 `Constants` 類別，集中管理應用程式共用常數

## Capabilities

### New Capabilities

- `app-config`: 應用程式配置（AppConfig）與共用常數（Constants）的定義

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/config/app_config.dart`、`lib/utils/constants.dart`
- 依賴：S001（專案依賴與目錄骨架）
- 此為應用程式配置基礎，後續 HTTP 服務層與 UI 層均依賴於此
