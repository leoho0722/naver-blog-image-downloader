## 1. Download state properties（進度追蹤回呼機制）

- [x] 1.1 建立 `lib/ui/download/view_model/download_view_model.dart`，實作 `DownloadViewModel extends ChangeNotifier`，包含建構子接收 `PhotoRepository`，以及 download state properties 的所有屬性（completed、total、isDownloading、result）

## 2. Progress calculation（Progress 計算邏輯）

- [x] 2.1 實作 `progress` getter，完成 progress calculation 邏輯：當 `_total > 0` 時回傳 `_completed / _total`，否則回傳 `0.0`

## 3. Start download with progress tracking（下載結果狀態管理）

- [x] 3.1 實作 `startDownload({required List<PhotoEntity> photos, required String blogId})` 方法，包含 start download with progress tracking 的完整流程：設定 isDownloading、設定 total、呼叫 `PhotoRepository.downloadAllToCache` 並傳入 onProgress 回呼更新 completed、儲存 DownloadBatchResult、以及 duplicate download prevention

## 4. 單元測試

- [x] 4.1 建立 `test/ui/download/download_view_model_test.dart`，撰寫測試涵蓋 download state properties 初始狀態、progress calculation（含除以零情境）、start download with progress tracking（成功/重複防護）所有情境
