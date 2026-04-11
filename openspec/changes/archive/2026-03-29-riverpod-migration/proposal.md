## Why

專案目前使用 `provider: ^6.1.2` 搭配自訂 `Result<T>` sealed class 與自訂狀態 enum/sealed class 管理狀態。Provider 套件在 Riverpod 生態系中已停止積極發展，且存在以下限制：缺乏編譯期類型安全與依賴驗證、`ProxyProvider` 冗長且易出錯、測試需手動組裝 `MultiProvider`、無自動 dispose 生命週期管理。v1.1.0 將全面遷移至 Riverpod 3.x，採用官方最推薦的 code generation + AsyncValue 模式。

## What Changes

- **BREAKING**：移除 `Result<T>` sealed class（`lib/ui/core/result.dart`），Repository 層改為直接 throw Exception
- **BREAKING**：移除所有自訂狀態類型（`FetchState` sealed class、`DownloadState`/`SaveState`/`SettingsState`/`GalleryMode` enum、`GallerySaveErrorType` enum），統一改用 `AsyncValue` 處理非同步狀態
- 套件替換：`provider: ^6.1.2` → `flutter_riverpod: ^3.3.1` + `riverpod_annotation: ^4.0.2`
- 新增 dev 依賴：`build_runner: ^2.13.1`、`riverpod_generator: ^4.0.3`、`riverpod_lint: ^3.1.3`、`custom_lint: ^0.8.1`
- Service / Repository 層加上 `@Riverpod(keepAlive: true)` provider function，以 `ref.watch` 宣告式解析依賴（取代 `ProxyProvider4`）
- 6 個 ViewModel 從 `ChangeNotifier` 遷移至 `Notifier<State>` 或 `AsyncNotifier<State>`，搭配不可變 State class + `copyWith`
- 6 個 View 從 `StatefulWidget` 遷移至 `ConsumerStatefulWidget`，`context.watch/read` → `ref.watch/read`
- `app.dart` 從 `StatelessWidget` 遷移至 `ConsumerWidget`
- `main.dart` 入口點從 `MultiProvider` 遷移至 `ProviderScope`
- `analysis_options.yaml` 新增 `custom_lint` plugin
- `PhotoDetailCapsuleBar` 元件介面從 `SaveState` 改為 `AsyncValue<void>?`
- 所有 ViewModel 測試遷移至 `ProviderContainer` + override 模式
- 版號升級至 `1.1.0+1`

## Non-Goals

- 不變更 Service 層的 class 本體（`ApiService`、`FileDownloadService`、`GalleryService`、`LocalStorageService`）
- 不變更 Repository 層的 class 建構邏輯（僅移除 `Result<T>` 包裝與新增 provider function）
- 不變更 Model / DTO 檔案
- 不變更 GoRouter 路由設定
- 不變更原生層（Swift / Kotlin）程式碼
- 不引入 `freezed` 做不可變資料類別（使用手動 `copyWith`）
- 不使用 `AsyncValue` 取代 `FetchLoadingPhase` 與 `FetchErrorType`（這些攜帶 `AsyncValue` 無法表達的領域資料，改以 `FetchException` 包裝）

## Capabilities

### New Capabilities

- `riverpod-di`: Riverpod 3.x code generation 依賴注入架構，以 `@riverpod` 註解定義 Service / Repository / ViewModel provider，取代 Provider 套件的 `MultiProvider` + `ProxyProvider` 模式

### Modified Capabilities

- `result-type`: 移除 `Result<T>` sealed class，Repository 改為直接 throw Exception
- `provider-di`: 完全被 `riverpod-di` 取代（此 spec 將標記為 deprecated 或移除）
- `project-dependencies`: 套件替換（provider → flutter_riverpod + riverpod_annotation + dev 依賴）
- `blog-input-viewmodel`: `FetchState` sealed class → `AsyncValue<FetchResult?>` + `FetchLoadingPhase?` + `FetchException`
- `download-viewmodel`: `DownloadState` enum → `AsyncValue<DownloadBatchResult?>` + 進度欄位
- `photo-gallery-viewmodel`: `GalleryMode` enum + `GallerySaveErrorType` → `bool isSelectMode` + `AsyncValue<void>?`
- `photo-detail-viewmodel`: `SaveState` enum → `AsyncValue<void>?`
- `settings-viewmodel`: `SettingsState` enum → `AsyncNotifier` 自身的 `AsyncValue`
- `app-settings-viewmodel`: `ChangeNotifier` + `loadSettings()` → `AsyncNotifier`，`build()` 自動載入
- `settings-repository`: 回傳型別從 `Result<T>` 改為直接回傳值或 throw
- `photo-repo-fetch`: 回傳型別從 `Result<FetchResult>` 改為 `FetchResult`（throw on error）
- `photo-repo-save`: 回傳型別從 `Result<void>` 改為 `void`（throw on error）

## Impact

- **受影響 specs**：1 新建 + 17 修改（如上列）
- **受影響程式碼**：約 29 個檔案修改 + 1 個刪除（`result.dart`）
  - 基礎設施：`pubspec.yaml`、`analysis_options.yaml`、`lib/main.dart`
  - Service 層（4 個）：加 provider function + `part` directive
  - Repository 層（3 個）：移除 `Result<T>` + 加 provider function
  - ViewModel 層（6 個）：全面重構為 Notifier/AsyncNotifier + State class
  - View 層（6 個）：遷移至 ConsumerStatefulWidget/ConsumerWidget
  - UI 元件（1 個）：`photo_detail_capsule_bar.dart`
  - 測試（6 個）：ProviderContainer 模式
- **受影響依賴**：移除 `provider`，新增 `flutter_riverpod`、`riverpod_annotation`、`build_runner`、`riverpod_generator`、`riverpod_lint`、`custom_lint`
