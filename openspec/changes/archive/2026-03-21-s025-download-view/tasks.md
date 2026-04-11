## 1. Circular progress indicator with value（圓形進度指示器）

- [x] 1.1 在 `lib/ui/download/widgets/download_view.dart` 建立 `DownloadView` StatelessWidget，使用 `context.watch<DownloadViewModel>()` 監聯 ViewModel
- [x] 1.2 實作 CircularProgressIndicator，綁定 `value: viewModel.progress`，完成 circular progress indicator with value

## 2. Completed count and total count text（完成數與總數文字）

- [x] 2.1 實作 Text 元件，顯示 `'${viewModel.completed} / ${viewModel.total}'` 格式的 completed count and total count text

## 3. Download status text（下載狀態文字）

- [x] 3.1 根據 `viewModel.isDownloading` 切換顯示 download status text：「下載中...」或「下載完成」

## 4. Failed count display（失敗數量顯示）

- [x] 4.1 當 `viewModel.result` 不為 null 且非全部成功時，顯示 failed count display：「N 張下載失敗」

## 5. Auto-navigation on completion（自動導航至照片瀏覽頁）

- [x] 5.1 監聽下載完成狀態，透過 GoRouter 實作 auto-navigation on completion，導航至照片瀏覽頁面
