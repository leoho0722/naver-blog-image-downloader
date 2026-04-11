## Context

Blog 輸入頁面是使用者操作的第一個畫面，使用者輸入 Naver Blog 文章 URL 後按下按鈕觸發照片抓取。`BlogInputViewModel` 繼承 `ChangeNotifier`，透過 `PhotoRepository.fetchPhotos` 觸發 async job pattern 流程，並以 `Result` 型別處理成功與失敗情境。由於 API 採用非同步任務模式，ViewModel 新增 `statusMessage` 屬性，在輪詢過程中向使用者回報目前狀態。

## Goals / Non-Goals

**Goals:**

- 實作 URL 輸入值管理與空值驗證
- 透過 `PhotoRepository` 呼叫 fetchPhotos 並以 `Result` 處理回傳值
- 管理 `isLoading`、`errorMessage`、`fetchResult`、`statusMessage` 四種 UI 狀態
- 透過 `onStatusChanged` callback 接收 Repository 層的狀態回報，更新 `statusMessage`
- 提供 `reset()` 方法清除抓取結果

**Non-Goals:**

- 不實作 URL 格式驗證（如正則表達式匹配 Naver Blog URL 格式）
- 不處理網路重試邏輯
- 不實作 UI Widget

## Decisions

### ChangeNotifier 狀態管理

`BlogInputViewModel` 繼承 `ChangeNotifier`，每次狀態變更後呼叫 `notifyListeners()`。UI 層透過 `Provider` 監聽狀態變化並重建。

### statusMessage 狀態訊息

新增 `statusMessage` 屬性（String?），在 async job pattern 的不同階段向使用者回報目前狀態：
- 提交任務後：`"正在提交任務..."`
- 輪詢處理中：`"伺服器處理中..."`
- 處理完成：`"處理完成"`

`fetchPhotos()` 呼叫 `PhotoRepository.fetchPhotos` 時傳入 `onStatusChanged` callback，在 callback 中更新 `_statusMessage` 並呼叫 `notifyListeners()`。

### 空 URL 驗證策略

`fetchPhotos()` 在執行前檢查 `_blogUrl` 是否為空字串。若為空，直接設定 `_errorMessage` 並回傳，不發起網路請求。

### Result 分支處理

`fetchPhotos()` 呼叫 `PhotoRepository.fetchPhotos` 後，對回傳的 `Result<FetchResult>` 進行 switch 匹配：
- `Ok` → 將 `FetchResult` 存入 `_fetchResult`
- `Error` → 將錯誤訊息存入 `_errorMessage`

完成後清除 `_statusMessage`。

## Risks / Trade-offs

- [取捨] 僅做空值檢查而不做 URL 格式驗證 → 簡化實作，不合法 URL 的錯誤由 Repository/Service 層回傳
- [風險] 連續快速點擊可能觸發多次 fetchPhotos → 透過 `_isLoading` 旗標防止重複請求
- [取捨] statusMessage 使用固定的正體中文字串 → 目前不需國際化，後續可透過 l10n 機制替換
