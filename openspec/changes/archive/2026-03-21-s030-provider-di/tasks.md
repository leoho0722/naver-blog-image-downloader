## 1. Service providers registered（Service 層 Provider 註冊）

- [x] 1.1 在 `lib/main.dart` 的 `MultiProvider` 中使用 `Provider` 註冊 `ApiService(baseUrl: AppConfig.baseUrl)`（Service providers registered）
- [x] 1.2 在 `MultiProvider` 中使用 `Provider` 註冊 `FileDownloadService()`（Service providers registered）
- [x] 1.3 在 `MultiProvider` 中使用 `Provider` 註冊 `GalleryService()`（Service providers registered）

## 2. Repository providers registered（Repository 層 Provider 註冊）

- [x] 2.1 在 `MultiProvider` 中使用 `Provider` 註冊 `CacheRepository()`（Repository providers registered）
- [x] 2.2 在 `MultiProvider` 中使用 `ProxyProvider4` 註冊 `PhotoRepository`，注入 `ApiService`、`FileDownloadService`、`GalleryService`、`CacheRepository`（Repository providers registered）

## 3. ViewModel providers registered（ViewModel 層 Provider 註冊）

- [x] 3.1 使用 `ChangeNotifierProxyProvider` 註冊 `BlogInputViewModel`，依賴 `PhotoRepository`（ViewModel providers registered）
- [x] 3.2 使用 `ChangeNotifierProxyProvider` 註冊 `DownloadViewModel`，依賴 `PhotoRepository`（ViewModel providers registered）
- [x] 3.3 使用 `ChangeNotifierProxyProvider2` 註冊 `PhotoGalleryViewModel`，依賴 `PhotoRepository` 與 `CacheRepository`（ViewModel providers registered）
- [x] 3.4 使用 `ChangeNotifierProxyProvider` 註冊 `SettingsViewModel`，依賴 `CacheRepository`（ViewModel providers registered）

## 4. NaverPhotoApp widget defined（NaverPhotoApp Widget 定義）

- [x] 4.1 在 `lib/app.dart` 中建立 `NaverPhotoApp` 類別，繼承 `StatelessWidget`（NaverPhotoApp widget defined）
- [x] 4.2 在 `build` 方法中回傳 `MaterialApp.router`，設定 `routerConfig: appRouter`、`theme: AppTheme.lightTheme`、`darkTheme: AppTheme.darkTheme`（NaverPhotoApp widget defined）

## 5. main function defined（main 函式定義）

- [x] 5.1 在 `lib/main.dart` 中定義 `main()` 函式，呼叫 `runApp()` 傳入 `MultiProvider(child: const NaverPhotoApp())`（main function defined）
