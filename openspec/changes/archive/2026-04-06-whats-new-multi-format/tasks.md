## 1. 資料模型重構

- [x] 1.1 Sealed class 取代單一 WhatsNewFeature（重構 WhatsNewFeature data model）：修改 `lib/config/whats_new_registry.dart`，將 `WhatsNewFeature` 改為 sealed class `WhatsNewItem`（含 `titleKey`、`descriptionKey`），新增子類 `WhatsNewTextItem`（含 `IconData icon`）與 `WhatsNewImageItem`（含 `String base64Image`）
- [x] 1.2 實作 WhatsNewEntry 包裝 class（WhatsNewEntry wrapper class）：在 `lib/config/whats_new_registry.dart` 新增 `WhatsNewEntry` class（含 `List<WhatsNewItem> items`），判斷渲染格式的邏輯由 items 的 runtime type 決定
- [x] 1.3 更新 Onboarding steps registry：將 `onboardingSteps` 從 `List<WhatsNewFeature>` 改為 `onboardingEntry`（`WhatsNewEntry` 型別），4 個項目改為 `WhatsNewTextItem`
- [x] 1.4 更新 What's New version registry：將 `whatsNewRegistry` 從 `Map<String, List<WhatsNewFeature>>` 改為 `Map<String, WhatsNewEntry>`，`'1.4.0'` entry 使用 `WhatsNewTextItem`

## 2. WhatsNewDataSource abstraction 資料來源抽象

- [x] 2.1 實作 WhatsNewDataSource 抽象介面（WhatsNewDataSource abstraction）：在 `lib/config/whats_new_registry.dart` 新增 `abstract class WhatsNewDataSource`（含 `WhatsNewEntry? getOnboardingEntry()` 與 `WhatsNewEntry? getWhatsNewEntry(String version)` 兩個方法）
- [x] 2.2 實作 `WhatsNewDataSourceImpl`（`implements WhatsNewDataSource`），目前從 `onboardingEntry` 和 `whatsNewRegistry` 讀取內容，未來 API 在同一 class 擴充；新增 Riverpod provider（`@Riverpod(keepAlive: true)`）

## 3. ViewModel 適配

- [x] 3.1 修改 WhatsNewViewModel sealed state：`lib/ui/whats_new/view_model/whats_new_view_model.dart` 的 `build()` 改為透過 `WhatsNewDataSource` provider 取得內容；sealed state 中的 `List<WhatsNewFeature>` 改為 `WhatsNewEntry`；當 `getOnboardingEntry()` 或 `getWhatsNewEntry()` 回傳 `null` 時，靜默寫入版本號並回傳 `WhatsNewHidden`；所有情境皆以 fire-and-forget 方式透過 `LogRepository` 記錄 log
- [x] 3.2 執行 `dart run build_runner build --delete-conflicting-outputs` 產生 `.g.dart`

## 4. View 層 — Dialog 雙格式渲染

- [x] 4.1 修改 `lib/ui/whats_new/widgets/whats_new_dialog.dart` 支援純文字列表：將 `List<WhatsNewFeature>` 參數改為 `WhatsNewEntry`，純文字維持現有圓角 Dialog 列表渲染
- [x] 4.2 實作 PageView carousel dialog UI：在 `whats_new_dialog.dart` 新增圖文 PageView 渲染，每頁顯示圖片/Icon + 標題 + 描述，底部圓點指示器，所有頁面統一「關閉」按鈕
- [x] 4.3 修改 `lib/ui/whats_new/widgets/whats_new_view.dart`：`showWhatsNewDialog` 改為傳遞 `WhatsNewEntry`

## 5. L10n

- [x] 5.1 在 5 個 ARB 檔新增 `whatsNewCloseButton`（「關閉」）key

## 6. 驗證（第一階段）

- [x] 6.1 執行 `flutter analyze` 確認無靜態分析錯誤
- [x] 6.2 執行 `dart format .` 確保格式一致
- [x] 6.3 執行 `flutter test` 確認既有測試通過

## 7. Sealed class 欄位重構 — 直接文字取代 l10n key

- [x] 7.1 修改 WhatsNewFeature data model 欄位：`lib/config/whats_new_registry.dart` 中 `WhatsNewItem` 的 `titleKey`/`descriptionKey` → `title`/`description`（直接文字）；`WhatsNewTextItem` 的 `IconData icon` → `String icon`（Material Icon 名稱字串）
- [x] 7.2 更新本地 fallback registry：`onboardingEntry` 和 `whatsNewRegistry` 改為直接繁體中文文字 + `String icon` 名稱
- [x] 7.3 實作 Icon name resolution：在 `lib/config/whats_new_registry.dart` 新增 `resolveIcon(String name)` 函式，將已知 icon 名稱映射為 `IconData`，未知名稱 fallback 為 `Icons.info_outline`

## 8. Remove l10n key resolution — 移除 l10n key 查找機制（Icon 映射 helper）

- [x] 8.1 修改 `lib/ui/whats_new/widgets/whats_new_dialog.dart`：移除 `_resolveL10n` helper，改為直接使用 `item.title`/`item.description`；`WhatsNewTextItem` 的 icon 改為 `resolveIcon(item.icon)`
- [x] 8.2 修改 `lib/ui/whats_new/widgets/whats_new_view.dart`：移除 l10n 查找相關邏輯
- [x] 8.3 Remove l10n key resolution 清理：移除 5 個 ARB 檔中的 onboarding/whatsNew feature 文案 key（`onboardingStep1Title` ~ `onboardingStep4Desc`、`whatsNew140Feature1Title`/`Desc`），保留 UI 通用 key（`whatsNewTitle`、`whatsNewOnboardingTitle`、`whatsNewDismissButton`、`whatsNewCloseButton`）
- [x] 8.4 執行 `flutter gen-l10n` 重新產生 `AppLocalizations`

## 9. WhatsNewResponse DTO + API 串接設計

- [x] 9.1 新建 `lib/data/models/whats_new_response.dart`：實作 WhatsNewResponse DTO（含 `String version`、`List<WhatsNewItemDto> onboarding`、`List<WhatsNewItemDto> whatsNew`）與 `WhatsNewItemDto`（含 `type`、`icon?`、`base64Image?`、`title`、`description`），皆含 `fromJson` factory constructor
- [x] 9.2 修改 WhatsNewDataSource abstraction：介面方法改為 async `Future<WhatsNewEntry?> getOnboardingEntry({required String version, required String locale})` 與 `Future<WhatsNewEntry?> getWhatsNewEntry({required String version, required String locale})`
- [x] 9.3 修改 `WhatsNewDataSourceImpl`：注入 `ApiService`，呼叫 `POST /default/api/whatsNew` 帶 `{ "version": version, "locale": locale }`，成功時以 `version+locale` 為 cache key 快取 response 並轉換為 `WhatsNewEntry`，失敗時 fallback 至本地 registry；相同 version+locale 的第二次呼叫使用快取不重複請求
- [x] 9.4 修改 WhatsNewViewModel sealed state：`build()` 中的 DataSource 呼叫改為 await async 方法，傳入 `version` 與 `locale` 參數（`locale` 從 `AppSettingsViewModel` 取得使用者語系偏好，無偏好時使用裝置預設語系）

## 10. Code Generation + 驗證（第二階段）

- [x] 10.1 執行 `dart run build_runner build --delete-conflicting-outputs` 產生 `.g.dart`
- [x] 10.2 執行 `flutter analyze` 確認無靜態分析錯誤
- [x] 10.3 執行 `dart format .` 確保格式一致
- [x] 10.4 執行 `flutter test` 確認既有測試通過
