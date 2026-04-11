## Context

專案經 Flutter 官方規範合規審查後，發現 3 個 runtime bug、2 個安全隱患及 5 個最佳實踐違規。變更涵蓋 Repository、ViewModel、View、DI 與 lint 配置等多層。所有修改皆為既有行為的修正或改善，不影響外部 API 或使用者介面。

## Goals / Non-Goals

**Goals:**

- 修正並行下載池的信號量 dead code 與 race condition
- 修正 `BlogCacheMetadata.blogUrl` 儲存錯誤的 photo URL
- 消除 `FutureBuilder` 在 `build()` 中建立新 Future 的反模式
- 修正 `dispose()` 中 `context.read` 可能拋出例外的安全問題
- 補上缺少的 `mounted` 檢查
- 統一錯誤型別為 `AppError`
- 簡化 DI 配置
- 強化 lint 規則

**Non-Goals:**

- 不新增功能或變更使用者介面
- 不重構整體架構（仍維持 MVVM + Provider）
- 不處理 GoRouter `extra` 的序列化問題（iOS/Android 限定，無需 web deep linking）

## Decisions

### 並行下載改用 counter-based 信號量

以 `running` 計數器 + `Completer<void>` 佇列取代原本的 `Future.any` + `removeWhere` 模式。原實作中 `active.removeWhere((f) => f == Future.value())` 為 dead code（Future 以 reference 比對），且 `future.then` 清理與 `Future.any` 存在 race condition。

**替代方案**：引入 `pool` 套件的 `Pool` 類別 → 不採用，避免為單一用途新增外部依賴。

### FetchResult 新增 blogUrl 欄位

`downloadAllToCache` 的 `BlogCacheMetadata.blogUrl` 必須為原始 Blog URL，而非 photo URL。由 `fetchPhotos` 傳入，沿 `FetchResult → DownloadViewModel.startDownload → downloadAllToCache` 傳遞。

### PhotoGalleryViewModel 預先解析快取檔案

新增 `cachedFiles` (Map<String, File?>) 屬性，在 `load()` 中一次性解析所有快取檔案。View 改為同步讀取 map，移除 `FutureBuilder`。

**替代方案**：在 View State 中快取 Future map → 不採用，將狀態邏輯留在 ViewModel 更符合 MVVM 原則。

### BlogInputView 預存 ViewModel 引用

在 `initState` 中以 `late final` 儲存 ViewModel 引用，`dispose()` 使用該引用移除 listener，避免 `context.read` 在 widget 已卸載時拋出例外。

### ChangeNotifierProxyProvider 改為 ChangeNotifierProvider

五個 ViewModel 的 `update` callback 皆為 `(_, repo, vm) => vm!`（no-op），表示依賴在建構後不會變動。改用 `ChangeNotifierProvider` 即可，更簡潔且語意正確。

### AppErrorType 擴充

新增 `timeout`、`gallery`、`serverError` 三個列舉值，覆蓋 `photo_repository.dart` 與 `gallery_service.dart` 中目前使用 generic `Exception` 的情境。

### 強化 lint 規則

啟用 `use_build_context_synchronously`、`unawaited_futures`、`prefer_const_constructors`、`prefer_const_literals_to_create_immutables`，可自動捕捉 `mounted` 遺漏與 `const` 最佳化。

## Risks / Trade-offs

- [Risk] `PhotoGalleryViewModel.load()` 改為 async 後，首次載入時 `cachedFiles` 為空 map → 在 `notifyListeners()` 觸發前 View 顯示 placeholder，行為與原 `FutureBuilder` snapshot 初始狀態一致
- [Risk] 啟用 `prefer_const_constructors` 可能產生大量 lint warning → 以 `dart fix --apply` 批次修正
- [Risk] `downloadAllToCache` 新增 `blogUrl` 參數為 breaking change → 僅內部使用，所有呼叫端（`DownloadViewModel`）同步更新
