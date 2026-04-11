## Context

專案目前 CI（`.github/workflows/ci.yml`）僅在 Ubuntu runner 上執行 Flutter test / analyze / format，原生端（iOS 16 個 Swift 檔、Android 13 個 Kotlin 檔）完全無測試覆蓋。兩端 ViewModel 透過 MethodChannel 與 Flutter 通訊，其中 Android `PhotoViewerViewModel` 直接依賴 `Activity`（用於建構 `PhotoService` 與呼叫 `finish()`），違反 MVVM 分層原則。iOS 端 ViewModel 內部直接建立 `PhotoService()`，雖無框架依賴問題，但不利於測試時替換。

## Goals / Non-Goals

**Goals:**

- 兩端 ViewModel 透過 `PhotoSaveable` 協議/介面注入儲存服務，解除對具體實作的耦合
- Android ViewModel 完全移除 `Activity` 參照，改用 `dismissAction` callback
- 為 `ThemeColors`、`PhotoFileInfo`、`PhotoViewerViewModel` 建立單元測試，覆蓋純邏輯與同步狀態
- CI 新增 iOS Native Test（macOS runner）與 Android Native Test（Ubuntu runner）平行 job

**Non-Goals:**

- 不測試 `PhotoService` 實作層（需真實裝置 API）
- 不測試 Channel 層（需 FlutterEngine）
- 不測試 View / UI 層
- 不引入 Robolectric（重構後 Android ViewModel 可純 JVM 測試）

## Decisions

### PhotoSaveable 協議/介面提取

兩端統一命名 `PhotoSaveable`，僅暴露 ViewModel 實際使用的方法：

- iOS：`protocol PhotoSaveable { func saveToGallery(filePath: String) async throws -> Bool }`
- Android：`interface PhotoSaveable { suspend fun saveToGallery(filePath: String, totalCount: Int = 1): Boolean }`

`PhotoService` 分別遵循/實作此抽象。ViewModel 建構子接受 `PhotoSaveable` 參數，測試時以 Fake 替代。

**替代方案**：直接將 `PhotoService` 作為可選參數注入（不抽介面）。放棄原因：Android 的 `PhotoService` 需 `Context`，無法在純 JVM 測試中建構。

### Android ViewModel 移除 Activity 依賴

將 `activity: Activity` 替換為兩個注入：
1. `photoSaveable: PhotoSaveable` — 取代 `PhotoService(activity)`
2. `dismissAction: (() -> Unit)?` — 取代 `activity.finish()`，對齊 iOS 已有的 `dismissAction` 模式

`PhotoViewerActivity.buildViewModel()` 負責建立 `PhotoService(this)` 並傳入 `dismissAction = { finish() }`。

### iOS 使用 Swift Testing 框架

iOS 端測試使用 Swift Testing（`import Testing`、`@Test`、`@Suite`、`#expect`），而非 XCTest。Swift Testing 是 Apple 自 Xcode 16 起推薦的現代測試框架，語法更簡潔、預設平行執行、與 Swift Concurrency 無縫整合。

既有 `RunnerTests` target 支援 Swift Testing（Xcode 16+ 同 target 可混用 XCTest 與 Swift Testing）。移除 placeholder `RunnerTests.swift`，新測試檔全部使用 Swift Testing。

### Android 使用 JUnit 6 + android-junit plugin

Android 端使用 JUnit 6.0.3（透過 `org.junit:junit-bom` BOM 管理版本），搭配 `de.mannodermaus.android-junit` plugin 2.0.1 啟用 JUnit Platform。ViewModel 測試另需 `kotlinx-coroutines-test` 提供 `TestScope`。

所有測試為純 JVM 單元測試（`src/test/`），透過 `./gradlew :app:testDebugUnitTest` 執行，不需模擬器。

### CI 拆為 3 個平行 job

| Job | Runner | 內容 |
|-----|--------|------|
| `flutter-validate` | `ubuntu-latest` | 既有 Flutter test + analyze + format（不變） |
| `ios-native-test` | `macos-latest` | Flutter pub get → pod install → xcodebuild test -only-testing RunnerTests |
| `android-native-test` | `ubuntu-latest` | Setup Java 25 → Flutter pub get → gradlew :app:testDebugUnitTest |

三個 job 無相依關係，平行執行。Path triggers 擴充加入 `ios/**` 與 `android/**`。

## Risks / Trade-offs

- **macOS runner 成本**：GitHub Actions macOS runner 計費約為 Linux 的 10 倍。對公開 repo 免費，私有 repo 需留意用量 → 可考慮僅在 PR 時觸發 iOS 測試
- **Compose `mutableStateOf` 在 JVM 測試中的行為**：Compose Runtime 為多平台函式庫，`mutableStateOf` 在純 JVM 測試中應可正常運作，但需在本機驗證 → 若失敗則改用 Robolectric 作為 fallback
- **`getPhotoViewerChannel()` 全域函式**：ViewModel 的 `save()` 與 `dismiss()` 呼叫此全域函式取得 MethodChannel。測試環境中回傳 `null`，`?.invokeMethod` 為 no-op，不影響狀態邏輯測試。未來可考慮將 channel 操作也抽為介面注入
