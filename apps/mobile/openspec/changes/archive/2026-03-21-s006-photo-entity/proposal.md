## Why

應用程式需要一個核心的 domain model 來表示從 Naver Blog 抓取的照片資訊。`PhotoEntity` 作為不可變的資料模型，在整個應用程式中統一表示一張照片的基本屬性（ID、URL、檔名、寬高），確保資料在各層之間傳遞時不會被意外修改。

## What Changes

- 在 `lib/data/models/photo_entity.dart` 中實作 `PhotoEntity` 不可變 domain model，包含 `id`、`url`、`filename`、`width?`、`height?` 屬性

## Capabilities

### New Capabilities

- `photo-entity`: PhotoEntity 不可變 domain model 的定義

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/models/photo_entity.dart`
- 依賴：S001（專案依賴與目錄骨架）
- 此為核心資料模型，後續 DTO 層（S007）、快取層（S008）、結果模型（S009）以及 Repository 層均依賴於此
