## Context

應用程式使用 MVVM 架構，共有 5 個頁面（BlogInputView、DownloadView、PhotoGalleryView、PhotoDetailView、SettingsView）。需要集中式的路由配置將 URL 路徑對應至各頁面 Widget，並透過路徑參數傳遞 blogId 與 photoId。

## Goals / Non-Goals

**Goals:**

- 定義 GoRouter 實例，配置 5 條路由
- 支援路徑參數（`:blogId`、`:photoId`）
- 設定首頁為初始路由
- 從 `GoRouterState` 中提取路徑參數傳遞至頁面

**Non-Goals:**

- 不實作巢狀路由（Nested Routes）
- 不實作路由守衛（Redirect / Guard）
- 不實作轉場動畫自訂
- 不實作深度連結（Deep Linking）處理

## Decisions

### GoRouter 實例定義

在 `lib/routing/app_router.dart` 中定義頂層 `appRouter` 變數，型別為 `GoRouter`。設定 `initialLocation: '/'`，使應用程式啟動時顯示首頁。

### 路由表配置

定義 5 條 `GoRoute`：

| 路徑 | 頁面 Widget | 路徑參數 |
|------|------------|---------|
| `/` | `BlogInputView` | 無 |
| `/download/:blogId` | `DownloadView` | `blogId` |
| `/gallery/:blogId` | `PhotoGalleryView` | `blogId` |
| `/detail/:photoId` | `PhotoDetailView` | `photoId` |
| `/settings` | `SettingsView` | 無 |

### 路徑參數提取

使用 `state.pathParameters['blogId']` 與 `state.pathParameters['photoId']` 從 `GoRouterState` 中提取路徑參數，傳遞至各頁面 Widget 的建構函式。

## Risks / Trade-offs

- [取捨] 使用頂層變數而非依賴注入提供 GoRouter 實例，簡化使用但降低可測試性 → 對於此應用程式規模已足夠
- [取捨] 不使用巢狀路由（如 ShellRoute），保持路由結構扁平化，簡單直觀但不支援持久化導航欄 → 目前頁面間為線性流程，扁平路由已滿足需求
- [風險] 路徑參數缺失時可能導致執行期錯誤 → 透過 `!` 強制解包或提供預設值處理
