## 1. Dependencies + l10n 基礎建設

- [x] 1.1 修改 `pubspec.yaml` 新增 localization dependencies（flutter_localizations、intl）並在 flutter 區段加入 `generate: true`（l10n 採用 Flutter 官方 gen_l10n 方案）
- [x] 1.2 新建 l10n configuration file（`naver_blog_image_downloader/l10n.yaml`），設定 arb-dir、template-arb-file、output-class 等參數
- [x] 1.3 新建 ARB template file (Traditional Chinese) `lib/l10n/app_zh_TW.arb`，包含所有 UI 字串的 key 與繁體中文值
- [x] [P] 1.4 新建 English ARB file `lib/l10n/app_en.arb`，包含所有 key 的英文翻譯
- [x] [P] 1.5 新建 Korean ARB file `lib/l10n/app_ko.arb`，包含所有 key 的韓文翻譯
- [x] 1.6 執行 `flutter pub get` 並確認 `flutter gen-l10n` 產生 AppLocalizations 類別

## 2. Config 層

- [x] [P] 2.1 新建 `lib/config/supported_locale.dart`，實作 SupportedLocale enum definition（zhTW、en，含 locale 與 label 屬性）
- [x] [P] 2.2 新建 `lib/config/app_settings_keys.dart`，實作 AppSettingsKeys constants（themeMode、locale key）

## 3. Service + Repository 層（新建 SettingsRepository 而非擴充 CacheRepository）

- [x] 3.1 修改 `lib/main.dart`，在 Service 層註冊 LocalStorageService registered in DI（SharedPreferences 提前初始化）
- [x] 3.2 新建 `lib/data/repositories/settings_repository.dart`，實作 SettingsRepository constructor（接收 LocalStorageService）
- [x] 3.3 實作 load theme mode 方法，從 LocalStorageService 讀取並回傳 `Result<ThemeMode>`
- [x] 3.4 實作 save theme mode 方法，將 ThemeMode 持久化至 LocalStorageService
- [x] 3.5 實作 load locale 方法，從 LocalStorageService 讀取並回傳 `Result<SupportedLocale?>`
- [x] 3.6 實作 save locale 方法，將 SupportedLocale 持久化至 LocalStorageService
- [x] 3.7 修改 `lib/main.dart`，在 Repository 層註冊 SettingsRepository（repository providers registered 更新）

## 4. AppSettingsViewModel（新建 AppSettingsViewModel 獨立於現有 SettingsViewModel）

- [x] 4.1 新建 `lib/ui/core/view_model/app_settings_view_model.dart`，實作 AppSettingsViewModel constructor（接收 SettingsRepository）
- [x] 4.2 實作 AppSettingsViewModel state properties（themeMode、locale）
- [x] 4.3 實作 load settings 方法，從 SettingsRepository 載入持久化偏好
- [x] 4.4 實作 set theme mode 方法，更新狀態並持久化
- [x] 4.5 實作 set locale 方法，更新狀態並持久化
- [x] 4.6 修改 `lib/main.dart`，註冊 AppSettingsViewModel provider registered（作為第一個 ViewModel provider，並呼叫 loadSettings）

## 5. App 根元件整合

- [x] 5.1 修改 `lib/app.dart`，實作 NaverPhotoApp widget defined 更新：加入 `context.watch<AppSettingsViewModel>()`，設定 themeMode、locale、localizationsDelegates、supportedLocales（MaterialApp localization integration）
- [x] 5.2 確認 runtime theme mode switching 功能：ThemeMode.system/light/dark 正確切換
- [x] 5.3 確認 SharedPreferences eagerly initialized：main function defined 中 SharedPreferences 在 runApp 前完成初始化
- [x] 5.4 確認 service providers registered 與 provider registration order 正確（Service → Repository → ViewModel）

## 6. Settings View UI（外觀模式使用 SegmentedButton、語系使用 DropdownMenu）

- [x] 6.1 修改 `lib/ui/settings/widgets/settings_view.dart`，新增 appearance mode section（SegmentedButton<ThemeMode>）
- [x] 6.2 新增 language section（DropdownMenu<SupportedLocale>），語言名稱使用原生名稱不做 l10n
- [x] 6.3 更新 inset grouped list layout，調整區段順序為：外觀 → 語言 → 快取 → 關於
- [x] 6.4 實作 settings page watches AppSettingsViewModel，同時 watch AppSettingsViewModel 與 SettingsViewModel
- [x] 6.5 更新 version number display，改用 AppLocalizations 取得「關於」與「版本」文字

## 7. ViewModel 字串重構為 enum

- [x] [P] 7.1 在 `lib/ui/blog_input/view_model/blog_input_view_model.dart` 新增 FetchErrorType enum 定義（7 個值）
- [x] [P] 7.2 新增 FetchLoadingPhase enum 定義（3 個值）
- [x] 7.3 修改 FetchLoading state，將 statusMessage: String 改為 phase: FetchLoadingPhase
- [x] 7.4 修改 FetchError state，將 message: String 改為 errorType: FetchErrorType
- [x] 7.5 重構 fetch photos with loading state and status message，以 FetchLoadingPhase/FetchErrorType enum 取代硬編碼字串；移除 human-readable error messages 方法 `_humanReadableError()`
- [x] [P] 7.6 修改 `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`，實作 error type enum for gallery operations

## 8. View 本地化遷移

- [x] 8.1 修改 `lib/ui/settings/widgets/settings_view.dart`，全部硬編碼字串替換為 localized UI text（settings-view）
- [x] [P] 8.2 修改 `lib/ui/blog_input/widgets/blog_input_view.dart`，全部硬編碼字串替換為 localized UI text，實作 error message mapping from ViewModel enum 與 loading phase mapping from ViewModel enum
- [x] [P] 8.3 修改 `lib/ui/download/widgets/download_view.dart`，全部硬編碼字串替換為 localized UI text（download-view）
- [x] [P] 8.4 修改 `lib/ui/photo_gallery/widgets/photo_gallery_view.dart`，全部硬編碼字串替換為 localized UI text（photo-gallery-view）
- [x] [P] 8.5 修改 `lib/ui/photo_detail/widgets/photo_detail_view.dart`，全部硬編碼字串替換為 localized UI text（photo-detail-view）

## 9. 驗證

- [x] 9.1 執行 `flutter analyze` 確認無警告
- [x] 9.2 執行 `dart format .` 確保格式一致
- [x] 9.3 確認語系切換後全應用 UI 文字正確更新
- [x] 9.4 確認外觀模式切換即時生效並於重啟後保留
