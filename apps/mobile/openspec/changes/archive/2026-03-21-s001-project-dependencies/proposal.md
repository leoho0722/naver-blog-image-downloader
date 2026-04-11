## Why

本專案為 Naver Blog 照片下載器 Flutter App，目前僅有預設 Flutter 範本。需要在 pubspec.yaml 中加入所有必要套件（狀態管理、導航、HTTP、下載、相簿存取、快取等），並建立完整的 lib/ 目錄骨架，以便後續各層級的 spec 可以獨立實作。

## What Changes

- 在 `pubspec.yaml` 加入所有 runtime 依賴：`provider`、`go_router`、`dio`、`http`、`image_gallery_saver`、`crypto`、`path_provider`、`path`、`shared_preferences`
- 在 `pubspec.yaml` 加入 dev 依賴：`mocktail`
- 建立完整的 `lib/` 目錄骨架，涵蓋 MVVM 分層架構所需的所有目錄：
  - `config/`（應用配置與主題）
  - `data/services/`（無狀態服務層）
  - `data/repositories/`（SSOT 儲存庫層）
  - `data/models/`、`data/models/dtos/`（領域模型與 DTO）
  - `ui/blog_input/view_model/`、`ui/blog_input/widgets/`
  - `ui/download/view_model/`、`ui/download/widgets/`
  - `ui/photo_gallery/view_model/`、`ui/photo_gallery/widgets/`
  - `ui/photo_detail/view_model/`、`ui/photo_detail/widgets/`
  - `ui/settings/view_model/`、`ui/settings/widgets/`
  - `ui/core/`（共用型別如 Result）
  - `routing/`（GoRouter 路由）
  - `utils/`（擴充方法與常數）

## Capabilities

### New Capabilities

- `project-dependencies`: 專案依賴套件配置與 lib/ 目錄骨架建立

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`naver_blog_image_downloader/pubspec.yaml`
- 建立目錄結構於 `naver_blog_image_downloader/lib/` 下
- 此為第零層基礎設施，所有後續 spec（S002-S030）均依賴於此
