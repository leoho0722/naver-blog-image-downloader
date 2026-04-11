## 1. GoRouter instance defined（GoRouter 實例定義）

- [x] 1.1 在 `lib/routing/app_router.dart` 中建立頂層 `appRouter` 變數，型別為 `GoRouter`，設定 `initialLocation: '/'`（GoRouter instance defined）

## 2. Static routes configured（路由表配置 - 靜態路由）

- [x] 2.1 在 `appRouter` 的 `routes` 中加入 `GoRoute(path: '/')`，builder 回傳 `BlogInputView`（Static routes configured）
- [x] 2.2 在 `appRouter` 的 `routes` 中加入 `GoRoute(path: '/settings')`，builder 回傳 `SettingsView`（Static routes configured）

## 3. Parameterized routes configured（路由表配置 - 參數化路由）

- [x] 3.1 在 `appRouter` 的 `routes` 中加入 `GoRoute(path: '/download/:blogId')`，builder 回傳 `DownloadView`（Parameterized routes configured）
- [x] 3.2 在 `appRouter` 的 `routes` 中加入 `GoRoute(path: '/gallery/:blogId')`，builder 回傳 `PhotoGalleryView`（Parameterized routes configured）
- [x] 3.3 在 `appRouter` 的 `routes` 中加入 `GoRoute(path: '/detail/:photoId')`，builder 回傳 `PhotoDetailView`（Parameterized routes configured）

## 4. Path parameters extracted from state（路徑參數提取）

- [x] 4.1 在 `/download/:blogId` 與 `/gallery/:blogId` 路由中，從 `state.pathParameters['blogId']` 提取 `blogId` 並傳遞至對應 View 建構函式（Path parameters extracted from state）
- [x] 4.2 在 `/detail/:photoId` 路由中，從 `state.pathParameters['photoId']` 提取 `photoId` 並傳遞至 `PhotoDetailView` 建構函式（Path parameters extracted from state）
