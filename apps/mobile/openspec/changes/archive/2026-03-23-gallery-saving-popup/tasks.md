## 1. 修改 PhotoGalleryView

- [x] 1.1 使用 ViewModel listener 偵測 isSaving 狀態變化：在 `_PhotoGalleryViewState` 新增 `late final PhotoGalleryViewModel _viewModel` 欄位，在首次 `didChangeDependencies` 中取得參考並加入 listener，在 `dispose` 中移除 listener
- [x] 1.2 實作 saving progress popup dialog：新增 `_isSavingDialogOpen` 旗標與 `_onViewModelChanged` callback，當 `isSaving` 為 true 時以 `showDialog` 顯示不可關閉的 `AlertDialog`，為 false 時自動關閉
- [x] 1.3 移除 body 中的 isSaving 三元判斷：將 `Scaffold.body` 簡化為 `photos.isEmpty ? 空狀態 : GridView`

## 2. 驗證

- [x] 2.1 執行 `flutter analyze` + `dart format .` 確認無錯誤與格式問題
- [x] 2.2 執行 `flutter test` 確認既有測試無回歸
