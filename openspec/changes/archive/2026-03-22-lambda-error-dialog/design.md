## Context

Lambda API 錯誤回傳時，原始 JSON（含 unicode 轉義字元）直接以紅色 Text 顯示在畫面上。`_humanReadableError()` 未處理 `AppError` 類型，導致 `error.toString()` 輸出技術細節。

## Goals / Non-Goals

**Goals:**

- `_humanReadableError()` 依 `AppErrorType` 回傳人性化中文錯誤訊息
- 錯誤訊息改為 AlertDialog 呈現
- 移除畫面上的紅色 Text 錯誤顯示

**Non-Goals:**

- 不修改 Repository 或 Service 層的錯誤傳遞邏輯
- 不修改 AppError 類別結構

## Decisions

### ViewModel 依 AppErrorType 回傳人性化訊息

在 `_humanReadableError()` 新增 `AppError` 判斷，依 `type` 分類回傳中文訊息：

- `serverError` → `'伺服器處理失敗，請稍後再試'`
- `networkError` → `'網路連線異常，請檢查網路設定'`
- 其他 → `'發生錯誤，請稍後再試'`

### 錯誤以 AlertDialog 呈現

改為在 `_onViewModelChanged` listener 中偵測 `errorMessage` 變化，彈出 AlertDialog 後清除 errorMessage。移除 build 中的紅色 Text widget。

- 與 `fetchResult` 的處理方式一致（listener 觸發）
- Dialog 比 inline Text 更醒目，使用者不會忽略

## Risks / Trade-offs

- [空字串 URL 提示] `blogUrl` 為空時的 `'請輸入 Blog 網址'` 錯誤也會變成 Dialog → 可接受，因為這也是需要使用者注意的訊息
