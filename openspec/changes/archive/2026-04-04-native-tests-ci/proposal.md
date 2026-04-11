## Why

專案已大量使用原生程式碼（iOS 16 個 Swift 檔、Android 13 個 Kotlin 檔）透過 MethodChannel 實作相簿存取與原生圖片檢視器，但目前 CI 只驗證 Flutter Dart 層，原生端完全無測試覆蓋。需要新增原生單元測試並整合至 CI，確保原生程式碼品質。此外，Android `PhotoViewerViewModel` 直接依賴 `Activity`，違反 MVVM 架構，需一併重構。

## What Changes

- 提取 `PhotoSaveable` 協議（iOS）/ 介面（Android），讓 ViewModel 透過抽象依賴注入 `PhotoService`，而非直接建立
- Android `PhotoViewerViewModel` 移除 `Activity` 建構參數，改用 `dismissAction` callback + 注入 `PhotoSaveable`
- iOS `PhotoViewerViewModel` 將內部 `PhotoService()` 改為外部注入 `PhotoSaveable`
- 新增 iOS Swift Testing 單元測試：`ThemeColors`、`PhotoFileInfo`、`PhotoViewerViewModel` 同步狀態邏輯（使用 `@Test` + `#expect` 巨集）
- 新增 Android JUnit 6 單元測試：`ThemeColors`、`PhotoFileInfo`、`PhotoViewerViewModel` 同步狀態邏輯
- CI 工作流從單一 Flutter job 拆為 3 個平行 job：Flutter Validation、iOS Native Test（macOS runner）、Android Native Test（Ubuntu runner）
- Android 新增 JUnit 6（`org.junit:junit-bom:6.0.3`）+ `de.mannodermaus.android-junit` plugin 2.0.1 + `kotlinx-coroutines-test` 依賴

## Non-Goals

- 不測試 `PhotoService` 實作層（依賴 PhotoKit / MediaStore，需真實裝置或模擬器）
- 不測試 `GalleryChannel` / `PhotoViewerChannel`（依賴 FlutterEngine / BinaryMessenger）
- 不測試 View / UI 層（SwiftUI / Jetpack Compose 需 UI Test 框架）
- 不新增 Robolectric（重構後 Android ViewModel 可純 JVM 測試）

## Capabilities

### New Capabilities

- `native-test-infra`: 原生程式碼測試基礎設施，包含 iOS Swift Testing 與 Android JUnit 6 測試設定、CI 整合

### Modified Capabilities

- `native-photo-viewer-ios`: `PhotoViewerViewModel` 改為透過 `PhotoSaveable` 協議注入 `PhotoService`
- `native-photo-viewer-android`: `PhotoViewerViewModel` 移除 `Activity` 依賴，改用 `PhotoSaveable` 介面注入 + `dismissAction` callback
- `gallery-service`: `PhotoService` 實作 `PhotoSaveable` 協議/介面

## Impact

- 新建檔案：
  - `ios/Runner/Services/PhotoSaveable.swift`
  - `ios/RunnerTests/ThemeColorsTests.swift`
  - `ios/RunnerTests/PhotoFileInfoTests.swift`
  - `ios/RunnerTests/PhotoViewerViewModelTests.swift`
  - `android/app/src/main/kotlin/.../services/PhotoSaveable.kt`
  - `android/app/src/test/kotlin/.../model/ThemeColorsTest.kt`
  - `android/app/src/test/kotlin/.../model/PhotoFileInfoTest.kt`
  - `android/app/src/test/kotlin/.../viewmodel/PhotoViewerViewModelTest.kt`
- 修改檔案：
  - `ios/Runner/Services/PhotoService.swift`（遵循 PhotoSaveable）
  - `ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift`（注入 PhotoSaveable）
  - `ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift`（傳入 PhotoService）
  - `ios/RunnerTests/RunnerTests.swift`（移除 placeholder）
  - `ios/Runner.xcodeproj/project.pbxproj`（註冊測試檔）
  - `android/app/src/main/kotlin/.../services/PhotoService.kt`（實作 PhotoSaveable）
  - `android/app/src/main/kotlin/.../viewmodel/PhotoViewerViewModel.kt`（移除 Activity）
  - `android/app/src/main/kotlin/.../view/PhotoViewerActivity.kt`（注入依賴）
  - `android/settings.gradle.kts`（加 android-junit plugin）
  - `android/app/build.gradle.kts`（apply plugin + JUnit 6 + coroutines-test）
  - `.github/workflows/ci.yml`（拆 3 job + 加原生測試）
