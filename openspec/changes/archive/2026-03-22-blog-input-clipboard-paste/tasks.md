## 1. URL 驗證工具類

- [x] 1.1 建立 `NaverUrlValidator` 工具類，實作 Validate Naver Blog URL format（URL 驗證提取為獨立工具類）
- [x] 1.2 新增 Unit Test 驗證合法/不合法 URL 案例

## 2. BlogInputView 基礎改造

- [x] 2.1 新增 TextEditingController for programmatic text control，`initState` 初始化 + `dispose` 釋放 + TextField 綁定
- [x] [P] 2.2 新增 Paste button as suffixIcon（貼上按鈕放在 TextField suffixIcon），讀取剪貼板 + 驗證 + 填入或提示
- [x] [P] 2.3 實作 Clipboard URL detection on app resume，mixin WidgetsBindingObserver（剪貼板偵測使用 WidgetsBindingObserver），偵測到 URL 後以 SnackBar 詢問，貼上不合法 URL 時顯示 AlertDialog

## 3. 驗證

- [x] 3.1 執行 `flutter analyze` + `dart format .`
- [x] 3.2 執行 `flutter test` 確認所有測試通過
