## 1. PhotoSaveable 協議/介面提取

- [x] 1.1 實作 PhotoSaveable protocol and interface：新建 `ios/Runner/Services/PhotoSaveable.swift`（定義 `saveToGallery(filePath:) async throws -> Bool`）與 `android/.../services/PhotoSaveable.kt`（定義 `suspend fun saveToGallery(filePath:, totalCount:): Boolean`），並將 iOS/Android 的 `PhotoService` 分別遵循/實作此抽象

## 2. iOS PhotoViewerViewModel observable state 注入 PhotoSaveable + ViewModel save method 重構

- [x] 2.1 修改 PhotoViewerViewModel observable state：將 `private let photoService = PhotoService()` 改為 `private let photoSaveable: PhotoSaveable` 建構參數（`ios/Runner/Features/PhotoViewer/ViewModel/PhotoViewerViewModel.swift`）
- [x] 2.2 重構 ViewModel save method（iOS）：`save()` 方法改呼叫 `photoSaveable.saveToGallery(filePath:)`，保持 viewState 狀態轉換不變
- [x] 2.3 修改 `ios/Runner/Applications/Channels/Features/PhotoViewerChannel.swift`：在 `handleOpenViewer` 中建立 `PhotoService()` 並傳入 ViewModel 的 `photoSaveable` 參數
- [x] 2.4 將 `PhotoSaveable.swift` 加入 `ios/Runner.xcodeproj/project.pbxproj` 的 Runner target Sources build phase

## 3. Android ViewModel 移除 Activity 依賴（PhotoViewerViewModel compose state + ViewModel save method / ViewModel dismiss method 重構）

- [x] 3.1 重構 PhotoViewerViewModel compose state，Android ViewModel 移除 Activity 依賴：移除 `activity: Activity` 建構參數，新增 `photoSaveable: PhotoSaveable` 與 `dismissAction: (() -> Unit)?` 建構參數；移除 `private val photoService = PhotoService(activity)` 直接建立（`android/app/src/main/kotlin/.../viewmodel/PhotoViewerViewModel.kt`）
- [x] 3.2 重構 ViewModel save method（Android）：`save()` 改用 `photoSaveable.saveToGallery()`，保持 viewState 狀態轉換不變
- [x] 3.3 重構 ViewModel dismiss method：`dismiss()` 改用 `dismissAction?.invoke()` 取代 `activity.finish()`
- [x] 3.4 修改 PhotoViewerActivity with Compose（`android/app/src/main/kotlin/.../view/PhotoViewerActivity.kt`）：`buildViewModel()` 中建立 `PhotoService(this)` 作為 `photoSaveable` 傳入，設定 `dismissAction = { finish() }`，移除 `activity = this` 參數

## 4. iOS Swift Testing unit tests（iOS 使用 Swift Testing 框架）

- [x] 4.1 移除 `ios/RunnerTests/RunnerTests.swift` 中的 placeholder 內容（刪除檔案或清空為空白測試殼），準備實作 iOS Swift Testing unit tests
- [x] 4.2 新建 `ios/RunnerTests/ThemeColorsTests.swift`：使用 Swift Testing 框架（`import Testing`、`@Suite`、`@Test`、`#expect`），測試 ARGB 整數轉 UIColor（ThemeColors ARGB conversion verified + nil fallback）
- [x] 4.3 新建 `ios/RunnerTests/PhotoFileInfoTests.swift`：測試 `formattedFileSize`（< 1MB → KB、≥ 1MB → MB、邊界值 999999/1000000、0 bytes）與 `formattedDimensions`（PhotoFileInfo formatted file size）
- [x] 4.4 新建 `ios/RunnerTests/PhotoViewerViewModelTests.swift`：建立 `MockBinaryMessenger`（實作 FlutterBinaryMessenger）與 `FakePhotoSaveable`（實作 PhotoSaveable），測試 PhotoViewerViewModel initial state 與 onPageChanged resets state
- [x] 4.5 將新建的 3 個測試檔註冊至 `ios/Runner.xcodeproj/project.pbxproj` 的 RunnerTests target（PBXBuildFile、PBXFileReference、PBXGroup、Sources build phase）

## 5. Android JUnit 6 unit tests 依賴設定與單元測試（Android 使用 JUnit 6 + android-junit plugin）

- [x] 5.1 設定 Android JUnit 6 unit tests 依賴：修改 `android/settings.gradle.kts` 加入 `id("de.mannodermaus.android-junit") version "2.0.1" apply false`；修改 `android/app/build.gradle.kts` 加入 plugin + JUnit BOM + coroutines-test
- [x] 5.2 新建 `android/app/src/test/.../model/ThemeColorsTest.kt`：測試 `fromArgb()` 轉換後 RGBA 分量與 data class equality/copy（ThemeColors fromArgb conversion verified）
- [x] 5.3 新建 `android/app/src/test/.../model/PhotoFileInfoTest.kt`：測試 `formattedFileSize`（< 1MB → KB、≥ 1MB → MB、邊界值）、`formattedDimensions`、data class equality/copy（PhotoFileInfo formatted file size）
- [x] 5.4 新建 `android/app/src/test/.../viewmodel/PhotoViewerViewModelTest.kt`：建立 `FakePhotoSaveable`（實作 PhotoSaveable）與 `TestScope`，測試 PhotoViewerViewModel initial state、onPageChanged resets state、dismiss 觸發 dismissAction

## 6. CI native test jobs 工作流重構（CI 拆為 3 個平行 job）

- [x] 6.1 設定 CI native test jobs：修改 `.github/workflows/ci.yml`，將現有 `validate` job 改名為 `flutter-validate`；path triggers 擴充加入 `naver_blog_image_downloader/ios/**` 與 `naver_blog_image_downloader/android/**`
- [x] 6.2 新增 `ios-native-test` job（macOS runner）：Checkout → Setup Flutter + pub get → pod install → `xcodebuild test -workspace Runner.xcworkspace -scheme Runner -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' -only-testing RunnerTests | xcpretty`
- [x] 6.3 新增 `android-native-test` job（Ubuntu runner）：Checkout → Setup Java 25 (Temurin) → Setup Flutter + pub get → `cd android && ./gradlew :app:testDebugUnitTest`

## 7. 本機驗證

- [x] 7.1 iOS：執行 `xcodebuild test -only-testing RunnerTests`，確認所有 Swift Testing 測試通過
- [x] 7.2 Android：執行 `./gradlew :app:testDebugUnitTest`，確認所有 JUnit 6 測試通過
- [x] 7.3 Flutter：執行 `flutter test`，確認既有測試不受影響
