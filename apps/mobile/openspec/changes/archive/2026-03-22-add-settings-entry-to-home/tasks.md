## 1. 使用 modal bottom sheet 呈現設定頁面（Settings navigation button in AppBar）

- [x] 1.1 在 `BlogInputView` 的 `AppBar.actions` 加入 `IconButton`（`Icons.settings`），點擊時透過 `showModalBottomSheet` 以 sheet 形式呈現 `SettingsView`（圓角、clipBehavior）

## 2. SettingsView AppBar 調整為 close 按鈕（AppBar close button without back navigation）

- [x] 2.1 設定 `automaticallyImplyLeading: false` 隱藏左側按鈕，`actions` 加入 `IconButton(Icons.close)` 呼叫 `Navigator.of(context).pop()`

## 3. 驗證

- [x] 3.1 確認首頁 AppBar 右上角出現齒輪圖示，點擊後以 sheet 呈現設定頁面，sheet 有圓角，右上有 close 按鈕，可下滑或點擊 close 關閉
