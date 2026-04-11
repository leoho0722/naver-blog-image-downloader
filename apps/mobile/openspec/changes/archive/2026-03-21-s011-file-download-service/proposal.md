## Why

應用程式需要從遠端 URL 下載照片檔案至本機暫存目錄。下載過程可能因網路不穩定而失敗，因此需要實作重試機制與超時控制。使用 Dio 的串流下載功能，搭配指數退避重試策略（最多 3 次，間隔 1s→2s→4s）與 30 秒接收超時，確保下載的穩定性與效率。

## What Changes

- 在 `lib/data/services/file_download_service.dart` 中實作 `FileDownloadService` 類別，封裝 Dio 串流下載邏輯

## Capabilities

### New Capabilities

- `file-download-service`: FileDownloadService Dio 串流下載服務，支援重試與超時機制

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/data/services/file_download_service.dart`
- 依賴：S001（專案依賴，提供 Dio 套件）
- 此為資料服務層，後續 Repository 層（S017）將依賴於此
