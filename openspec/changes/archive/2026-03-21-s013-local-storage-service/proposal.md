## Why

應用程式需要在本機持久化儲存簡單的鍵值對資料（如使用者設定、快取 metadata 等）。透過封裝 `SharedPreferences` 至 `LocalStorageService` 類別，可將底層儲存機制抽象化，便於測試與未來替換儲存方案。

## What Changes

- 在 `lib/data/services/local_storage_service.dart` 中實作 `LocalStorageService` 類別，封裝 SharedPreferences 的鍵值儲存操作

## Capabilities

### New Capabilities

- `local-storage-service`: LocalStorageService 本機鍵值儲存服務，負責簡易的持久化資料存取

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/services/local_storage_service.dart`
- 依賴：S001（專案依賴，提供 shared_preferences 套件）
- 此為資料服務層，後續 Repository 層（S014、S015）與 ViewModel 層（S023）將依賴於此
