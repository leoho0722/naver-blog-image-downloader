## Context

本專案採用 MVVM 架構與 `provider` 套件進行狀態管理。所有 Service（S010-S013）、Repository（S014）及 ViewModel（S019-S023）已各自實作完成，需要在應用程式進入點將它們統一註冊至 Widget 樹，並建立 `MaterialApp.router` 整合路由與主題。

## Goals / Non-Goals

**Goals:**

- 在 `main.dart` 中配置 `MultiProvider`，依序註冊所有 Service、Repository 與 ViewModel
- 使用 `ProxyProvider4` 為 `PhotoRepository` 注入其四個依賴
- 使用 `ChangeNotifierProxyProvider` 為各 ViewModel 注入對應 Repository
- 在 `app.dart` 中實作 `NaverPhotoApp` Widget，使用 `MaterialApp.router` 整合路由與主題

**Non-Goals:**

- 不實作環境切換或 flavor 配置
- 不實作 Service Locator 模式（如 get_it）
- 不處理 App 生命週期管理
- 不實作 Splash Screen 或啟動動畫

## Decisions

### Service 層 Provider 註冊

使用 `Provider(create: (_) => ...)` 註冊以下無狀態服務：
- `ApiService(baseUrl: AppConfig.baseUrl)`：傳入 AppConfig 定義的 API base URL
- `FileDownloadService()`：檔案下載服務
- `GalleryService()`：相簿存取服務

Service 不依賴其他 Provider，使用最基本的 `Provider` 即可。

### Repository 層 Provider 註冊

- `CacheRepository()`：使用 `Provider` 直接建立，不依賴其他 Provider
- `PhotoRepository`：使用 `ProxyProvider4` 組合 `ApiService`、`FileDownloadService`、`GalleryService`、`CacheRepository` 四個依賴

### ViewModel 層 Provider 註冊

使用 `ChangeNotifierProxyProvider` 系列註冊各 ViewModel：
- `BlogInputViewModel`：依賴 `PhotoRepository`，使用 `ChangeNotifierProxyProvider`
- `DownloadViewModel`：依賴 `PhotoRepository`，使用 `ChangeNotifierProxyProvider`
- `PhotoGalleryViewModel`：依賴 `PhotoRepository` 與 `CacheRepository`，使用 `ChangeNotifierProxyProvider2`
- `SettingsViewModel`：依賴 `CacheRepository`，使用 `ChangeNotifierProxyProvider`

### NaverPhotoApp Widget 定義

在 `lib/app.dart` 中定義 `NaverPhotoApp` 為 `StatelessWidget`，其 `build` 方法回傳 `MaterialApp.router`：
- `routerConfig`：使用 S029 定義的 `appRouter`
- `theme`：使用 `AppTheme.lightTheme`
- `darkTheme`：使用 `AppTheme.darkTheme`

### main 函式定義

在 `lib/main.dart` 中定義 `main()` 函式，呼叫 `runApp()` 並傳入 `MultiProvider` 包裹的 `NaverPhotoApp`。

## Risks / Trade-offs

- [取捨] 所有 Provider 集中在 `main.dart` 單一檔案，清晰但隨著功能增加可能過長 → 目前 Provider 數量可控，無需拆分
- [取捨] 使用 `ProxyProvider` 而非手動注入，增加自動更新能力但增加宣告複雜度 → 確保依賴變更時自動重建下游物件
- [風險] Provider 註冊順序錯誤可能導致執行期找不到依賴 → 嚴格按照 Service → Repository → ViewModel 的順序註冊
