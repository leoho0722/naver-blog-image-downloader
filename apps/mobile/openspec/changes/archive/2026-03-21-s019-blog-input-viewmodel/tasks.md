## 1. URL input state management（ChangeNotifier 狀態管理）

- [x] 1.1 建立 `lib/ui/blog_input/view_model/blog_input_view_model.dart`，實作 `BlogInputViewModel extends ChangeNotifier`，包含建構子接收 `PhotoRepository`，以及所有屬性（blogUrl、isLoading、errorMessage、fetchResult、statusMessage）
- [x] 1.2 實作 `onUrlChanged(String url)` 方法，更新 `_blogUrl` 並呼叫 `notifyListeners()`

## 2. Empty URL validation（空 URL 驗證策略）

- [x] 2.1 在 `fetchPhotos()` 中實作 empty URL validation，當 `_blogUrl` 為空時設定 `_errorMessage` 並直接回傳

## 3. Fetch photos with loading state and status message（Result 分支處理與狀態訊息）

- [x] 3.1 實作 `fetchPhotos()` 的 loading 狀態管理、`onStatusChanged` callback 傳入、與 `PhotoRepository.fetchPhotos` 呼叫
- [x] 3.2 在 `onStatusChanged` callback 中更新 `_statusMessage` 並呼叫 `notifyListeners()`
- [x] 3.3 實作 Result Ok/Error 分支處理與 duplicate fetch prevention
- [x] 3.4 完成後清除 `_statusMessage` 為 `null`

## 4. Reset state（ChangeNotifier 狀態管理）

- [x] 4.1 實作 `reset()` 方法，清除 `_fetchResult`、`_errorMessage`、`_statusMessage`，呼叫 `notifyListeners()`，完成 reset state 功能

## 5. 單元測試

- [x] 5.1 建立 `test/ui/blog_input/blog_input_view_model_test.dart`，撰寫測試涵蓋 URL input state management（含 statusMessage 初始狀態）、empty URL validation、fetch photos with loading state and status message（成功/失敗/狀態回報/重複防護）、reset state 所有情境
