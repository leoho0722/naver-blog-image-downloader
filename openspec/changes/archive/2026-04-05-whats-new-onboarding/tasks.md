## 1. Config 層

- [x] 1.1 修改 `lib/config/app_settings_keys.dart`：新增 `static const String lastSeenVersion = 'app_last_seen_version'`
- [x] 1.2 實作 WhatsNewFeature data model + Onboarding steps registry + What's New version registry：新建 `lib/config/whats_new_registry.dart`，定義 `WhatsNewFeature` class（`IconData icon`、`String titleKey`、`String descriptionKey`）、`onboardingSteps`（4 步驟：貼上網址 / 取得照片 / 下載儲存 / 照片瀏覽）、`whatsNewRegistry`（`'1.4.0'` 佔位 feature）

## 2. Repository 層

- [x] 2.1 實作 Load last seen version：修改 `lib/data/repositories/settings_repository.dart`，新增 `String? loadLastSeenVersion()` 方法，從 `LocalStorageService` 讀取 `AppSettingsKeys.lastSeenVersion`，`null` 代表首次安裝
- [x] 2.2 實作 Save last seen version：修改 `lib/data/repositories/settings_repository.dart`，新增 `Future<void> saveLastSeenVersion(String version)` 方法，將版本字串寫入 `LocalStorageService`

## 3. ViewModel 層

- [x] 3.1 實作 WhatsNewViewModel sealed state：新建 `lib/ui/whats_new/view_model/whats_new_view_model.dart`，定義 sealed class `WhatsNewState`（`WhatsNewHidden`、`WhatsNewOnboarding`（含 version + steps）、`WhatsNewUpdate`（含 version + features））
- [x] 3.2 實作 `WhatsNewViewModel`（`@riverpod`）的 `build()` 方法：`PackageInfo.fromPlatform()` 取版本 → `SettingsRepository.loadLastSeenVersion()` 比較 → null 回傳 `WhatsNewOnboarding`、同版本回傳 `WhatsNewHidden`、不同版本查 `whatsNewRegistry` 回傳 `WhatsNewUpdate`（registry 無該版本時靜默寫入版本並回傳 `WhatsNewHidden`）
- [x] 3.3 實作 WhatsNewViewModel dismiss method：呼叫 `SettingsRepository.saveLastSeenVersion(version)` → 更新 state 為 `WhatsNewHidden` → fire-and-forget `LogRepository.logPageNavigation`
- [x] 3.4 執行 `dart run build_runner build --delete-conflicting-outputs` 產生 `.g.dart`

## 4. View 層

- [x] 4.1 實作 What's New fullscreen dialog UI：新建 `lib/ui/whats_new/widgets/whats_new_dialog.dart`，建立共用全螢幕 Dialog 元件，接受 `title`（String）、`features`（`List<WhatsNewFeature>`）、`dismissLabel`（String）、`onDismiss`（VoidCallback）；使用 `Dialog.fullscreen`，頂部標題、中間 `ListView`（每項 `ListTile` 含 Icon + title + description）、底部 `FilledButton`
- [x] 4.2 新建 `lib/ui/whats_new/widgets/whats_new_view.dart`：實作 `showWhatsNewDialog()` 函式，根據 `WhatsNewOnboarding`（標題用 `whatsNewOnboardingTitle`）或 `WhatsNewUpdate`（標題用 `whatsNewTitle(version)`）傳入不同內容；包含 l10n key 解析 helper（switch 映射 titleKey/descriptionKey → `AppLocalizations` getter）

## 5. 觸發整合

- [x] 5.1 實作 BlogInputView triggers What's New check + What's New check on first frame：修改 `lib/ui/blog_input/widgets/blog_input_view.dart`，在 `_BlogInputViewState.initState()` 中新增 `WidgetsBinding.instance.addPostFrameCallback` 呼叫 `_checkWhatsNew()` 方法
- [x] 5.2 實作 `_checkWhatsNew()` 方法：`await ref.read(whatsNewViewModelProvider.future)` → 若為 `WhatsNewOnboarding` 或 `WhatsNewUpdate` 則 `await showWhatsNewDialog(context, state)` → `await ref.read(whatsNewViewModelProvider.notifier).dismiss()`

## 6. L10n

- [x] 6.1 實作 Localized What's New strings：修改 `lib/l10n/app_zh_TW.arb`，新增 `whatsNewTitle`（含 `{version}` placeholder）、`whatsNewOnboardingTitle`、`whatsNewDismissButton`、`onboardingStep1Title`/`Desc` ~ `onboardingStep4Title`/`Desc`、`whatsNew140Feature1Title`/`Desc`
- [x] 6.2 修改 `lib/l10n/app_en.arb`：新增對應英文翻譯
- [x] 6.3 修改 `lib/l10n/app_ja.arb`：新增對應日文翻譯
- [x] 6.4 修改 `lib/l10n/app_ko.arb`：新增對應韓文翻譯
- [x] 6.5 修改 `lib/l10n/app_zh.arb`：新增對應繁體中文翻譯
- [x] 6.6 執行 `flutter gen-l10n` 重新產生 `AppLocalizations`

## 7. 版本升級

- [x] 7.1 修改 `pubspec.yaml`：版本從 `1.3.0+1` 升級至 `1.4.0+1`

## 8. 驗證

- [x] 8.1 執行 `flutter analyze` 確認無靜態分析錯誤
- [x] 8.2 執行 `dart format .` 確保格式一致
- [x] 8.3 執行 `flutter test` 確認既有測試通過
