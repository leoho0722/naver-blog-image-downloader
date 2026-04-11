## Context

BlogInputView 是 App 首頁，使用者在此輸入 Naver Blog 網址。目前 TextField 僅使用 `onChanged` callback，無 `TextEditingController`，無法程式化設定文字內容。使用者只能手動貼上網址，無快捷操作。

## Goals / Non-Goals

**Goals:**

- 新增 TextEditingController 支援程式化文字操作
- 新增 suffixIcon 貼上按鈕，一鍵從剪貼板貼上
- 新增 URL 驗證邏輯，僅接受合法 Naver Blog HTTPS 網址
- 新增 WidgetsBindingObserver，App 回到前景時自動偵測剪貼板中的合法 URL
- 新增 URL 驗證 Unit Test

**Non-Goals:**

- 不修改 BlogInputViewModel（`onUrlChanged` 接口已足夠）
- 不修改 AppTheme 或全域主題配置
- 不新增其他頁面的剪貼板功能

## Decisions

### URL 驗證提取為獨立工具類

將 Naver Blog URL 驗證邏輯提取為獨立的工具類（`NaverUrlValidator`），而非內嵌在 View 中。

- 可被 View 與 Unit Test 共用
- 正則規則：`^https://(m\.)?blog\.naver\.com/`
- 僅接受 HTTPS（HTTP 視為不安全，不合法）
- 支援電腦版（`blog.naver.com`）與手機版（`m.blog.naver.com`）

### 貼上按鈕放在 TextField suffixIcon

選擇 `InputDecoration.suffixIcon` 而非外部獨立按鈕。

- Icon 置於輸入框內部右側，視覺上與輸入內容直接關聯
- 對齊 Material 3 TextField 設計慣例（如搜尋框的清除按鈕）
- 不佔用額外佈局空間

### 剪貼板偵測使用 WidgetsBindingObserver

在 `_BlogInputViewState` 中 mixin `WidgetsBindingObserver`，而非在 App 層級監聽。

- 僅在 BlogInputView 存在時監聽，不會在其他頁面觸發
- `initState` 中 `addObserver`，`dispose` 中 `removeObserver`，生命週期正確

### 偵測到 URL 後以 SnackBar 詢問

App 回到前景偵測到剪貼板中有合法 URL 時，顯示 SnackBar 附帶「貼上」action 按鈕，而非直接自動填入。

- 尊重使用者意圖，避免未經確認覆蓋輸入框內容
- SnackBar 輕量且不阻擋操作，比 Dialog 干擾更小

### 貼上不合法 URL 時顯示 AlertDialog

點擊貼上按鈕時，若剪貼板內容不是合法 Naver Blog URL，顯示溫和的 AlertDialog 提示。回到前景偵測到不合法 URL 時則靜默忽略。

- 貼上按鈕是主動操作，需要明確回饋
- 回到前景是被動觸發，靜默忽略避免干擾

## Risks / Trade-offs

- [iOS 16+ 剪貼板權限] iOS 16+ 存取剪貼板時系統會顯示權限確認 banner → 這是系統行為，無需額外處理，已符合「依各系統機制處理」的需求
- [SnackBar 被遮擋] 若有其他 SnackBar 正在顯示，新的會替換舊的 → Flutter SnackBar 預設行為即為替換，可接受
