## Why

BlogInputView 是 App 首頁，使用者需手動輸入 Naver Blog 網址。目前 TextField 沒有 TextEditingController，無法程式化設定文字，也缺乏剪貼板整合功能。新增貼上按鈕與剪貼板自動偵測，可大幅減少手動輸入步驟，提升使用體驗。

## What Changes

- 新增 `TextEditingController` 支援程式化文字操作
- 新增 suffixIcon 貼上按鈕（`Icons.content_paste`），點擊時讀取剪貼板並驗證 URL
- 新增 Naver Blog URL 驗證邏輯（僅接受 `https://blog.naver.com/` 與 `https://m.blog.naver.com/`）
- 新增 `WidgetsBindingObserver` 偵測 App 回到前景時的剪貼板內容
- 偵測到合法 URL 時以 SnackBar 詢問使用者是否貼上
- 貼上按鈕讀取到不合法 URL 時以 AlertDialog 溫和提示
- 新增 URL 驗證的 Unit Test

## Capabilities

### New Capabilities

- `naver-url-validator`: Naver Blog URL 驗證邏輯（僅 HTTPS，支援電腦版與手機版網址格式）

### Modified Capabilities

- `blog-input-view`: 新增 TextEditingController、suffixIcon 貼上按鈕、WidgetsBindingObserver 剪貼板偵測

## Impact

- Affected specs: `naver-url-validator`（新增）、`blog-input-view`（修改）
- Affected code:
  - `lib/ui/blog_input/widgets/blog_input_view.dart`（主要變更）
  - 新增 URL 驗證工具類（路徑待定）
  - `test/` 新增 URL 驗證測試
