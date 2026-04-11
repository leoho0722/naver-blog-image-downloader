## Context

設定頁面目前僅提供快取管理（快取大小顯示 + 清除）與版本資訊。全應用 UI 字串皆為硬編碼中文，不具備國際化基礎。`app.dart` 中的 `MaterialApp.router` 未設定 `themeMode`，預設跟隨系統但使用者無法手動切換。`LocalStorageService` 已存在但未接入 DI 容器，也未被任何模組使用。

## Goals / Non-Goals

**Goals:**

- 在設定頁面提供外觀模式切換（系統 / 淺色 / 深色）與語系切換（繁體中文 / English）
- 使用者偏好透過 SharedPreferences 持久化
- 建立 Flutter l10n 基礎建設，全應用字串國際化
- ViewModel 中的硬編碼訊息重構為 enum，View 負責映射本地化字串

**Non-Goals:**

- 不新增第四語言（僅 zh_TW + en + ko）
- 不修改現有 `AppTheme` 的色彩配置（lightTheme / darkTheme 內容不變）
- 不重構現有 `SettingsViewModel` 的快取管理邏輯
- 不實作「跟隨系統語系」選項（語系必須手動選擇）

## Decisions

### 新建 SettingsRepository 而非擴充 CacheRepository

`CacheRepository` 職責為磁碟快取管理（檔案 I/O + metadata），使用者偏好設定（主題 / 語系）屬於不同領域。新建 `SettingsRepository` 封裝 `LocalStorageService`，遵循單一職責原則。

替代方案：直接在 ViewModel 呼叫 `LocalStorageService` — 違反架構規則（ViewModel 不得直接存取 Service）。

### 新建 AppSettingsViewModel 獨立於現有 SettingsViewModel

現有 `SettingsViewModel` 管理快取操作，生命週期限於設定頁面。主題與語系需在 `MaterialApp` 層級（全域）響應變更。新建 `AppSettingsViewModel` 註冊在 `MultiProvider` 最頂層，`NaverPhotoApp` 透過 `context.watch` 讀取。

設定頁面同時 watch 兩個 ViewModel：`AppSettingsViewModel`（主題 / 語系）+ `SettingsViewModel`（快取）。

### 外觀模式使用 SegmentedButton、語系使用 DropdownMenu

外觀模式固定 3 個選項（系統 / 淺色 / 深色），`SegmentedButton<ThemeMode>` 一目了然。語系目前 2 個選項但未來可能擴充，`DropdownMenu<SupportedLocale>` 方便新增語言時無需更換 UI 元件。

### l10n 採用 Flutter 官方 gen_l10n 方案

使用 `l10n.yaml` + ARB 檔案 + `AppLocalizations`，以 `app_zh_TW.arb` 為範本檔（繁體中文是主要語言）。`pubspec.yaml` 加入 `generate: true` 啟用自動產生。

### ViewModel 字串重構為 enum

`BlogInputViewModel` 的 `FetchLoading.statusMessage`（String）改為 `FetchLoading.phase`（enum `FetchLoadingPhase`）；`FetchError.message`（String）改為 `FetchError.errorType`（enum `FetchErrorType`）。View 層以 switch 將 enum 映射為 `AppLocalizations.of(context).xxx`。此模式確保 ViewModel 保持語系無關。

### SharedPreferences 提前初始化

目前 `CacheRepository` 在內部 lazy 初始化 `SharedPreferences`。為了在 `runApp` 前建立 `LocalStorageService`，需在 `main()` 中 `await SharedPreferences.getInstance()`。兩者共用同一 singleton 實例，無衝突。

## Risks / Trade-offs

- **[全應用字串提取工作量大]** → 約 60+ 字串需提取至 ARB，但一次到位避免後續逐步遷移的不一致性
- **[ViewModel 重構為 breaking change]** → `FetchError.message` → `FetchError.errorType` 會影響所有消費端，需同步修改 View 層。在同一 change 中完成，風險可控
- **[語系切換後 SnackBar / Dialog 不即時更新]** → 已顯示的 SnackBar 內容不會隨語系切換即時更新，此為 Flutter 預期行為，不額外處理
- **[DropdownMenu 與 SegmentedButton 視覺風格略有差異]** → 使用者明確選擇此方案以利未來擴充，可接受的 trade-off
