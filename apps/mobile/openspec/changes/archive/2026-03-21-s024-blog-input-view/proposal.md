## Why

使用者需要一個輸入 Naver Blog 網址的頁面，作為應用程式的首頁入口。此頁面提供 URL 輸入框、載入按鈕、錯誤訊息顯示等互動元件，並在成功取得照片列表後自動導航至下載頁。此為使用者操作流程的第一步，是整個下載流程的起點。

## What Changes

- 在 `lib/ui/blog_input/widgets/blog_input_view.dart` 中實作 `BlogInputView` Widget
- 提供 TextField 輸入 Naver Blog 網址
- 提供 FilledButton 觸發載入，載入中顯示 CircularProgressIndicator
- 顯示錯誤訊息（當 URL 無效或請求失敗時）
- 成功取得 fetchResult 後自動導航至下載頁面

## Capabilities

### New Capabilities

- `blog-input-view`: BlogInput 頁面 UI 元件，包含 URL 輸入、載入按鈕、錯誤訊息與導航邏輯

### Modified Capabilities

（無）

## Impact

- 涵蓋檔案：`lib/ui/blog_input/widgets/blog_input_view.dart`
- 依賴：S019（BlogInputViewModel）
- 此為應用程式的首頁 UI，所有下載流程由此開始
