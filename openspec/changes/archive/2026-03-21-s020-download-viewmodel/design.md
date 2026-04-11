## Context

下載頁面在使用者確認照片清單後觸發批次下載。`DownloadViewModel` 繼承 `ChangeNotifier`，呼叫 `PhotoRepository.downloadAllToCache` 執行實際下載，並透過 `onProgress` 回呼即時更新進度狀態。下載完成後以 `DownloadBatchResult` 呈現最終結果。

## Goals / Non-Goals

**Goals:**

- 實作批次下載觸發與進度追蹤（completed/total/progress）
- 透過 `PhotoRepository.downloadAllToCache` 執行下載並接收進度回呼
- 管理 `isDownloading` 與 `result` 兩種核心 UI 狀態
- 計算下載進度百分比

**Non-Goals:**

- 不實作單張照片下載邏輯
- 不處理下載失敗的重試機制
- 不實作 UI Widget

## Decisions

### 進度追蹤回呼機制

`startDownload` 呼叫 `PhotoRepository.downloadAllToCache` 時，傳入 `onProgress` 回呼函式。每當一張照片下載完成，回呼更新 `_completed` 計數並呼叫 `notifyListeners()`，讓 UI 即時反映進度。

### Progress 計算邏輯

`progress` getter 以 `_completed / _total` 計算百分比（double 0.0~1.0）。當 `_total` 為 0 時回傳 0，避免除以零錯誤。

### 下載結果狀態管理

下載完成後，將 `DownloadBatchResult` 存入 `_result`。UI 層可根據 `result` 判斷是否所有照片都成功下載，或有部分失敗。

## Risks / Trade-offs

- [風險] 使用者在下載過程中離開頁面 → ViewModel 被 dispose 後回呼可能觸發已釋放的 notifyListeners → 由框架層級處理，ViewModel 本身不另設旗標檢查
- [取捨] 進度以照片張數而非位元組計算 → 簡化實作，但無法反映單張照片的下載進度
