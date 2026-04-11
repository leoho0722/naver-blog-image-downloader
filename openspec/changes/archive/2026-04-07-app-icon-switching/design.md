## Context

目前 App 僅有一組圖示。v1.5.0 新增圖示切換功能，讓使用者可在設定頁面選擇「預設」或「新版」圖示。此功能橫跨 Flutter、iOS、Android 三個平台，需透過 MethodChannel 橋接原生 API。

現有架構已有兩組 MethodChannel（`gallery`、`photoViewer`），遵循統一的通道命名與檔案組織模式。設定頁面已有外觀、語言、快取、關於四個區段，全域設定由 `AppSettingsViewModel` 管理並透過 `SettingsRepository` 持久化。

## Goals / Non-Goals

**Goals:**

- 使用者可在設定頁面切換「預設」與「新版」兩版 App 圖示
- iOS 與 Android 雙平台皆支援圖示切換
- 圖示偏好持久化至 SharedPreferences，重啟後維持選擇
- 遵循既有 MethodChannel 架構模式（Channel → Service → Repository → ViewModel → View）

**Non-Goals:**

- 圖示數量目前為兩版，但 UI 架構已支援擴充（水平滑動可無限捲動、網格可自動換行）
- 不抑制 iOS 系統彈窗（`setAlternateIconName` 的系統行為無法迴避）
- 版號更新不在此變更範圍內（需配合後端資料更新，archive 前另行處理）

## Decisions

### AppIcon 列舉設計

採用 enum 搭配 `nativeKey` 與 `previewAsset` 兩個欄位，仿 `SupportedLocale` 模式。`nativeKey` 用於 MethodChannel 傳遞與 SharedPreferences 儲存，`previewAsset` 用於設定頁面顯示預覽圖。

替代方案：使用字串常數而非 enum。但 enum 可在編譯期檢查合法值，且與既有 `SupportedLocale` 模式一致。

### MethodChannel 設計

新增通道 `com.leoho.naverBlogImageDownloader/appIcon`，提供兩個方法：
- `setAppIcon(iconName: String)` — 切換圖示
- `getCurrentIcon()` → `String` — 取得當前圖示名稱

Flutter 側封裝為 `AppIconService`，遵循 `PhotoService` 的模式（`@Riverpod(keepAlive: true)` 單例、`PlatformException` 轉 `AppError`）。

### iOS 替代圖示機制

使用 `UIApplication.shared.setAlternateIconName(_:)` API：
- `nil` 表示回到主圖示（預設版，來自 `AppIcon.appiconset`）
- `"NewAppIcon"` 表示切到替代圖示（新版，來自 `NewAppIcon.appiconset`）

採用 Xcode 14+ 的 xcassets icon set 方式：替代圖示放在 `Assets.xcassets/NewAppIcon.appiconset/` 中，透過 Xcode build settings 的 `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES` 啟用，不需要在 Info.plist 中手動設定 `CFBundleIcons`。

替代方案：使用鬆散 PNG 檔案搭配 Info.plist `CFBundleAlternateIcons` 設定（Legacy 方式）。但 xcassets 方式更簡潔，且 Xcode 會自動管理檔案。

### Android 替代圖示機制

使用 `activity-alias` 搭配 `PackageManager.setComponentEnabledSetting`：
- `MainActivityClassic`：預設啟用，使用 `@mipmap/ic_launcher`
- `MainActivityNew`：預設停用，使用 `@mipmap/ic_launcher_new`

切換時停用當前 alias、啟用目標 alias，使用 `DONT_KILL_APP` 旗標避免殺掉 App。原 `MainActivity` 的 LAUNCHER intent-filter 移至 activity-alias。

替代方案：使用 `ShortcutManager` 修改圖示。但此方式僅影響捷徑而非啟動器圖示，不符需求。

### 設定頁面 UI 設計

在「外觀」與「語言」區段之間插入「App 圖示」區段，支援兩種檢視模式，使用者可透過標題右側的切換按鈕自行切換：

1. **水平滑動模式（`AppIconPickerStyle.horizontalScroll`）**：使用 `SingleChildScrollView` 水平排列圖示卡片，每個卡片包含 72×72 預覽圖、radio button icon（`Icons.radio_button_checked` / `unchecked`）與本地化名稱。不顯示 scrollbar，支援無限擴充。

2. **Bottom Sheet 網格模式（`AppIconPickerStyle.bottomSheet`）**：設定頁顯示當前選取圖示的 `InputDecorator`（含 32×32 預覽圖 + 名稱 + 下拉箭頭），點擊後彈出 Bottom Sheet，內含標題「選擇 App 圖示」與 3 欄 `GridView`，每格顯示 64×64 預覽圖 + radio button icon + 名稱。

切換按鈕顯示目標模式的 icon 與文字（如目前為滑動模式時顯示「以網格檢視」），引導使用者理解點擊後的效果。

預覽圖來源：從 iOS 素材的 60x60@2x（120×120）複製至 `assets/icons/` 作為 Flutter asset。

### 狀態管理與持久化

圖示偏好整合至既有 `AppSettingsState`（新增 `appIcon` 欄位），由 `AppSettingsViewModel.setAppIcon()` 執行樂觀更新 → `SettingsRepository.saveAppIcon()` 持久化 → `AppIconService.setAppIcon()` 呼叫原生 API → `LogRepository.logSettingsChange()` 記錄。

儲存 key 為 `app_icon`，值為 `AppIcon.nativeKey`（`"default"` 或 `"new"`）。

## Risks / Trade-offs

- **iOS 系統彈窗** → 無法抑制，使用者每次切換都會看到「你已更改 XXX 的圖示」提示。這是 iOS 系統層級行為。
- **Android 啟動器延遲** → 部分啟動器在 activity-alias 切換後可能短暫閃爍或延遲更新圖示。`DONT_KILL_APP` 旗標可減緩但無法完全消除。
- **Xcode Build Settings** → 需確認 `ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS` 設為 `YES`，使 Xcode 將所有 icon set 包含進 App bundle。
- **初始狀態同步** → 從舊版升級至 v1.5.0 時，SharedPreferences 無 `app_icon` 值，`loadAppIcon()` 回傳 `defaultIcon`，與裝置實際圖示一致，無需遷移。
