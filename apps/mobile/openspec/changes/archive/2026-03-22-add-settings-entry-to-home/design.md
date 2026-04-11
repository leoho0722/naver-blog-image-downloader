## Context

`SettingsView` 與 `/settings` 路由皆已實作完成，但 `BlogInputView` 的 `AppBar` 僅設定 `title`，未提供任何導航入口至設定頁面。使用者目前無法存取已完成的設定功能。

## Goals / Non-Goals

**Goals:**

- 在首頁 AppBar 右上角提供設定頁面的導航入口
- 以 modal bottom sheet 形式呈現設定頁面（帶圓角與導航列）
- SettingsView AppBar 右側顯示 close 按鈕，左側不顯示按鈕

**Non-Goals:**

- 不修改路由定義
- 不變更 AppBar 的其他行為或樣式

## Decisions

### 使用 modal bottom sheet 呈現設定頁面

在 `BlogInputView` 的 `AppBar.actions` 加入 `IconButton`（`Icons.settings`），點擊時透過 `showModalBottomSheet` 呈現 `SettingsView`。

設定參數：

- `isScrollControlled: true` — 允許 sheet 佔滿螢幕高度
- `useSafeArea: true` — 避免遮蔽狀態列
- `shape: RoundedRectangleBorder` — 左上、右上圓角 16
- `clipBehavior: Clip.antiAlias` — 裁切子 widget 使圓角生效

### SettingsView AppBar 調整為 close 按鈕

- `automaticallyImplyLeading: false` — 隱藏預設左側返回按鈕
- `actions` 加入 `IconButton(Icons.close)` — 右側 close 按鈕，呼叫 `Navigator.of(context).pop()`

選擇理由：

- Sheet 呈現方式符合 iOS 設計慣例
- 使用者可下滑關閉或點擊 close 按鈕關閉
- 不需要左側返回按鈕，因為 sheet 不是 push 導航

## Risks / Trade-offs

無顯著風險，修改範圍為兩個檔案。
