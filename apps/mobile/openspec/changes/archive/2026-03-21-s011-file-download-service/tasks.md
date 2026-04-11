## 1. FileDownloadService class with injectable Dio（FileDownloadService 類別設計）

- [x] 1.1 在 `lib/data/services/file_download_service.dart` 中實作 FileDownloadService class with injectable Dio：定義 `FileDownloadService` 類別，建構子接受 `Dio` 參數
- [x] 1.2 將注入的 `Dio` 儲存為 `_dio` 私有 final 欄位

## 2. Streaming download to temp file（FileDownloadService 類別設計）

- [x] 2.1 實作 Streaming download to temp file：定義 `Future<String> downloadFile(String url, String savePath)` 方法
- [x] 2.2 使用 `_dio.download(url, savePath)` 進行串流下載，回傳 `savePath`

## 3. Retry up to 3 times with exponential backoff（指數退避重試策略）

- [x] 3.1 實作 Retry up to 3 times with exponential backoff：在 `downloadFile` 中加入重試邏輯，最多 3 次重試（共 4 次嘗試）
- [x] 3.2 重試間隔依指數退避遞增：1 秒、2 秒、4 秒
- [x] 3.3 僅在 `DioException` 時觸發重試，其他例外直接拋出
- [x] 3.4 所有重試耗盡後，拋出最後一次的 `DioException`

## 4. 30-second receive timeout（FileDownloadService 類別設計）

- [x] 4.1 實作 30-second receive timeout：在 download 請求中設定 `receiveTimeout` 為 `Duration(seconds: 30)`
