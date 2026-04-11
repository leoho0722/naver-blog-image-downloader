## Why

應用程式需要一個統一的依賴注入入口，將所有 Service、Repository、ViewModel 透過 `MultiProvider` 注入 Widget 樹，並以 `MaterialApp.router` 整合 GoRouter 路由與 Material 3 主題。`main.dart` 與 `app.dart` 是整個應用程式的啟動與組裝層，負責 DI 配置與 App 殼層定義。

## What Changes

- 修改 `lib/main.dart`，配置 `MultiProvider` 包裹整個 App：
  - 註冊 Services（無狀態）：`ApiService`、`FileDownloadService`、`GalleryService`
  - 註冊 Repositories（SSOT）：`CacheRepository`、`PhotoRepository`（透過 `ProxyProvider4`）
  - 註冊 ViewModels（ChangeNotifier）：`BlogInputViewModel`、`DownloadViewModel`、`PhotoGalleryViewModel`、`SettingsViewModel`（透過 `ChangeNotifierProxyProvider` / `ChangeNotifierProxyProvider2`）
- 新增 `lib/app.dart`，實作 `NaverPhotoApp` Widget：
  - 使用 `MaterialApp.router` 整合 GoRouter
  - 套用 Material 3 亮色與暗色主題

## Capabilities

### New Capabilities

- `provider-di`: MultiProvider 依賴注入配置與 MaterialApp.router 進入點

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/main.dart`、`lib/app.dart`
- 依賴：S004（Theme）、S010-S013（Services）、S014（CacheRepository）、S019-S023（ViewModels）、S029（Router）
- 此為應用程式的最頂層組裝，所有功能模組均透過此處整合
