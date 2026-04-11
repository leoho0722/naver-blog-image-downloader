## Context

What's New 功能已完成雙格式 Dialog（純文字列表 + 圖文 PageView）與 `WhatsNewDataSource` 抽象介面。後端 API 格式已定案，需要將 `WhatsNewDataSourceImpl` 從純本地讀取改為 API 串接 + 本地 fallback，同時將 model 欄位從 l10n key 改為直接文字。

## Goals / Non-Goals

**Goals:**

- `WhatsNewItem` 欄位從 `titleKey` / `descriptionKey` 改為 `title` / `description`（直接文字）
- `WhatsNewTextItem` 的 `IconData icon` 改為 `String icon`（Material Icon 名稱字串）
- `WhatsNewDataSourceImpl` 整合後端 API，fallback 至本地 registry
- 移除 l10n key 查找機制（`_resolveL10n`），改用直接文字渲染
- 新增 API Response DTO 對應後端 JSON 結構

**Non-Goals:**

- 不實作後端 API 本身
- 不提供 base64 圖片素材

## Decisions

### Sealed class 欄位重構 — 直接文字取代 l10n key

`WhatsNewItem` 的 `titleKey` / `descriptionKey` → `title` / `description`，儲存已翻譯的顯示文字。`WhatsNewTextItem` 的 `IconData icon` → `String icon`（Material Icon 名稱字串，如 `"auto_awesome"`）。

API 回傳的文字已由後端根據 `Accept-Language` 翻譯，本地 fallback 直接寫入預設語系（繁體中文）文字。

### API 串接設計

後端 API 規格：
- Endpoint: `/default/api/whatsNew`
- Request: `POST { "version": "1.4.0", "locale": "zh-TW" }`
- Response: `{ "version": "1.4.0", "onboarding": [...], "whatsNew": [...] }`

`locale` 從 `AppSettingsViewModel` 取得使用者目前的語系設定，傳給後端以回傳對應語系的 `title` / `description`。本地 fallback 仍為繁體中文（預設語系）。

`WhatsNewDataSourceImpl` 改為 async，透過 `ApiService` 呼叫 API。一次請求同時取得 onboarding 與 whatsNew 內容，快取於實例中供兩個 getter 使用。API 失敗時 fallback 至本地 registry。

介面方法簽名改為：
```dart
abstract class WhatsNewDataSource {
  Future<WhatsNewEntry?> getOnboardingEntry({required String version, required String locale});
  Future<WhatsNewEntry?> getWhatsNewEntry({required String version, required String locale});
}
```

兩個方法都需要 `version` 和 `locale` 參數，因為 API 請求需帶入。`WhatsNewDataSourceImpl` 內部以 `version+locale` 作為 cache key，第二次呼叫不重複請求。

### WhatsNewResponse DTO

新增 `lib/data/models/dtos/whats_new_response.dart`，對應後端 JSON：

```dart
class WhatsNewResponse {
  final String version;
  final List<WhatsNewItemDto> onboarding;
  final List<WhatsNewItemDto> whatsNew;
}

class WhatsNewItemDto {
  final String type;       // "text" | "image"
  final String? icon;      // Material Icon 名稱（type=text 時）
  final String? base64Image; // base64 圖片（type=image 時）
  final String title;
  final String description;
}
```

DTO 負責 JSON 反序列化，再由 `WhatsNewDataSourceImpl` 轉換為 `WhatsNewEntry`。

### Icon 映射 helper

新增 `lib/config/whats_new_icon_resolver.dart`，提供 `resolveIcon(String name)` 函式，將 Material Icon 名稱字串映射為 `IconData`。支援有限的已知 icon 名稱集合，未知名稱 fallback 為 `Icons.info_outline`。

### Dialog 雙格式渲染

維持現有設計不變，只需：
- 移除 `_resolveL10n` helper，直接使用 `item.title` / `item.description`
- `WhatsNewTextItem` 的 icon 改為透過 `resolveIcon(item.icon)` 取得 `IconData`

### 本地 fallback registry

`onboardingEntry` 和 `whatsNewRegistry` 改為使用直接繁體中文文字（非 l10n key），作為 API 不可用時的 fallback。`WhatsNewTextItem` 的 icon 改為 `String`。

### ViewModel 適配

`WhatsNewDataSource` 方法改為 async（`Future<WhatsNewEntry?>`），ViewModel 的 `build()` 已經是 async，直接 await 即可。`getOnboardingEntry` 和 `getWhatsNewEntry` 都需傳入 `version` 和 `locale` 參數。`locale` 統一透過 `SupportedLocale` 正規化：優先使用 App 設定，無偏好時呼叫 `SupportedLocale.fromDeviceLocale()` 從裝置語系解析最近的支援語系，確保發送給後端的值一定在支援範圍內。

### 檔案拆分

原 `whats_new_registry.dart`（287 行、5 個職責）拆分為 4 個檔案：
- `lib/data/models/whats_new_item.dart` — Model（sealed class + WhatsNewEntry）
- `lib/config/whats_new_icon_resolver.dart` — Icon 名稱映射
- `lib/config/whats_new_registry.dart` — 本地 fallback 常數
- `lib/data/services/whats_new_data_source.dart` — DataSource 介面 + 實作 + provider

### ApiEndpoint enum

新增 `ApiEndpoint` enum 管理所有 API endpoint 路徑，`_post` 的 `path` 參數改為 `required`，呼叫端必須明確指定 endpoint。

## Risks / Trade-offs

- **API 延遲**：首次 API 呼叫可能增加 Dialog 顯示延遲，但 ViewModel build 本身已是 async，增加的延遲可接受
- **Fallback 語系限制**：本地 fallback 固定為繁體中文，非繁體中文使用者在離線時會看到中文內容
- **Icon 映射維護**：`resolveIcon` 需手動維護已知名稱集合，但 icon 種類有限（目前 5 個），維護成本極低
- **Locale 正規化**：`SupportedLocale.fromDeviceLocale()` 以語言碼匹配，未匹配時 fallback 為繁體中文
