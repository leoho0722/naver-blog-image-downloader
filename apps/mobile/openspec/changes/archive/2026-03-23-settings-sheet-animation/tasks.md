## 1. 動畫配置類別

- [x] [P] 1.1 建立 `lib/config/bottom_sheet_animation.dart`，使用 `abstract final class BottomSheetAnimation` 集中管理動畫配置，包含 `createController` 靜態工廠方法（platform-specific animation controller factory），使用 `defaultTargetPlatform` 判斷平台並回傳對應時長的 `AnimationController`

## 2. BlogInputView 整合

- [x] [P] 2.1 修改 `_BlogInputViewState`：使用 `SingleTickerProviderStateMixin` 而非 `TickerProviderStateMixin`，在 `initState` 中建立 `_sheetAnimationController`，在 `dispose` 中於 `super.dispose()` 前釋放
- [x] 2.2 抽出 `_showSettingsSheet()` 私有方法，將 `showModalBottomSheet` 呼叫加入 `transitionAnimationController` 參數，更新 Settings navigation button in AppBar 的 `onPressed` 指向新方法

## 3. 驗證

- [x] 3.1 執行 `flutter analyze` + `dart format .` 確認無錯誤與格式問題
- [x] 3.2 執行 `flutter test` 確認既有測試無回歸
