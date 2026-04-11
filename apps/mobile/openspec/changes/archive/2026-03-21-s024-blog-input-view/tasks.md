## 1. URL text field rendered（URL 輸入框設計）

- [x] 1.1 在 `lib/ui/blog_input/widgets/blog_input_view.dart` 建立 `BlogInputView` StatelessWidget，使用 `context.watch<BlogInputViewModel>()` 監聽 ViewModel
- [x] 1.2 實作 TextField 元件，設定 labelText、hintText，並連接 `onChanged` 至 `viewModel.onUrlChanged`，完成 URL text field rendered

## 2. Fetch button with loading indicator（載入按鈕與進度指示器）

- [x] 2.1 實作 FilledButton，idle 狀態顯示「取得照片列表」文字，onPressed 綁定 `viewModel.fetchPhotos`
- [x] 2.2 實作 loading 狀態：當 `viewModel.isLoading` 為 true 時，按鈕 disabled 並顯示 CircularProgressIndicator(strokeWidth: 2)，完成 fetch button with loading indicator

## 3. Error message displayed（錯誤訊息顯示）

- [x] 3.1 當 `viewModel.errorMessage` 不為 null 時，在 TextField 下方顯示 error message displayed，文字顏色使用 `Theme.of(context).colorScheme.error`

## 4. Navigation on fetch result（導航至下載頁）

- [x] 4.1 監聽 `viewModel.fetchResult`，成功取得後透過 GoRouter 導航至下載頁面，完成 navigation on fetch result
