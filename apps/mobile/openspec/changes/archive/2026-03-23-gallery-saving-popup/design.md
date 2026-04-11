## Context

`PhotoGalleryView` 在儲存照片至相簿時，`isSaving` 為 true 會將整個 `Scaffold.body` 替換為 `CircularProgressIndicator`，使照片網格完全消失。現有 `photo-gallery-view` spec 未定義 `isSaving` 時的 UI 行為。

專案中已有類似的 popup dialog 模式可參考：`BlogInputView` 使用 ViewModel listener 偵測狀態變化後顯示 dialog，`DownloadDialog` 以 `AlertDialog` + `CircularProgressIndicator` 呈現進度。

## Goals / Non-Goals

**Goals:**

- 儲存過程中以 popup dialog 呈現進度，保持照片網格可見
- dialog 不可被使用者手動關閉（`barrierDismissible: false`）
- 儲存完成後 dialog 自動關閉

**Non-Goals:**

- 不修改 `PhotoGalleryViewModel` 的 `isSaving` 邏輯
- 不顯示儲存進度百分比（ViewModel 未提供）
- 不加入取消儲存功能

## Decisions

### 使用 ViewModel listener 偵測 isSaving 狀態變化

在 `_PhotoGalleryViewState` 中加入 listener 監聽 ViewModel 變化。當 `isSaving` 從 false 變為 true 時呼叫 `showDialog`；從 true 變為 false 時呼叫 `Navigator.of(context).pop()`。使用 `_isSavingDialogOpen` 旗標追蹤 dialog 狀態，避免重複開啟或關閉。

**替代方案：** 在 `build` 方法中使用 `Stack` + `Overlay` 疊加 loading UI。不採用原因：與專案現有 dialog 模式不一致（`BlogInputView`、`DownloadDialog` 均使用 listener + `showDialog`），且 `showDialog` 自帶 barrier 遮罩更符合 UX 預期。

### 移除 body 中的 isSaving 三元判斷

將 body 簡化為 `photos.isEmpty ? 空狀態 : GridView`，讓網格始終根據 photos 狀態呈現。dialog 層由 listener 獨立管理，與 build 解耦。

## Risks / Trade-offs

- **[風險] dialog 與 isSaving 狀態不同步** → 緩解：使用 `_isSavingDialogOpen` 旗標追蹤，且在 `dispose` 中不需額外關閉（dialog 會隨 Navigator stack 自動清理）
- **[風險] 快速連點儲存按鈕導致重複 dialog** → 緩解：`_isSavingDialogOpen` 旗標確保同一時間只開一個 dialog；且 ViewModel 在 `isSaving` 為 true 時按鈕已 disabled
