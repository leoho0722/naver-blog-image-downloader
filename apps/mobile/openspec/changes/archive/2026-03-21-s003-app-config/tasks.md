## 1. ApiStage enum defined（ApiStage 列舉與 dart-define 環境切換）

- [x] 1.1 在 `lib/config/app_config.dart` 中定義 `ApiStage` enum，包含 defaultStage、ut、stg、uat、prod
- [x] 1.2 每個列舉值宣告對應的 `String value` 屬性

## 2. AppConfig class defined（AppConfig 靜態配置類別）

- [x] 2.1 定義 `AppConfig` 為 `abstract final class`
- [x] 2.2 使用 `String.fromEnvironment('API_STAGE', defaultValue: 'default')` 讀取編譯參數
- [x] 2.3 透過 `firstWhere` + `orElse` 解析 `ApiStage stage`
- [x] 2.4 實作 `baseUrl` getter，組合 API host 與 stage value

## 3. Constants class defined（Constants 常數類別）

- [x] 3.1 在 `lib/utils/constants.dart` 中實作 Constants class defined：定義 `Constants` 為 `abstract final class`
- [x] 3.2 宣告 `static const String appName`，設定應用程式名稱
