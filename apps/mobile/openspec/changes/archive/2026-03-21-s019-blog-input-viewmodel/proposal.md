## Why

使用者在 Blog 輸入頁面輸入 Naver Blog URL 後，需要觸發照片抓取流程。`BlogInputViewModel` 負責管理 URL 輸入驗證、呼叫 `PhotoRepository.fetchPhotos` 取得照片清單、以及管理 loading/error/result 三種 UI 狀態。此 ViewModel 是使用者操作流程的起點，串接 UI 層與 Repository 層。

## What Changes

- 新增 `lib/ui/blog_input/view_model/blog_input_view_model.dart`，實作 `BlogInputViewModel` 類別
- 新增 `test/ui/blog_input/blog_input_view_model_test.dart`，涵蓋所有公開方法的單元測試
- `BlogInputViewModel` 提供以下核心功能：
  - `onUrlChanged(String url)` — 更新 URL 輸入值
  - `fetchPhotos()` — 驗證 URL 非空後呼叫 `PhotoRepository.fetchPhotos`，管理 loading/error/result 狀態切換
  - `reset()` — 清除抓取結果，重置為初始狀態

## Capabilities

### New Capabilities

- `blog-input-viewmodel`: URL 輸入驗證、fetchPhotos 呼叫、loading/error/result 狀態管理

### Modified Capabilities

（無）

## Impact

- 新增檔案：`lib/ui/blog_input/view_model/blog_input_view_model.dart`、`test/ui/blog_input/blog_input_view_model_test.dart`
- 依賴：S002（Result）、S009（FetchResult）、S016（PhotoRepository.fetchPhotos）
- 此為 Blog 輸入頁面的核心 ViewModel，UI 層的 BlogInputScreen 將依賴於此
