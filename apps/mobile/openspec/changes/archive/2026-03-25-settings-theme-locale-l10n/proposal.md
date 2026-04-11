## Why

設定頁面目前僅提供快取管理與版本資訊，缺少外觀模式切換和語系切換功能。使用者無法依據個人偏好調整深淺色主題，也無法將介面切換為英文。此外，全應用 UI 字串皆為硬編碼中文，不具備國際化基礎建設。

## What Changes

- 在設定頁面新增「外觀」區段，提供系統 / 淺色 / 深色三種主題模式切換
- 在設定頁面新增「語言」區段，提供繁體中文 / English / 한국어 語系切換
- 使用者偏好透過 SharedPreferences 持久化，重啟後保留選擇
- 建立 Flutter l10n 基礎建設（ARB 檔案、AppLocalizations）
- 全應用約 60+ 硬編碼中文字串提取至 ARB 檔案，支援繁中/英文/韓文三語
- ViewModel 中的硬編碼錯誤/狀態訊息重構為 enum，由 View 負責映射本地化字串

## Capabilities

### New Capabilities

- `settings-repository`: 使用者偏好設定的持久化 Repository，封裝 LocalStorageService 提供主題模式與語系的讀寫介面
- `app-settings-viewmodel`: 全域偏好設定的 ViewModel（ChangeNotifier），管理 ThemeMode 與 Locale 狀態，供 MaterialApp 層級響應式使用
- `supported-locale`: 支援語系的 enum 定義，包含 Locale 物件與顯示名稱
- `app-l10n`: Flutter l10n 基礎建設（l10n.yaml、ARB 檔案、AppLocalizations 整合）

### Modified Capabilities

- `app-theme`: 新增執行期 ThemeMode 切換（原僅提供靜態 lightTheme / darkTheme 定義）
- `settings-view`: 新增外觀模式（SegmentedButton）與語言（DropdownMenu）UI 區段
- `settings-viewmodel`: 與新建的 AppSettingsViewModel 協作，設定頁面同時 watch 兩個 ViewModel
- `local-storage-service`: 首次接入 DI 容器並實際使用
- `provider-di`: 新增 LocalStorageService、SettingsRepository、AppSettingsViewModel 三個 Provider
- `project-dependencies`: 新增 flutter_localizations、intl 依賴
- `blog-input-view`: 硬編碼中文字串替換為 AppLocalizations
- `blog-input-viewmodel`: FetchError / FetchLoading 的 String 欄位重構為 enum（FetchErrorType / FetchLoadingPhase），移除 _humanReadableError()
- `download-view`: 硬編碼中文字串替換為 AppLocalizations
- `photo-gallery-view`: 硬編碼中文字串替換為 AppLocalizations
- `photo-gallery-viewmodel`: 錯誤訊息字串重構為 enum
- `photo-detail-view`: 硬編碼中文字串替換為 AppLocalizations

## Impact

- **新增依賴**：flutter_localizations (SDK)、intl
- **新增檔案**：l10n.yaml、lib/l10n/app_zh_TW.arb、lib/l10n/app_en.arb、lib/l10n/app_ko.arb、lib/config/app_settings_keys.dart、lib/config/supported_locale.dart、lib/data/repositories/settings_repository.dart、lib/ui/core/view_model/app_settings_view_model.dart
- **修改檔案**：pubspec.yaml、lib/app.dart、lib/main.dart、lib/ui/settings/widgets/settings_view.dart、lib/ui/blog_input/ (view + viewmodel)、lib/ui/download/widgets/download_view.dart、lib/ui/photo_gallery/ (view + viewmodel)、lib/ui/photo_detail/widgets/photo_detail_view.dart
