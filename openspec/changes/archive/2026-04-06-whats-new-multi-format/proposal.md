## Summary

擴展 What's New / Onboarding 功能，支援兩種內容格式（純文字列表 + 圖文 PageView 輪播），並整合後端 API（`/default/api/whatsNew`）作為主要資料來源、本地 registry 作為 fallback。

## Motivation

目前 What's New 功能只有一種純文字格式（Icon + 標題 + 描述），無法展示圖文引導。首次安裝引導適合用圖文輪播（每頁一張圖 + 說明），而版本更新的新功能列表適合用純文字。兩種格式需共存於同一套架構中。後端 API 已定案，一次請求即可回傳 onboarding 與 whatsNew 兩組內容，前端需整合 API 並以本地 registry 作為網路失敗時的 fallback。

## Proposed Solution

- `WhatsNewItem` sealed class 的 `titleKey` / `descriptionKey` 改為 `title` / `description`（直接顯示文字，不再走 l10n key 查找）
- `WhatsNewTextItem` 的 `IconData icon` 改為 `String icon`（Material Icon 名稱字串），View 層負責 `String → IconData` 映射
- 移除 `_resolveL10n` helper 與 ARB 中的 onboarding/whatsNew feature 文案 key（保留 UI 通用 key）
- 新增 API Response DTO（`WhatsNewResponse`），對應後端 JSON 結構
- `WhatsNewDataSourceImpl` 整合 API 呼叫（透過 `ApiService`），成功時從 API 回傳內容，失敗時 fallback 至本地 `onboardingEntry` / `whatsNewRegistry`
- 本地 registry 改為使用直接文字（取預設語系繁體中文）作為 fallback 內容
- 新增 icon 映射 helper（`String → IconData`），支援 API 回傳的 icon 名稱

## Non-Goals

- 不實作後端 API（僅前端串接）
- 不新增圖片素材（base64 圖片由後端提供）

## Impact

- 修改 spec: `whats-new-onboarding`
- 修改檔案:
  - `lib/config/whats_new_registry.dart`（精簡為僅含本地 fallback 常數）
  - `lib/config/supported_locale.dart`（新增 `fromDeviceLocale()` static method）
  - `lib/data/services/api_service.dart`（新增 `fetchWhatsNew` + `ApiEndpoint` enum + `path` required）
  - `lib/ui/whats_new/widgets/whats_new_dialog.dart`（移除 l10n 查找、改用直接文字 + icon 字串映射）
  - `lib/ui/whats_new/view_model/whats_new_view_model.dart`（DataSource async + locale 正規化）
  - `lib/ui/whats_new/widgets/whats_new_view.dart`（移除 l10n 查找）
  - `lib/l10n/app_*.arb`（移除 onboarding/whatsNew feature 文案 key）
  - `pubspec.yaml`（版本升級至 1.4.2+1）
- 新增檔案:
  - `lib/data/models/whats_new_item.dart`（WhatsNewItem sealed class + WhatsNewEntry）
  - `lib/data/models/dtos/whats_new_response.dart`（API Response DTO）
  - `lib/data/models/dtos/whats_new_request.dart`（API Request DTO）
  - `lib/data/services/whats_new_data_source.dart`（DataSource 介面 + 實作 + provider）
  - `lib/config/whats_new_icon_resolver.dart`（resolveIcon 映射）
