## 1. 套件設定與基礎建設

- [x] 1.1 修改 `pubspec.yaml`：移除 `provider: ^6.1.2`，新增 Runtime dependencies declared（`flutter_riverpod: ^3.3.1`、`riverpod_annotation: ^4.0.2`）與 Dev dependencies declared（`build_runner: ^2.13.1`、`riverpod_generator: ^4.0.3`、`riverpod_lint: ^3.1.3`、`custom_lint: ^0.8.1`），版號升級至 `1.1.0+1`，執行 `flutter pub get`
- [x] 1.2 修改 `analysis_options.yaml`：新增 `custom_lint` plugin 以啟用 `riverpod_lint`（使用 Code Generation @riverpod 註解而非手動 Provider 定義）

## 2. Repository 層重構（移除 Result sealed class defined，移除 Result\<T\> 並讓 Repository 直接 throw）

- [x] 2.1 修改 `lib/data/repositories/settings_repository.dart`：Load theme mode 回傳型別從 `Result<ThemeMode>` 改為 `ThemeMode`，Save theme mode 從 `Future<Result<void>>` 改為 `Future<void>`，Load locale 從 `Result<SupportedLocale?>` 改為 `SupportedLocale?`，Save locale 從 `Future<Result<void>>` 改為 `Future<void>`，移除 `import result.dart`
- [x] 2.2 修改 `lib/data/repositories/photo_repository.dart`：PhotoRepository fetchPhotos return type 從 `Future<Result<FetchResult>>` 改為 `Future<FetchResult>`（失敗時 throw），saveOneToGallery return type 從 `Future<Result<void>>` 改為 `Future<void>`，saveToGalleryFromCache return type 從 `Future<Result<void>>` 改為 `Future<void>`，移除 `import result.dart`
- [x] 2.3 刪除 `lib/ui/core/result.dart`（完整移除 Result sealed class defined）
- [x] 2.4 修改 `test/data/repositories/photo_repository_test.dart`：將 `Result.ok` / `Result.error` 斷言改為直接值斷言與 `throwsA` 斷言

## 3. Service 層 Provider 定義（Service providers with keepAlive，Provider 生命週期管理）

- [x] 3.1 修改 `lib/data/services/api_service.dart`：加入 `part 'api_service.g.dart'` 與 `@Riverpod(keepAlive: true) ApiService apiService(Ref ref)` provider function（Service providers with keepAlive）
- [x] 3.2 修改 `lib/data/services/file_download_service.dart`：加入 `part` directive 與 `@Riverpod(keepAlive: true)` provider function
- [x] 3.3 修改 `lib/data/services/gallery_service.dart`：加入 `part` directive 與 `@Riverpod(keepAlive: true)` provider function
- [x] 3.4 修改 `lib/data/services/local_storage_service.dart`：加入 `part` directive、`sharedPreferences` provider（throw UnimplementedError，SharedPreferences 初始化策略）與 `localStorageService` provider（使用 `ref.watch(sharedPreferencesProvider)`）

## 4. Repository 層 Provider 定義（Repository providers with keepAlive）

- [x] 4.1 修改 `lib/data/repositories/cache_repository.dart`：加入 `part` directive 與 `@Riverpod(keepAlive: true)` provider function（Repository providers with keepAlive）
- [x] 4.2 修改 `lib/data/repositories/settings_repository.dart`：加入 `part` directive 與 `@Riverpod(keepAlive: true)` provider function（使用 `ref.watch(localStorageServiceProvider)`）
- [x] 4.3 修改 `lib/data/repositories/photo_repository.dart`：加入 `part` directive 與 `@Riverpod(keepAlive: true)` provider function（PhotoRepository receives all dependencies 透過 `ref.watch`）
- [x] 4.4 執行 `dart run build_runner build --delete-conflicting-outputs` 產生所有 Service / Repository 的 `.g.dart` 檔案

## 5. 入口點遷移（ProviderScope at app root，移除 Service providers registered / Repository providers registered / ViewModel providers registered / main function defined）

- [x] 5.1 修改 `lib/main.dart`：移除 `MultiProvider`（原 Service providers registered、Repository providers registered、ViewModel providers registered、AppSettingsViewModel provider registered 皆移除），改用 `ProviderScope`（含 SharedPreferences eagerly initialized 的 `overrideWithValue(prefs)` override），實作 Provider registration order
- [x] 5.2 修改 `lib/app.dart`：NaverPhotoApp widget defined 從 `StatelessWidget` 改為 NaverPhotoApp as ConsumerWidget，使用 `ref.watch(appSettingsViewModelProvider)` 搭配 `AsyncValue.when()` 處理 loading/error/data

## 6. ViewModel 遷移 — AppSettingsViewModel（AsyncNotifier vs Notifier 的選擇標準：AsyncNotifier）

- [x] 6.1 修改 `lib/ui/core/view_model/app_settings_view_model.dart`：建立 `AppSettingsState` immutable class（含 `copyWith`，AsyncValue 欄位嵌入 State Class），AppSettingsViewModel constructor 從 `ChangeNotifier` 改為 `@Riverpod(keepAlive: true)` AsyncNotifier（AppSettingsViewModel as AsyncNotifier），實作 Load settings 作為 `build()` 方法（移除獨立 `loadSettings()`），實作 Set theme mode 與 Set locale 的樂觀更新模式，AppSettingsViewModel state properties 改為 `AsyncValue<AppSettingsState>`

## 7. ViewModel 遷移 — SettingsViewModel（AsyncNotifier vs Notifier 的選擇標準：AsyncNotifier）

- [x] 7.1 修改 `lib/ui/settings/view_model/settings_view_model.dart`：移除 `SettingsState` enum，建立 `SettingsData` immutable class（含 Formatted cache size getter），Settings state properties 從 `ChangeNotifier` 改為 `@riverpod` AsyncNotifier，Load cache info 實作為 `build()` 方法（移除獨立 `loadCacheInfo()`），Clear all cache 使用 `AsyncLoading` → `AsyncData` 轉換
- [x] 7.2 修改 `lib/ui/settings/widgets/settings_view.dart`：從 `StatefulWidget` 改為 `ConsumerStatefulWidget`，移除 `_loaded` flag 與 `didChangeDependencies` 手動載入，使用 `ref.watch(settingsViewModelProvider)` 搭配 `AsyncValue.when()`，使用 `ref.watch(appSettingsViewModelProvider)` 取得 AppSettings（取代原 Settings page watches AppSettingsViewModel 的 `context.watch`），呼叫 `ref.read(settingsViewModelProvider.notifier).clearAllCache()` 取代直接呼叫

## 8. ViewModel 遷移 — DownloadViewModel（DownloadViewModel as Notifier，移除 Download state properties）

- [x] 8.1 修改 `lib/ui/download/view_model/download_view_model.dart`：移除 `DownloadState` enum（移除 Download state properties），建立 DownloadViewModelState immutable class（含 `copyWith`、Progress calculation getter），從 `ChangeNotifier` 改為 `@riverpod` Notifier（DownloadViewModel as Notifier），Start download with progress tracking 使用 `AsyncValue<DownloadBatchResult?>` 管理下載狀態與 Duplicate download prevention
- [x] 8.2 修改 `lib/ui/download/widgets/download_view.dart`：從 `StatefulWidget` 改為 `ConsumerStatefulWidget`，`context.read<DownloadViewModel>()` → `ref.read(downloadViewModelProvider.notifier)`，`context.watch<DownloadViewModel>()` → `ref.watch(downloadViewModelProvider)`

## 9. ViewModel 遷移 — BlogInputViewModel（BlogInputViewModel as Notifier，FetchException 包裝 FetchErrorType）

- [x] 9.1 修改 `lib/ui/blog_input/view_model/blog_input_view_model.dart`：移除 `FetchState` sealed class（移除 URL input state management 與 Fetch photos with loading state and status message 的舊實作），移除 Human-readable error messages 方法，新增 FetchException class（FetchException 包裝 FetchErrorType + statusCode），建立 BlogInputState immutable class（含 `AsyncValue<FetchResult?>` fetchResult、`FetchLoadingPhase?`、`copyWith`，AsyncValue 欄位嵌入 State Class），從 `ChangeNotifier` 改為 `@riverpod` Notifier（BlogInputViewModel as Notifier），保留 FetchErrorType enum 與 FetchLoadingPhase enum，Empty URL validation 使用 `AsyncError(FetchException(...))`，實作 Exception mapping to FetchException（`_mapException`），實作 Loading phase updates during polling，Reset state 重設 fetchResult 為 `AsyncData(null)`
- [x] 9.2 修改 `lib/ui/blog_input/widgets/blog_input_view.dart`：從 `StatefulWidget` 改為 `ConsumerStatefulWidget`，移除 `_viewModel.addListener/_removeListener`，使用 `ref.listen(blogInputViewModelProvider, ...)` 在 `build()` 中取代 `addListener`（處理 FetchException 錯誤對話框與 FetchSuccess 導航），`context.watch/read` → `ref.watch/read`

## 10. ViewModel 遷移 — PhotoGalleryViewModel（PhotoGalleryViewModel as Notifier，移除 Gallery state properties / Toggle selection mode）

- [x] 10.1 修改 `lib/ui/photo_gallery/view_model/photo_gallery_view_model.dart`：移除 `GalleryMode` enum 與 `GallerySaveErrorType` enum（移除 Gallery state properties 與 Toggle selection mode 的舊實作），建立 PhotoGalleryState immutable class（含 `isSelectMode: bool`、`saveOperation: AsyncValue<void>?`、`copyWith`），從 `ChangeNotifier` 改為 `@riverpod` Notifier（PhotoGalleryViewModel as Notifier），Load photo list 使用 `state.copyWith()`，Toggle select mode 使用 `isSelectMode` bool，Select or deselect photo 建立新 `Set` 實例，Save selected photos to gallery 使用 `AsyncValue<void>?` saveOperation
- [x] 10.2 修改 `lib/ui/photo_gallery/widgets/photo_gallery_view.dart`：從 `StatefulWidget` 改為 `ConsumerStatefulWidget`，移除 `_viewModel.addListener/_removeListener`，使用 `ref.listen` 監聽 `isSaving` 開關儲存中對話框，`context.watch/read` → `ref.watch/read`

## 11. ViewModel 遷移 — PhotoDetailViewModel（PhotoDetailViewModel as Notifier，移除 Detail state properties / SaveState enum）

- [x] 11.1 修改 `lib/ui/photo_detail/view_model/photo_detail_view_model.dart`：移除 `SaveState` enum（移除 Detail state properties 與 SaveState enum），建立 PhotoDetailState immutable class（含 `saveOperation: AsyncValue<void>?`、`copyWith`、`formattedFileSize`、`formattedDimensions` getter），從 `ChangeNotifier` 改為 `@riverpod` Notifier（PhotoDetailViewModel as Notifier），Metadata caching 保留為 Notifier private 欄位，Load photo detail 使用 `state.copyWith()`，Set current index 重設 saveOperation 為 null 並 lazy-load 元資料，Save to gallery 使用 `AsyncValue<void>?` 管理狀態（含 Save prevented when already saving）
- [x] 11.2 修改 `lib/ui/photo_detail/widgets/photo_detail_capsule_bar.dart`：`SaveState saveState` 參數改為 `AsyncValue<void>? saveOperation`，`_buildSaveIcon` 使用 `switch (saveOperation)` pattern matching
- [x] 11.3 修改 `lib/ui/photo_detail/widgets/photo_detail_view.dart`：從 `StatefulWidget` 改為 `ConsumerStatefulWidget`，`context.watch/read` → `ref.watch/read`

## 12. Code Generation 與驗證

- [x] 12.1 執行 `dart run build_runner build --delete-conflicting-outputs` 產生所有 ViewModel providers with code generation 的 `.g.dart` 檔案
- [x] 12.2 執行 `flutter analyze` 確認無 error/warning，接續執行 `dart format .` 格式化

## 13. 測試遷移

- [x] 13.1 修改 `test/ui/blog_input/blog_input_view_model_test.dart`：改用 `ProviderContainer` + `photoRepositoryProvider.overrideWithValue()` 模式，斷言 `BlogInputState.fetchResult` 的 `AsyncValue` 狀態（Feature ViewModels auto-dispose）
- [x] 13.2 修改 `test/ui/download/download_view_model_test.dart`：改用 `ProviderContainer` + override 模式，斷言 `DownloadViewModelState.downloadResult` 的 `AsyncValue` 狀態
- [x] 13.3 修改 `test/ui/photo_detail/photo_detail_view_model_test.dart`：改用 `ProviderContainer` + override 模式，斷言 `PhotoDetailState.saveOperation` 的 `AsyncValue` 狀態
- [x] 13.4 修改 `test/ui/photo_gallery/photo_gallery_view_model_test.dart`：改用 `ProviderContainer` + override 模式，斷言 `PhotoGalleryState.saveOperation` 與 `isSelectMode` 狀態
- [x] 13.5 修改 `test/widget_test.dart`：`MultiProvider` 改為 `ProviderScope(overrides: [sharedPreferencesProvider.overrideWithValue(prefs)])`
- [x] 13.6 執行 `flutter test` 確認所有測試通過

## 14. 清理與文件更新

- [x] 14.1 確認無殘留 `import 'package:provider/provider.dart'`、`context.watch`、`context.read`、`Result<T>` 使用
- [x] 14.2 更新 `CLAUDE.md`：架構描述從 Provider 改為 Riverpod 3.x（使用 code generation + @riverpod 註解），View 層改為 ConsumerWidget / ConsumerStatefulWidget + ref.watch，ViewModel 層改為 Notifier / AsyncNotifier
- [x] 14.3 更新 `.gitignore`：加入 `*.g.dart` 或確認 code gen 檔案的版控策略（AppSettingsViewModel is keepAlive，Feature ViewModels auto-dispose）
