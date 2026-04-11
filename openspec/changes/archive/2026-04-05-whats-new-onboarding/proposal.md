## Why

App 缺乏版本更新後的新功能引導，使用者可能不知道新版本帶來了什麼改變。同時，首次安裝的使用者沒有任何操作指引，需要自行摸索 App 使用方式。1.4.0 版新增「新功能介紹 + 首次安裝引導」功能，提升使用者體驗。

## What Changes

- 新增共用的全螢幕 Dialog 元件，用於顯示新功能介紹與首次安裝引導
- 首次安裝（`lastSeenVersion` 為 `null`）時顯示 4 步驟操作引導（貼上網址 → 取得照片 → 下載儲存 → 瀏覽照片）
- App 更新後首次開啟（`lastSeenVersion ≠ currentVersion`）時顯示該版本的新功能列表
- 使用者關閉 Dialog 後寫入當前版本至 `SharedPreferences`，同版本不再重複顯示
- 新增 `WhatsNewFeature` 資料模型與 `whatsNewRegistry`（版本→功能列表 Map），每次發版只需新增一筆 Map entry + ARB key
- 新增 `WhatsNewViewModel`（sealed state：Hidden / Onboarding / Update）管理顯示邏輯
- `BlogInputView.initState` 中以 `addPostFrameCallback` 觸發檢查，不阻塞 UI 渲染
- 5 個 ARB 檔新增通用 UI 字串 + 引導步驟 + 1.4.0 佔位新功能文案
- `pubspec.yaml` 版本升級至 `1.4.0+1`

## Capabilities

### New Capabilities

- `whats-new-onboarding`: 新功能介紹頁與首次安裝引導的完整功能，包含版本比較邏輯、共用 Dialog UI、Registry 內容定義、ViewModel 狀態管理

### Modified Capabilities

- `settings-repository`: 新增 `loadLastSeenVersion()` / `saveLastSeenVersion()` 方法
- `blog-input-view`: `initState` 新增 `addPostFrameCallback` 觸發新功能/引導檢查

## Impact

- 新建檔案：
  - `lib/config/whats_new_registry.dart`
  - `lib/ui/whats_new/view_model/whats_new_view_model.dart`
  - `lib/ui/whats_new/widgets/whats_new_dialog.dart`
  - `lib/ui/whats_new/widgets/whats_new_view.dart`
- 修改檔案：
  - `lib/config/app_settings_keys.dart`
  - `lib/data/repositories/settings_repository.dart`
  - `lib/ui/blog_input/widgets/blog_input_view.dart`
  - `lib/l10n/app_en.arb`、`app_ja.arb`、`app_ko.arb`、`app_zh.arb`、`app_zh_TW.arb`
  - `pubspec.yaml`
