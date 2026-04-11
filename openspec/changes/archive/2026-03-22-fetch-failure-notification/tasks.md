## 1. Model 層

- [x] [P] 1.1 FetchResult 新增 fetchErrors 欄位：`fetch_result.dart` 新增 `fetchErrors` 屬性（FetchResult class defined），預設值 `const []`

## 2. Repository 層

- [x] 2.1 `photo_repository.dart` 的 `fetchPhotos` 在 completed 分支將 `response.errors` 帶入 FetchResult（Result wrapping）

## 3. View 層

- [x] 3.1 `blog_input_view.dart` 在 `_handleFetchResult` 中新增 fetch failure warning dialog（在 BlogInputView 顯示警告對話框），fetchErrors 非空時顯示警告，使用者可選擇繼續或取消

## 4. 測試與驗證

- [x] [P] 4.1 更新 `photo_repository_test.dart`：驗證 fetchErrors 正確帶入 FetchResult
- [x] [P] 4.2 更新 `blog_input_view_model_test.dart`：FetchResult 建構式補上 `fetchErrors` 參數（若有使用）
- [x] 4.3 執行 `flutter analyze` + `dart format .` + `flutter test` 確認無問題
