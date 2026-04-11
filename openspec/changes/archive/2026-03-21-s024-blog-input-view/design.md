## Context

BlogInput 頁面是應用程式的首頁，使用者在此輸入 Naver Blog 網址並觸發照片列表的取得。頁面透過 `context.watch<BlogInputViewModel>()` 監聽 ViewModel 狀態變化，實現響應式 UI 更新。

## Goals / Non-Goals

**Goals:**

- 實作 BlogInputView StatelessWidget，提供完整的 URL 輸入與提交互動
- 透過 Provider 監聽 BlogInputViewModel 狀態
- 正確處理載入中、錯誤、成功三種狀態的 UI 呈現
- fetchResult 取得成功後自動導航至下載頁

**Non-Goals:**

- 不實作 ViewModel 邏輯（由 S019 負責）
- 不實作路由定義（由路由層負責）
- 不處理深層連結或外部 URL 啟動

## Decisions

### URL 輸入框設計

使用 Material Design 的 `TextField` 元件，配置 `labelText` 為「Naver Blog 網址」、`hintText` 為 `https://blog.naver.com/...`，透過 `onChanged` 回呼將輸入值傳遞給 ViewModel。

### 載入按鈕與進度指示器

使用 `FilledButton` 作為主要操作按鈕。載入中時（`viewModel.isLoading == true`）：
- 按鈕設為 disabled（`onPressed: null`）
- 按鈕內容替換為 `CircularProgressIndicator(strokeWidth: 2)`

非載入狀態時顯示文字「取得照片列表」。

### 錯誤訊息顯示

當 `viewModel.errorMessage` 不為 null 時，在輸入框下方顯示紅色錯誤文字，使用 `Theme.of(context).colorScheme.error` 取得錯誤色彩。

### 導航至下載頁

當 `viewModel.fetchResult` 成功取得後，使用 GoRouter 導航至下載頁面，傳遞 fetchResult 資料。

## Risks / Trade-offs

- [取捨] 使用 StatelessWidget + context.watch 而非 StatefulWidget，簡化元件但依賴 Provider 重建機制
- [風險] CircularProgressIndicator 在 FilledButton 內的尺寸需要注意 strokeWidth 設定，避免按鈕高度跳動
