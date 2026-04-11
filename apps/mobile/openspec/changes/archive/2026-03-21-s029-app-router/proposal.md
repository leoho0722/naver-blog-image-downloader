## Why

應用程式需要宣告式路由配置，將 URL 路徑對應至各個頁面 Widget。使用 GoRouter 定義 5 條路由（首頁、下載頁、圖庫頁、照片詳情頁、設定頁），支援路徑參數傳遞 blogId 與 photoId，確保各頁面間的導航邏輯集中管理且易於維護。

## What Changes

- 在 `lib/routing/app_router.dart` 中定義 `appRouter` GoRouter 實例
- 配置 5 條路由：`/`、`/download/:blogId`、`/gallery/:blogId`、`/detail/:photoId`、`/settings`
- 設定 `initialLocation` 為 `/`（首頁）
- 各路由對應至對應的 View Widget（BlogInputView、DownloadView、PhotoGalleryView、PhotoDetailView、SettingsView）

## Capabilities

### New Capabilities

- `app-router`: GoRouter 路由配置，定義 5 條路由與路徑參數對應

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/routing/app_router.dart`
- 依賴：S024-S028（所有 View 頁面 Widget）
- 此為導航基礎設施，S030（Provider DI 與進入點）依賴於此路由配置
