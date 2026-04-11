## Context

應用程式需要與後端 Lambda API 通訊，API base URL 等配置需集中管理。API Gateway 使用部署階段（stage）區分不同環境（default、ut、stg、uat、prod），需要支援在編譯時切換。此外，應用程式中有多處使用的常數值（如應用程式名稱）也需統一定義。

## Goals / Non-Goals

**Goals:**

- 實作 `ApiStage` 列舉，定義所有可用的 API Gateway 部署階段
- 實作 `AppConfig` 類別，透過 `--dart-define` 支援編譯時環境切換
- 實作 `Constants` 類別，定義應用程式共用常數

**Non-Goals:**

- 不實作執行期動態配置載入
- 不實作 .env 檔案讀取
- 不實作 Flutter Flavors

## Decisions

### ApiStage 列舉與 dart-define 環境切換

使用 `enum ApiStage` 定義所有部署階段（default、ut、stg、uat、prod），搭配 `String.fromEnvironment('API_STAGE')` 在編譯時讀取環境參數。未指定時預設為 `default`。

優點：零額外套件、CI/CD 易於配置、新增環境只需在 enum 加一行。

### AppConfig 靜態配置類別

使用 abstract final class 定義 `AppConfig`，將 API Gateway 根路徑與部署階段分離：
- `_apiHost`：API Gateway 根路徑（不含階段）
- `stage`：由 `--dart-define=API_STAGE` 決定的 `ApiStage`
- `baseUrl`：自動組合 `_apiHost` + `stage.value`

### Constants 常數類別

使用 abstract final class 定義 `Constants`，集中管理應用程式常數：
- 應用程式名稱

## Risks / Trade-offs

- [取捨] 使用 `String.fromEnvironment` 而非 Flavors，更輕量但無法區分 App Icon、Bundle ID 等 → 目前僅需切換 API stage，已足夠
- [取捨] `firstWhere` + `orElse` 做 stage 解析，若傳入無效值會靜默回退到 default → 可接受，避免因配置錯誤導致 App 無法啟動
