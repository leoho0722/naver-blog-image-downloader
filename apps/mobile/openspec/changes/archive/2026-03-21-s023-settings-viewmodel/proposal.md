## Why

使用者在設定頁面需要查看目前快取使用狀況（總大小、各 Blog 快取資訊），並可手動清除全部快取或指定 Blog 的快取。`SettingsViewModel` 負責載入快取資訊、格式化快取大小顯示、以及呼叫 `CacheRepository` 的快取清除方法。此 ViewModel 是設定頁面的核心，讓使用者主動管理裝置儲存空間。

## What Changes

- 新增 `lib/ui/settings/view_model/settings_view_model.dart`，實作 `SettingsViewModel` 類別
- `SettingsViewModel` 提供以下核心功能：
  - `loadCacheInfo()` — 載入快取資訊，包含 `totalCacheSize` 與 `allMetadata`
  - `formattedCacheSize` getter — 格式化快取大小為人類可讀字串（如 "150.3 MB"）
  - `clearAllCache()` — 清除所有快取檔案與 metadata
  - `clearBlogCache(String blogId)` — 清除指定 Blog 的快取

## Capabilities

### New Capabilities

- `settings-viewmodel`: 快取資訊載入（totalCacheSize/allMetadata）、快取大小格式化、快取清除（全部/指定 Blog）

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/ui/settings/view_model/settings_view_model.dart`
- 依賴：S008（BlogCacheMetadata）、S014（CacheRepository）、S015（CacheRepository.clearAll/clearBlog/totalCacheSize）
- 此為設定頁面的核心 ViewModel，UI 層的 SettingsScreen 將依賴於此
