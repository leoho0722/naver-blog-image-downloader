## Context

Download 頁面在使用者觸發照片下載後顯示，透過 `context.watch<DownloadViewModel>()` 監聽下載進度與狀態變化。頁面需要即時反映下載進度百分比、已完成數量，並在全部完成後自動跳轉至照片瀏覽頁。

## Goals / Non-Goals

**Goals:**

- 實作 DownloadView StatelessWidget，提供下載進度的視覺化呈現
- 使用帶有 value 的 CircularProgressIndicator 顯示精確進度
- 顯示已完成數與總數的文字計數
- 區分下載中與下載完成兩種狀態文字
- 下載完成後自動導航至照片瀏覽頁
- 顯示失敗照片數量

**Non-Goals:**

- 不實作 ViewModel 邏輯（由 S020 負責）
- 不實作下載重試機制的 UI
- 不實作取消下載功能

## Decisions

### 圓形進度指示器

使用 `CircularProgressIndicator(value: viewModel.progress)` 顯示下載進度，`progress` 為 0.0 到 1.0 的浮點數。相較於不確定型態的進度指示器，帶有 value 的版本能讓使用者明確了解下載進度。

### 完成數與總數文字

使用 `Text('${viewModel.completed} / ${viewModel.total}')` 格式顯示數字計數，提供使用者精確的數量資訊。

### 下載狀態文字

根據 `viewModel.isDownloading` 布林值切換顯示「下載中...」或「下載完成」文字，簡潔傳達目前狀態。

### 失敗數量顯示

當 `viewModel.result` 不為 null 且 `result.isAllSuccessful` 為 false 時，額外顯示失敗照片數量文字，格式為「N 張下載失敗」。

### 自動導航至照片瀏覽頁

下載完成後自動使用 GoRouter 導航至照片瀏覽頁面，無需使用者手動操作。

## Risks / Trade-offs

- [取捨] 下載完成後自動導航，使用者無法停留在下載完成頁面檢視結果 → 失敗資訊可在後續頁面提供
- [風險] 大量照片下載時 UI 更新頻率可能過高 → ViewModel 層應控制更新節流
