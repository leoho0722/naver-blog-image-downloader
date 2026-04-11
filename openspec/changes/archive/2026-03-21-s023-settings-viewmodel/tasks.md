## 1. Settings state properties（快取資訊載入策略）

- [x] 1.1 建立 `lib/ui/settings/view_model/settings_view_model.dart`，實作 `SettingsViewModel extends ChangeNotifier`，包含建構子接收 `CacheRepository`，以及 settings state properties 的所有屬性（cacheSizeBytes、cachedBlogs、isClearing）

## 2. Load cache info（快取資訊載入策略）

- [x] 2.1 實作 `loadCacheInfo()` 方法，完成 load cache info 功能，呼叫 `CacheRepository.totalCacheSize()` 與 `CacheRepository.allMetadata()` 取得快取資訊並更新狀態

## 3. Formatted cache size（快取大小格式化）

- [x] 3.1 實作 `formattedCacheSize` getter，完成 formatted cache size 功能，將 `_cacheSizeBytes` 轉換為 `"X.X MB"` 格式的人類可讀字串

## 4. Clear all cache（清除後自動重新載入）

- [x] 4.1 實作 `clearAllCache()` 方法，完成 clear all cache 功能，設定 `_isClearing` 旗標、呼叫 `CacheRepository.clearAll()`、清除後自動呼叫 `loadCacheInfo()` 重新載入

## 5. Clear blog cache（清除後自動重新載入）

- [x] 5.1 實作 `clearBlogCache(String blogId)` 方法，完成 clear blog cache 功能，設定 `_isClearing` 旗標、呼叫 `CacheRepository.clearBlog(blogId)`、清除後自動呼叫 `loadCacheInfo()` 重新載入
