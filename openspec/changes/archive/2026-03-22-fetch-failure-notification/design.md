## Context

Lambda API 回傳 `status=completed` 時，`failure_downloads` 可能 > 0，且 `errors` 陣列包含失敗原因。目前 `PhotoRepository.fetchPhotos` 僅取用 `image_urls`，完全忽略失敗資訊。使用者看到的照片數量會比部落格實際照片數少，但無任何提示。

## Goals / Non-Goals

**Goals:**

- 使用者在照片擷取完成後、進入下載流程前，能清楚知道有幾張照片擷取失敗
- 使用者可選擇繼續下載成功的照片，或取消操作

**Non-Goals:**

- 不處理失敗照片的重試機制
- 不改變 Lambda API 回傳格式

## Decisions

### FetchResult 新增 fetchErrors 欄位

在 `FetchResult` 新增 `List<String> fetchErrors` 欄位（預設空清單），攜帶 Lambda 回傳的錯誤訊息。使用 optional 預設值而非 required，避免影響既有建構式呼叫端。

**替代方案**：建立獨立的 `FetchWarning` 類別 → 不採用，目前只需要字串清單，無需額外抽象。

### 在 BlogInputView 顯示警告對話框

當 `fetchResult.fetchErrors.isNotEmpty` 時，在 `_handleFetchResult` 中以 `AlertDialog` 顯示警告，包含失敗數量與錯誤摘要。對話框提供「繼續下載」與「取消」兩個按鈕。選擇繼續則正常進入下載流程，選擇取消則回到輸入頁面。

**替代方案**：使用 SnackBar 顯示 → 不採用，SnackBar 會自動消失，使用者可能錯過重要資訊。

## Risks / Trade-offs

- [Risk] `errors` 訊息可能包含使用者難以理解的技術細節 → 對話框僅顯示失敗數量作為標題，錯誤細節以較小字體列在下方
